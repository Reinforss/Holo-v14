/* eslint-disable no-unused-vars */
/* eslint-disable no-unreachable */
const Command = require('../../structures/CommandClass');
const { SlashCommandBuilder } = require('@discordjs/builders');
const nekoClient = require('nekos.life');
const neko = new nekoClient();

module.exports = class Action extends Command {
	constructor(client) {
		super(client, {
			data: new SlashCommandBuilder()
				.setName('action')
				.setDescription('[Holo| Action] Action command to interact with other users')
				.setDMPermission(true)
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
		const subcommand = interaction.options.getSubcommand();
		const user = interaction.options.getUser('user') || interaction.user;
		const message = interaction.options.getString('message');

		const mentionMember = await getMember(interaction, user);
		const authorMember = await getMember(interaction, interaction.user);

		const actionData = {
			cuddle: { api: neko.cuddle(), label: 'Cuddle' },
			hug: { api: neko.hug(), label: 'Hug' },
			pat: { api: neko.pat(), label: 'Pat' },
			tickle: { api: neko.tickle(), label: 'Tickle' },
			slap: { api: neko.slap(), label: 'Slap' },
		};

		if (actionData[subcommand]) {
			const imageUrl = await fetchImage(actionData[subcommand].api);
			const description = buildDescription(subcommand, authorMember, mentionMember, message, interaction.user.id === user.id);
			await interaction.reply({ embeds: [client.embeds.actionEmbed(actionData[subcommand].label, description, imageUrl)] });
		}
	}
};

async function fetchImage(apiPromise) {
	const { url } = await apiPromise;
	return url;
}

async function getMember(interaction, user) {
	return interaction.guild.members.cache.get(user.id) || await interaction.guild.members.fetch(user.id);
}

function buildDescription(action, authorMember, mentionMember, message, isSelf) {
	let description = `**${authorMember.nickname || authorMember.user.globalName || authorMember.user.username}**`;

	const actionTexts = {
		cuddle: isSelf ? 'Cuddled by Holo' : `Cuddle **${mentionMember.nickname || mentionMember.user.globalName || mentionMember.user.username}**`,
		hug: isSelf ? 'Hugged by Holo, are you lonely? Here let me hug you...' : `Hugged **${mentionMember.nickname || mentionMember.user.globalName || mentionMember.user.username}**`,
		pat: isSelf ? 'Patted by Holo. You did a good job' : `Pat **${mentionMember.nickname || mentionMember.user.globalName || mentionMember.user.username}**`,
		tickle: isSelf ? 'Tickled themself, can you get ticklish if you do to yourself?' : `Tickled **${mentionMember.nickname || mentionMember.user.globalName || mentionMember.user.username}**`,
		slap: isSelf ? 'Slapped themself, that will hurt' : `Slapped **${mentionMember.nickname || mentionMember.user.globalName || mentionMember.user.username}**`,
	};

	description += ` ${actionTexts[action]}`;
	if (message) {
		description += `\n${message}`;
	}

	return description;
}
