import { Client } from "discord.js";
import { logger } from "./logger/logger";
import { config } from "./config";
import { CommandManager } from "./manager/manager";
import { join } from "path";
import { loadFiles } from "./lib/files";

export const client = new Client({ intents: [] });

client.on("ready", async () => {
	logger.log("<fg_green>Ready.");

	const manager = new CommandManager(client);
	manager.registerCommands(join(__dirname, "commands/"));
	manager.registerEvents();

	await loadFiles(join(__dirname, "listeners/"));

	const guild = await client.guilds.fetch(config.guild);
	await guild.roles.fetch();
});

client.login(config.token);