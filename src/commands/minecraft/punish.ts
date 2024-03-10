import { CommandInteraction } from "discord.js";
import { Command, Subcommand } from "../../manager/decorators";

@Command("punish", {
	description: "Punish players in Minecraft",
	examples: ["username:Notch offense:COMMUNITY_DISRUPTION"],
	permissions: ["BanMembers"]
})
export class Punish {
	@Subcommand("Punish players in Minecraft")
	public punish(
		i: CommandInteraction,
		/* The Minecraft username of the offender. */ username: string,
		/* @complete The punishment reason. */ offense: string
	) {}
}