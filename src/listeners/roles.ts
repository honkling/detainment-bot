import { ButtonInteraction, GuildMember } from "discord.js";
import { client } from "..";

client.on("interactionCreate", async (interaction) => {
	if (!interaction.isButton() || !interaction.customId.startsWith("role_"))
		return;

	const i = interaction as ButtonInteraction;
	const id = i.customId.substring(5);
	const name = i.component.label;
	const member = interaction.member as GuildMember;
	const shouldRemove = member.roles.cache.some((r) => r.id === id);

	if (shouldRemove)
		await member.roles.remove(id);
	else await member.roles.add(id);

	await interaction.reply({ content: `${shouldRemove ? "Removed" : "Added"} the \`${name}\` role.`, ephemeral: true });
});