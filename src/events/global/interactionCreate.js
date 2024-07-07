/* eslint-disable no-mixed-spaces-and-tabs */
const Event = require('../../structures/EventClass');

const { InteractionType } = require('discord.js');
const User = require('../../schema/user');

module.exports = class InteractionCreate extends Event {
	constructor(client) {
		super(client, {
			name: 'interactionCreate',
			category: 'interaction',
		});
	}

	async run(interaction) {
		const client = this.client;

		if (interaction.type === InteractionType.ApplicationCommand) {
			const command = client.commands.get(interaction.commandName);

			if (interaction.user.bot) return;
			if (!interaction.inGuild() && interaction.type === InteractionType.ApplicationCommand) return interaction.reply({ content: 'You must be in a server to use commands.' });

			if (!command) return interaction.reply({ content: 'This command is unavailable. *Check back later.*', ephemeral: true }) && client.commands.delete(interaction.commandName);
			try {
				await command.run(client, interaction);

				const user = await User.findOne({ userID: interaction.user.id });

				if (user) {
				  user.commandRun += 1;
				  await user.save();
				}
				else {
				  const newUser = new User({
						userID: interaction.user.id,
						commandRun: 1,
						afk: null,
						experience: 0,
						level: 1,
				  });
				  await newUser.save();
				}

				console.log(`[INFO] Command Executed: ${command.name}`);
			}
			catch (e) {
				console.log(e);
				return interaction.followUp({ content: `An error has occurred.\n\n**\`${e.message}\`**` });
			}
		}
	}
};
