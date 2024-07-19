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
					// Increment the command usage count
					user.commandRun += 1;
					const commandCount = user.commands.get(command.name) || 0;
					user.commands.set(command.name, commandCount + 1);

					// Determine if the current command is the most used
					const mostUsedCommand = Array.from(user.commands.entries()).reduce((max, [key, value]) => value > max[1] ? [key, value] : max, [user.mostUsedCommand, 0]);
					user.mostUsedCommand = mostUsedCommand[0];
					await user.save();
				}
				else {
					// If user does not exist, create a new user entry
					const newUser = new User({
						userID: interaction.user.id,
						commandRun: 1,
						afk: null,
						experience: 0,
						level: 1,
						commands: { [command.name]: 1 },
						mostUsedCommand: command.name,
					});
					await newUser.save();
				}

				console.log(`[${new Date().toString().split(' ', 5).join(' ')}][INFO] Command Executed: ${command.name}`);
			}
			catch (e) {
				console.log(e);
				return interaction.followUp({ content: `An error has occurred.\n\n**\`${e.message}\`**` });
			}
		}
	}
};
