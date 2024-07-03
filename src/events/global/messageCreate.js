/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-shadow */
const Event = require('../../structures/EventClass');

const { EmbedBuilder } = require('discord.js');
const snek = require('node-superfetch');

const userModel = require('../../schema/user');


const prefix = ';';

module.exports = class MessageCreate extends Event {
	constructor(client) {
		super(client, {
			name: 'messageCreate',
			category: 'message',
		});
	}

	async run(message) {
		if (message.author.bot) return;

		const mentionedUserIDs = message.mentions.users.map(user => user.id);
		const mentionedMembers = await message.guild.members.fetch({ user: mentionedUserIDs });

		const user = await userModel.findOne({ userID: message.author.id });
		if (user && user.afk) {
		  const notify = await message.reply(`⌨️ | Welcome back ${message.author.toString()} I've removed you from AFK Mode`);
		  setTimeout(() => {
		    notify.delete().catch(console.error);
		  }, 10000);
		  user.afk = '';
		  await user.save();
		}

		mentionedMembers.forEach(async (mentionedMember) => {
		  const user = await userModel.findOne({ userID: mentionedMember.id });

		  if (user && user.afk) {
		    const afkEmbed = new EmbedBuilder()
		      .setColor('Green')
		      .setAuthor({ name: 'They are AFK at the moment, please try again later!' })
		      .setDescription(`${user.afk}`);

		    try {
		      await message.reply({ embeds: [afkEmbed] });
		    }
				catch (error) {
		      console.error('Failed to send AFK notifier to channel:', error);
		    }
		  }
		});

		// command
		if (!message.content.startsWith(prefix)) return;

		const args = message.content.slice(prefix.length).trim().split(/ +/);
		const command = args.shift().toLowerCase();

		console.log(message);

		if (command === 'eval') {
			if (message.author.id !== '292936070603997185') return;

			const embed = new EmbedBuilder()
				.setColor('Green');
			try {
				const code = args.join(' ');
				let result = eval(code);

				if (typeof result !== 'string') {
					result = require('util').inspect(result);
				}

				if (result.length > 1024) {
					const { body } = await snek.post('https://www.hasteb.in/documents').send(result);
					embed.addFields({ name:'Input', value: `\`\`\`js\n${code}\`\`\`` });
					embed.addFields({ name:'Output', value:`https://www.hasteb.in/${body.key}.js` });
				}
				else {
					embed.addFields({ name:'Input', value: `\`\`\`js\n${code}\`\`\`` });
					embed.addFields({ name:'Output', value:`\`\`\`js\n${result}\`\`\`` });
				}

				message.reply({ embeds: [embed] });
			}
			catch (err) {
				if (err.length > 1024) {
					const { body } = await snek.post('https://www.hasteb.in/documents').send(err);
					embed.addFields({ name: 'Input', value:`\`\`\`js\n${args.join(' ')}\`\`\`` });
					embed.addFields({ name:'Error', value:`\`\`\`xl\n${body.key}.js\`\`\`` });
				}
				else {
					embed.addFields({ name: 'Input', value:`\`\`\`js\n${args.join(' ')}\`\`\`` });
					embed.addFields({ name:'Error', value:`\`\`\`xl\n${err}\`\`\`` });
				}
				message.reply({ embeds: [embed] });
			}
		}
	}
};
