import { Client } from "discord.js";
import { logger } from "./logger/logger";
import { config } from "./config";

const client = new Client({ intents: [] });

client.on("ready", () => {
	logger.log("<fg_green>Ready.");
});

client.login(config.token);