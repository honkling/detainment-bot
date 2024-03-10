import { CommandInteraction } from "discord.js";
import "reflect-metadata";
import { Command, Subcommand } from "../manager/decorators";

@Command("test", { description: "Test command", examples: ["a:hello b:123"] })
export class Test {
	@Subcommand("test")
	public test(i: CommandInteraction, a: string, b: number) {

	}
}