import { PermissionResolvable } from "discord.js";

const DESCRIPTIONS = /(\/\*([^*]|\*(?!\/))+\*\/)\s*(\w+),?\s*/g;

export function Command(name: string, options: CommandOptions) {
    return function (target) {
        Reflect.defineMetadata("commando:info", { name, options }, target);
    }
}

export function Subcommand(description: string) {
    return function (target, propertyKey) {
        Reflect.defineMetadata("commando:info", description, target, propertyKey);

        const BLOCK = /\w+([^)]+)\)(.*)/g;
        const method: Function = target[propertyKey];

        if (!(method instanceof Function))
            throw new Error("Tried to mark non-function as subcommand");

        const src = method.toString().replace(BLOCK.exec(method.toString())[2], "");
        const matches = Array.from(src.matchAll(DESCRIPTIONS));
        const parameters = {};

        for (const match of matches) {
            const [, description,, name] = match;

            parameters[name] = description.replace(/(\/\*\s*|\s+\*\/)/g, "");
        }

        Reflect.defineMetadata("commando:descriptions", parameters, target, propertyKey);
    }
}

export type CommandOptions = {
    description: string;
    examples: string[];
    permissions?: PermissionResolvable[];
}
