/* eslint-disable no-unused-vars */
/* eslint-disable no-unreachable */
const Command = require('../../structures/CommandClass');

const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('@discordjs/builders');

const { get } = require('node-superfetch');

module.exports = class Action extends Command {
	constructor(client) {
		super(client, {
			data: new SlashCommandBuilder()
				.setName('action')
				.setDescription('[Holo| Action] Action command to interact with other users')
				.setDMPermission(true)
				.addSubcommand(subcommand => subcommand
					.setName('cry')
					.setDescription('[Holo| Action] Express yourself crying')
					.addStringOption(option => option
						.setName('message')
						.setDescription('Message you want to add when cuddling someone'),
					),
				)
				.addSubcommand(subcommand => subcommand
					.setName('cuddle')
					.setDescription('[Holo| Action] Cuddle a user')
					.addUserOption(option => option
						.setName('user')
						.setDescription('The user you want to cuddle')
						.setRequired(true),
					)
					.addStringOption(option => option
						.setName('message')
						.setDescription('Message you want to add when cuddling someone'),
					),
				)
				.addSubcommand(subcommand => subcommand
					.setName('hug')
					.setDescription('[Holo| Action] Hug a user')
					.addUserOption(option => option
						.setName('user')
						.setDescription('The user you want to hug')
						.setRequired(true),
					)
					.addStringOption(option => option
						.setName('message')
						.setDescription('Message you want to add when hugging someone'),
					),
				)
				.addSubcommand(subcommand => subcommand
					.setName('pat')
					.setDescription('[Holo| Action] Pat a user')
					.addUserOption(option => option
						.setName('user')
						.setDescription('The user you want to pat')
						.setRequired(true),
					)
					.addStringOption(option => option
						.setName('message')
						.setDescription('Message you want to add when patting someone'),
					),
				)
				.addSubcommand(subcommand => subcommand
					.setName('stare')
					.setDescription('[Holo| Action] Stare at someone')
					.addUserOption(option => option
						.setName('user')
						.setDescription('The user you want to stare at')
						.setRequired(true),
					)
					.addStringOption(option => option
						.setName('message')
						.setDescription('Message you want to add when staring at someone'),
					),
				)
				.addSubcommand(subcommand => subcommand
					.setName('tickle')
					.setDescription('[Holo| Action] Tickle someone')
					.addUserOption(option => option
						.setName('user')
						.setDescription('The user you want to tickle')
						.setRequired(true),
					)
					.addStringOption(option => option
						.setName('message')
						.setDescription('Message you want to add when tickling someone'),
					),
				)
			// .addSubcommand(subcommand => subcommand
			//     .setName('poke')
			//     .setDescription('[Holo|Action] Poke someone')
			//     .addUserOption(option => option
			//         .setName('user')
			//         .setDescription('The user you want to poke')
			//         .setRequired(true),
			//     )
			//     .addStringOption(option => option
			//         .setName('message')
			//         .setDescription('Message you want to add when poking someone'),
			//     ),
			// )
				.addSubcommand(subcommand => subcommand
					.setName('slap')
					.setDescription('[Holo| Action] Slap someone')
					.addUserOption(option => option
						.setName('user')
						.setDescription('The user you want to slap')
						.setRequired(true),
					)
					.addStringOption(option => option
						.setName('message')
						.setDescription('Message you want to add when slapping someone'),
					),
				),
			usage: '/action',
			category: 'Image',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
			hidden: false,
		});
	}

	async run(client, interaction) {
		if (!this.run) throw new RangeError('Expected a run method');

		const subcommand = interaction.options.getSubcommand();
		const user = interaction.options.getUser('user') || interaction.user;
		const message = interaction.options.getString('message');

		const mentionMember = interaction.guild.members.cache.get(user.id) || await interaction.guild.members.fetch(user.id);
		const authorMember = interaction.guild.members.cache.get(interaction.user.id) || await interaction.guild.members.fetch(interaction.user.id);

		switch (subcommand) {
		case 'cry': {
			const { body } = await get('https://rra.ram.moe/i/r?type=cry');

			if (!message) {
				return interaction.reply({ embeds: [client.embeds.actionEmbed('Cry', `**${authorMember.nickname || authorMember.user.globalName}** express themself crying...`, `https://cdn.ram.moe/${body.path.replace('/i/', '')}`)] });
			}
			else {
				await interaction.reply({ embeds: [client.embeds.actionEmbed('Cry', `**${authorMember.nickname || authorMember.user.globalName}** express themself crying... ${message}`, `https://cdn.ram.moe/${body.path.replace('/i/', '')}`)] });
			}
			break;
		}
		case 'cuddle': {
			const { body } = await get('https://rra.ram.moe/i/r?type=cuddle');

			let description = `**${authorMember.nickname || authorMember.user.globalName}**`;

			if (user) {
				if (user.id === interaction.user.id) {
					description += ' Cuddled by Holo';
				}
				else {
					description += ` Cuddle **${mentionMember.nickname || mentionMember.user.globalName || mentionMember.user.username}**`;
				}
			}

			if (message) {
				description += `\n${message}`;
			}

			await interaction.reply({ embeds: [client.embeds.actionEmbed('Cuddle', `${description}`, `https://cdn.ram.moe/${body.path.replace('/i/', '')}`)] });
			break;
		}
		case 'hug': {
			const { body } = await get('https://rra.ram.moe/i/r?type=hug');

			let description = `**${authorMember.nickname || authorMember.user.globalName}**`;

			if (user) {
				if (user.id === interaction.user.id) {
					description += ' Hugged by Holo, are you lonely? Here let me hug you...';
				}
				else {
					description += ` Hugged **${mentionMember.nickname || mentionMember.user.globalName || mentionMember.user.username}**`;
				}
			}

			if (message) {
				description += `\n${message}`;
			}

			await interaction.reply({ embeds: [client.embeds.actionEmbed('Hug', `${description}`, `https://cdn.ram.moe/${body.path.replace('/i/', '')}`)] });
			break;
		}
		case 'pat': {
			const { body } = await get('https://rra.ram.moe/i/r?type=pat');

			let description = `**${authorMember.nickname || authorMember.user.globalName}**`;

			if (user) {
				if (user.id === interaction.user.id) {
					description += ' patted by Holo. You did a good job';
				}
				else {
					description += ` Pat **${mentionMember.nickname || mentionMember.user.globalName || mentionMember.user.username}**`;
				}
			}

			if (message) {
				description += `\n${message}`;
			}

			await interaction.reply({ embeds: [client.embeds.actionEmbed('Pat', `${description}`, `https://cdn.ram.moe/${body.path.replace('/i/', '')}`)] });
			break;
		}
		case 'stare': {
			const { body } = await get('https://rra.ram.moe/i/r?type=stare');

			let description = `**${authorMember.nickname || authorMember.user.globalName}**`;

			if (user) {
				if (user.id === interaction.user.id) {
					description += ' Stare at the mirror, you looks perfect';
				}
				else {
					description += ` Stare at **${mentionMember.nickname || mentionMember.user.globalName || mentionMember.user.username}**`;
				}
			}

			if (message) {
				description += `\n${message}`;
			}

			await interaction.reply({ embeds: [client.embeds.actionEmbed('Stare', `${description}`, `https://cdn.ram.moe/${body.path.replace('/i/', '')}`)] });
			break;
		}
		case 'tickle': {
			const { body } = await get('https://rra.ram.moe/i/r?type=tickle');

			let description = `**${authorMember.nickname || authorMember.user.globalName}**`;

			if (user) {
				if (user.id === interaction.user.id) {
					description += ' Tickle themself, can you get ticklish if you do to yourself?';
				}
				else {
					description += ` Tickle **${mentionMember.nickname || mentionMember.user.globalName || mentionMember.user.username}**`;
				}
			}
			else {
				description += ' tickle **yourself**';
			}

			if (message) {
				description += `\n${message}`;
			}

			await interaction.reply({ embeds: [client.embeds.actionEmbed('Tickle', `${description}`, `https://cdn.ram.moe/${body.path.replace('/i/', '')}`)] });
			break;
		}
		case 'poke': {
			const { body } = await get('https://nekos.life/api/v2/img/poke');

			let description = `**${authorMember.nickname || authorMember.user.globalName}**`;

			if (user) {
				if (user.id === interaction.user.id) {
					description += ' I see you are lonely, here let me *pokes you*';
				}
				else {
					description += ` Poke **${mentionMember.nickname || mentionMember.user.globalName || mentionMember.user.username}**`;
				}
			}
			else {
				description += ' poke **yourself**';
			}

			if (message) {
				description += `\n${message}`;
			}

			await interaction.reply({ embeds: [client.embeds.actionEmbed('Poke', `${description}`, `${body.url}`)] });
			break;
		}
		case 'slap': {
			const { body } = await get('https://rra.ram.moe/i/r?type=slap');

			let description = `**${authorMember.nickname || authorMember.user.globalName}**`;

			if (user) {
				if (user.id === interaction.user.id) {
					description += ' Slapped themself, that will hurt';
				}
				else {
					description += ` Slapped **${mentionMember.nickname || mentionMember.user.globalName || mentionMember.user.username}**`;
				}
			}
			else {
				description += ' Slapped **yourself**';
			}

			if (message) {
				description += `\n${message}`;
			}


			await interaction.reply({ embeds: [client.embeds.actionEmbed('Slap', `${description}`, `https://cdn.ram.moe/${body.path.replace('/i/', '')}`)] });
			break;
		}
	}
}
};
