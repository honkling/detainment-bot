import { CommandInteraction } from "discord.js";
import { Command, Subcommand } from "../../manager/decorators";

@Command("players", {
	description: "View online players.",
	examples: []
})
export class Players {
	@Subcommand("View online players.")
	public players(i: CommandInteraction) {}
}