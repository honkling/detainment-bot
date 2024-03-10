import { readFileSync } from "fs";
import { parse } from "toml";
import { join } from "path";
import { logger } from "./logger/logger";

const configFile = join(__dirname, "../config.toml");

export const Config = {
	token: "",
	guild: ""
}

export function reloadConfig(): typeof Config {
	const contents = readFileSync(configFile, "utf8");
	config = parse(contents);

	validate("", Config, config);

	return config as typeof Config;
}

function validate(base: string, struct: any, impl: any) {
	for (const [key, value] of Object.entries(struct)) {
		if (!impl[key])
			logger.error(`Missing key '${base}${key}' in config`);

		if (typeof value === "object")
			validate(`${base}${key}.`, value, impl[key]);
	}
}

export let config = reloadConfig();