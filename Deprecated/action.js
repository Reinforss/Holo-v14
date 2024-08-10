/* eslint-disable no-unused-vars */
/* eslint-disable no-unreachable */
const Command = require('../src/structures/CommandClass');

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

		const mentionMember = await getMember(interaction, user);
		const authorMember = await getMember(interaction, interaction.user);

		const actionData = {
			cry: { api: 'https://rra.ram.moe/i/r?type=cry', label: 'Cry' },
			cuddle: { api: 'https://rra.ram.moe/i/r?type=cuddle', label: 'Cuddle' },
			hug: { api: 'https://rra.ram.moe/i/r?type=hug', label: 'Hug' },
			pat: { api: 'https://rra.ram.moe/i/r?type=pat', label: 'Pat' },
			stare: { api: 'https://rra.ram.moe/i/r?type=stare', label: 'Stare' },
			tickle: { api: 'https://rra.ram.moe/i/r?type=tickle', label: 'Tickle' },
			poke: { api: 'https://nekos.life/api/v2/img/poke', label: 'Poke', isNeko: true },
			slap: { api: 'https://rra.ram.moe/i/r?type=slap', label: 'Slap' },
		};

		if (actionData[subcommand]) {
			const imageUrl = await fetchImage(actionData[subcommand]);
			const description = buildDescription(subcommand, authorMember, mentionMember, message, interaction.user.id == user.id);
			await interaction.reply({ embeds: [client.embeds.actionEmbed(actionData[subcommand].label, description, imageUrl)] });
		}
	}
};

	async function fetchImage(action) {
		const { body } = await get(action.api);
		return action.isNeko ? body.url : `https://cdn.ram.moe/${body.path.replace('/i/', '')}`;
	}

	async function getMember(interaction, user) {
		return interaction.guild.members.cache.get(user.id) || await interaction.guild.members.fetch(user.id);
	}

	function buildDescription(action, authorMember, mentionMember, message, isSelf) {
		let description = `**${authorMember.nickname || authorMember.user.globalName}**`;

		const actionTexts = {
			cry: 'express themself crying...',
			cuddle: isSelf ? 'Cuddled by Holo' : `Cuddle **${mentionMember.nickname || mentionMember.user.globalName || mentionMember.user.username}**`,
			hug: isSelf ? 'Hugged by Holo, are you lonely? Here let me hug you...' : `Hugged **${mentionMember.nickname || mentionMember.user.globalName || mentionMember.user.username}**`,
			pat: isSelf ? 'patted by Holo. You did a good job' : `Pat **${mentionMember.nickname || mentionMember.user.globalName || mentionMember.user.username}**`,
			stare: isSelf ? 'Stare at the mirror, you look perfect' : `Stare at **${mentionMember.nickname || mentionMember.user.globalName || mentionMember.user.username}**`,
			tickle: isSelf ? 'Tickle themself, can you get ticklish if you do to yourself?' : `Tickle **${mentionMember.nickname || mentionMember.user.globalName || mentionMember.user.username}**`,
			poke: isSelf ? 'I see you are lonely, here let me *poke you*' : `Poke **${mentionMember.nickname || mentionMember.user.globalName || mentionMember.user.username}**`,
			slap: isSelf ? 'Slapped themself, that will hurt' : `Slapped **${mentionMember.nickname || mentionMember.user.globalName || mentionMember.user.username}**`,
		};

		description += ` ${actionTexts[action]}`;
		if (message) {
			description += `\n${message}`;
		}

		return description;
	}
