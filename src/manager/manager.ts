import { readdirSync, statSync } from "fs";
import { join } from "path";
import "reflect-metadata";
import { ApplicationCommandData, ApplicationCommandOptionType, ApplicationCommandSubCommandData, ApplicationCommandType, BaseApplicationCommandOptionsData, Client, REST, Routes } from "discord.js";
import { CommandOptions } from "./decorators";
import { getParameters } from "./lib";
import { logger } from "../logger/logger";

export class CommandManager {
    public commands: Map<string, [Object, Map<string, Function>]> = new Map();

    constructor(private instance: Client) {}

    public async registerCommands(directory: string, register: boolean = true): Promise<any[]> {
        const rest = new REST().setToken(this.instance.token);
        const files = readdirSync(directory);
        const parsedCommands = [];

        for (const file of files) {
            const path = join(directory, file);

            if (statSync(path).isDirectory()) {
                parsedCommands.push(...await this.registerCommands(path, false));
                continue;
            }

            const commands = await require(path);

            for (const command of Object.values(commands)) {
                if (!(command instanceof Function) || !Reflect.hasMetadata("commando:info", command))
                    continue;

                const { name, options } = Reflect.getMetadata("commando:info", command) as { name: string, options: CommandOptions };
                const instance = new (command as any)();
                const subcommands = Reflect.ownKeys(Object.getPrototypeOf(instance)).filter((m) => m !== "constructor").map((m) => instance[m]);
                const parsedOptions = [];

                const lowerName = name.toLowerCase();
                if (this.commands.has(lowerName))
                    throw new Error("Tried to register a duplicate command.");

                this.commands.set(lowerName, [instance, new Map()]);

                if (subcommands.includes(name) && subcommands.length > 1)
                    throw new Error("Tried to register a command with default parameters and subcommands.");

                for (const subcommand of subcommands) {
                    if (!Reflect.getMetadata("design:paramtypes", instance, subcommand.name === name ? name : subcommand.name))
                        continue;

                    this.commands.get(lowerName)[1].set(subcommand.name.toLowerCase(), subcommand);

                    if (subcommand.name === name) {
                        parsedOptions.push(...this.parseParameters(instance, name));
                        break;
                    }

                    parsedOptions.push({
                        type: ApplicationCommandOptionType.Subcommand,
                        name: subcommand.name,
                        description: Reflect.getMetadata("commando:info", instance, subcommand.name),
                        options: this.parseParameters(instance, subcommand.name)
                    } as unknown as ApplicationCommandSubCommandData);
                }

                parsedCommands.push({
                    name,
                    description: options.description,
                    type: ApplicationCommandType.ChatInput,
                    defaultMemberPermissions: options.permissions ?? [],
                    options: parsedOptions
                } as ApplicationCommandData);
            }
        }

        if (register)
			await rest.put(Routes.applicationCommands(this.instance.application.id), { body: parsedCommands });
		
		return parsedCommands;
    }

    public registerEvents() {
        this.instance.on("interactionCreate", async (interaction) => {
            if (!interaction.isChatInputCommand())
                return;

            const { commandName } = interaction;

            if (!this.commands.has(commandName))
                return;

            const [instance, subcommands] = this.commands.get(commandName);
            const subcommand = interaction.options.getSubcommand(false) ?? commandName;
            const method = subcommands.get(subcommand);
            const order = getParameters(method).slice(1);
            const params: any[] = [interaction];

            for (const param of order) {
                const wrappedValue = interaction.options.get(param, false);

                if (!wrappedValue) {
                    params.push(null);
                    continue;
                }

                let value: any = wrappedValue.value ?? wrappedValue;

                switch (wrappedValue.type) {
                    case ApplicationCommandOptionType.User:
                        value = this.instance.users.cache.get(value) ?? await this.instance.users.fetch(value);
                        break;
                    case ApplicationCommandOptionType.Channel:
                        value = interaction.guild.channels.cache.get(value) ?? await interaction.guild.channels.fetch(value);
                        break;
                    case ApplicationCommandOptionType.Role:
                        value = interaction.guild.roles.cache.get(value) ?? await interaction.guild.roles.fetch(value);
                        break;
                }

                params.push(value);
            }

            try {
                method.apply(instance, params);
            } catch (e) {
                logger.error(e);
            }
        });
    }

    private parseParameters(instance, name): BaseApplicationCommandOptionsData[] {
        const names = getParameters(instance[name]).slice(1);
        const types = Reflect.getMetadata("design:paramtypes", instance, name).slice(1);
        const descriptions = Reflect.getMetadata("commando:descriptions", instance, name);
        const parameters = names.map((name, index) => {
            return {
                name,
                type: types[index]
            }
        });

        return parameters.map(({ name, type }) => {
            if (ApplicationCommandOptionType[type.name] === undefined || type.name === "Subcommand" || type.name === "SubcommandGroup")
                throw new Error("Passed an unsupported parameter to a subcommand.");

            const comment = (descriptions[name] ?? `The ${name}`) as string;
            const description = comment.replace(/@(optional|complete)/g, "")

            return {
                name,
                type: ApplicationCommandOptionType[type.name],
                description: description.trim().length < 1 ? `The ${name}` : description,
                required: !comment.includes("@optional"),
				autocomplete: comment.includes("@complete")
            } as unknown as BaseApplicationCommandOptionsData;
        });
    }
}
