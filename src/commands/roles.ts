import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, Role, TextBasedChannel } from "discord.js";
import { addRole, getRoles, removeRole } from "../database/roles";
import { Command, Subcommand } from "../manager/decorators";

@Command("roles", {
	description: "Manage button roles.",
	examples: ["add role:@Features", "deploy"],
	permissions: ["ManageGuild", "ManageRoles"]
})
export class Roles {
	@Subcommand("Add a role.")
	public async add(
		i: CommandInteraction,
		/* The role to add. */ role: Role
	) {
		addRole(role);
		await i.reply({ content: `Added the \`@${role.name}\` role.` });
	}

	@Subcommand("Remove a role.")
	public async remove(
		i: CommandInteraction,
		/* The role to remove. */ role: Role
	) {
		removeRole(role);
		await i.reply({ content: `Removed the \`@${role.name}\` role.` });
	}

	@Subcommand("Send a message for roles.")
	public async deploy(i: CommandInteraction) {
		const roles = await getRoles();
		const channel = await i.guild.channels.fetch(i.channelId) as TextBasedChannel;
		const buttons = roles.map((r) => new ButtonBuilder()
			.setLabel(`@${r.name}`)
			.setCustomId(`role_${r.id}`)
			.setStyle(ButtonStyle.Primary));

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons);
		await channel.send({ content: "Click a role to acquire it.", components: [row] });
		await i.reply({ content: `Deployed the roles.`, ephemeral: true });
	}
}