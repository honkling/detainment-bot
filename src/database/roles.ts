import { Role } from "discord.js";
import { execute, query } from "./database";
import { client } from "..";
import { config } from "../config";

execute(`CREATE TABLE IF NOT EXISTS roles(
	id TEXT NOT NULL PRIMARY KEY UNIQUE
)`);

export async function getRoles(): Promise<Role[]> {
	const guild = await client.guilds.fetch(config.guild);

	return await Promise.all(query(`SELECT id FROM roles;`)
		.map(async (r) => guild.roles.fetch(r["id"] as string)));
}

export function addRole(role: Role) {
	execute(`INSERT OR REPLACE INTO roles(id) VALUES(?)`, role.id);
}

export function removeRole(role: Role) {
	execute(`REMOVE FROM roles WHERE id = ?`, role.id);
}