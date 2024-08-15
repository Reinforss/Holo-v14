/* eslint-disable no-unused-vars */
const Command = require('../../structures/CommandClass');

const { EmbedBuilder, MessageActionRow, MessageButton } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { get } = require('node-superfetch');
const { stripIndents } = require('common-tags');

const Database = require('../../schema/fun');

const choices = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];

module.exports = class Trivia extends Command {
	constructor(client) {
		super(client, {
			data: new SlashCommandBuilder()
				.setName('trivia')
				.setDescription('[Holo | Fun] Try and guess the correct Answer!')
				.setDMPermission(true)
				.addStringOption(option => option
					.setName('difficulty')
					.setDescription('Choose how difficult the trivia')
					.addChoices(
						{
							name: 'Easy',
							value: 'easy',
						},
						{
							name: 'Medium',
							value: 'medium',
						},
						{
							name: 'Hard',
							value: 'hard',
						},
					),
				),
			usage: 'trivia',
			category: 'Fun',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
			hidden: false,
		});
	}

	async run(client, interaction) {
		try {
			await interaction.deferReply();


			const difficulties = ['easy', 'medium', 'hard'];
			const selectedDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
			const difficulty = interaction.options.getString('difficulty') || `${selectedDifficulty}`;

			const { body } = await get('https://opentdb.com/api.php?amount=4').query({
				amount: 1,
				encode: 'url3986',
				difficulty: difficulty,
			});

			let funDB = await Database.findOne({ userID: interaction.user.id });
			if (!funDB) {
				funDB = new Database({ userID: interaction.user.id });

				await funDB.save();
			}

			// if (!funDB) {
			//     const newFun = new Database({
			//         userID: interaction.user.id,
			//         triviaWin: 0,
			//     });
			//     await newFun.save();
			// }

			const difficult = body.results[0].difficulty;

			let duration;

			switch (difficult) {
			case 'easy':
				duration = 7000;
				break;
			case 'medium':
				duration = 10000;
				break;
			case 'hard':
				duration = 15000;
				break;
			default:
				duration = 15000;
				break;
			}

			const category = body.results[0].category;
			let answer = body.results[0].incorrect_answers;
			answer.push(body.results[0].correct_answer);
			answer = client.util.shuffle(answer);

			const embed = new EmbedBuilder()
				.setTitle('Trivia game')
				.setColor('Random')
				.setDescription(stripIndents`**${decodeURIComponent(body.results[0].question)}**\n${answer.map((x, i) => `${choices[i]} *${decodeURIComponent(x)}*`).join('\n')}`)
				.addFields({ name: '__Difficulty__', value: `**\`${decodeURIComponent(difficult)}\`**`, inline: true })
				.addFields({ name: '__Category__', value: `**\`${decodeURIComponent(category)}\`**`, inline: true })
				.setFooter({ text: `You have ${duration / 1000} seconds to answer` });

			const interactionReply = await interaction.editReply({ embeds: [embed] });

			const reactions = choices.slice(0, answer.length);
			for (const reaction of reactions) {
				await interactionReply.react(reaction);
			}

			console.log(body.results[0].correct_answer);

			const filter = (reaction, user) => reactions.includes(reaction.emoji.name) && user.id === interaction.user.id;
			const collector = interactionReply.createReactionCollector({ filter, time: duration, max: 1 });

			collector.on('collect', async (reaction, _user) => {
				const selectedChoice = reaction.emoji.name;
				const selectedAnswer = answer[choices.indexOf(selectedChoice)];

				if (selectedAnswer === body.results[0].correct_answer) {
					embed.setColor('Green');
					funDB.triviaWin += 1;
					await funDB.save();
					await interaction.editReply({ content: `Congratulations ${interaction.user}, the answer was indeed **${decodeURIComponent(body.results[0].correct_answer)}**`, embeds: [embed] });
					interactionReply.reactions.removeAll();
					console.log('Correct');
				}
				else {
					embed.setColor('Red');
					await interaction.editReply({ content: `Sorry ${interaction.user}, The correct answer was **${decodeURIComponent(body.results[0].correct_answer)}**\nYour answer: **${decodeURIComponent(selectedAnswer)}**`, embeds: [embed] });
					interactionReply.reactions.removeAll();
					console.log('Wrong');
				}
			});

			collector.on('end', async collected => {
				if (collected.size === 0) {
					await interaction.reply('Time\'s up!');
				}
			});
		}
		catch (e) {
			await client.hook.sendError('An error occurred', `${e.stack.split('\n')[0]}\n${e.stack.split('\n')[1]}`);
			return interaction.reply({ embeds: [client.embeds.errorEmbed('An error has occured', 'Something went wrong with this command, this issue has been reported. Sorry for the Inconvenience')], ephemeral: true });
		}
	}
};
