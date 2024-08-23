/* eslint-disable no-inline-comments */
/* eslint-disable no-unused-vars */
/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-shadow */
const Event = require('../../structures/EventClass');

const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const snek = require('node-superfetch');

// Required for canvas
const Canvas = require('@napi-rs/canvas');
const { request } = require('undici');

// Schema
const userModel = require('../../schema/user');
const serverModel = require('../../schema/server');

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

		const mentionedUserIDs = message.mentions.users.map(userData => userData.id);
		const mentionedMembers = await message.guild.members.fetch({ userData: mentionedUserIDs });


		let serverData = await serverModel.findOne({ serverID: message.guild.id });
		let userData = await userModel.findOne({ userID: message.author.id });
		if (!userData) {
			userData = new userModel({
				userID: message.author.id,
				username: message.author.username,
				localLevels: [{ // Initialize with the current server ID
					serverID: message.guild.id,
					experience: 0, // Start with 0 experience
					level: 1, // Start at level 1
				}],
			});
			await userData.save();
		}
		if (!serverData) {
			serverData = new serverModel({ serverID: message.guild.id });
			await serverData.save();
		}

		// Check if the user is AFK
		if (userData && userData.afk) {
			const notify = await message.reply(`⌨️ | Welcome back ${message.author.toString()} I've removed you from AFK Mode`);
			setTimeout(() => {
				notify.delete().catch(console.error);
			}, 10000);
			userData.afk = '';
			await userData.save();
		}

		// Handle AFK notification for mentioned users
		mentionedMembers.forEach(async (mentionedMember) => {
			const mentionedUserData = await userModel.findOne({ userID: mentionedMember.id });

			if (mentionedUserData && mentionedUserData.afk) {
				const afkEmbed = new EmbedBuilder()
					.setColor('Green')
					.setAuthor({ name: 'They are AFK at the moment, please try again later!' })
					.setDescription(`${mentionedUserData.afk}`);

				try {
					await message.reply({ embeds: [afkEmbed] });
				}
				catch (error) {
					console.error('Failed to send AFK notifier to channel:', error);
				}
			}
		});

		const COOLDOWN_DURATION = 10000; // Cooldown duration in milliseconds (e.g., 30 seconds)

		// Get the current timestamp
		const now = Date.now();

		// Initialize a flag to track if XP was gained
		let xpGained = false;

		// Local XP Gain
		if (serverData.leveling.status) {
			// Find the user's local level data for the specific server
			const serverLocalLevelData = userData.localLevels.find(levelData => levelData.serverID === serverData.serverID);

			// If no local level data exists for the server, create it
			if (!serverLocalLevelData) {
				userData.localLevels.push({
					serverID: serverData.serverID,
					experience: 0,
					level: 1,
				});
			}

			// Update local level data
			const localLevelData = userData.localLevels.find(levelData => levelData.serverID === serverData.serverID);

			// Check for shared cooldown
			if (now - userData.lastXPTime >= COOLDOWN_DURATION) {
				// Generate random local XP gain between 1 and 15
				const localXpGain = Math.floor(Math.random() * 15) + 1;
				localLevelData.experience += localXpGain;
				xpGained = true; // Mark that XP was gained

				// Calculate XP required to reach the next level
				let xpToNextLevel = 10 * Math.pow(localLevelData.level, 2) + 40 * localLevelData.level + 50;

				// Loop until user has enough XP to level up
				while (localLevelData.experience >= xpToNextLevel) {
					localLevelData.level += 1;
					localLevelData.experience -= xpToNextLevel;
					console.log(`Leveled up to: ${localLevelData.level} in server ${serverData.serverID}`);

					// Prepare and send the level-up message
					const levelUpMessageTemplate = serverData.leveling.levelupmessage || 'Congratulations {user}, aka {username}, you\'ve reached level {level}!';
					const levelUpMessage = levelUpMessageTemplate
						.replace('{user}', message.author.toString())
						.replace('{username}', message.author.username)
						.replace('{level}', localLevelData.level.toString());

					await message.channel.send(levelUpMessage);

					// Update the XP requirement for the next level
					xpToNextLevel = 10 * Math.pow(localLevelData.level, 2) + 40 * localLevelData.level + 50;
				}
			}
		}

		// Global XP Gain
		if (now - userData.lastXPTime >= COOLDOWN_DURATION) {
			// Generate random global XP gain between 1 and 5
			const globalXpGain = Math.floor(Math.random() * 5) + 1;
			userData.globalLevel.experience += globalXpGain; // Add global XP
			xpGained = true; // Mark that XP was gained

			const globalXpToNextLevel = 10 * Math.pow(userData.globalLevel.level, 2) + 40 * userData.globalLevel.level + 50;

			// Global leveling logic
			while (userData.globalLevel.experience >= globalXpToNextLevel) {
				userData.globalLevel.level += 1;
				userData.globalLevel.experience -= globalXpToNextLevel;

				const newTitle = determineTitle(userData.globalLevel.level);
				const existingTitle = userData.globalLevel.titles.find(t => t.title === newTitle);

				// If the title is new, add it to the array
				if (!existingTitle) {
					userData.globalLevel.titles.push({ title: newTitle });
				}
			}
		}

		// If either local or global XP was gained, update the lastXPTime
		if (xpGained) {
			userData.lastXPTime = now; // Update shared last XP time
			// Save the updated user data
			await userData.save();
		}

		// Command Handling
		let command;
		let args;

		// Construct the bot mention dynamically
		const botMention = `<@${message.client.user.id}>`;

		if (message.content.startsWith(botMention)) {
			// If it starts with the bot mention, extract the command and arguments
			args = message.content.slice(botMention.length).trim().split(/ +/);
			command = args.shift().toLowerCase();
		}
		else if (message.content.startsWith(prefix)) {
			// If it starts with the prefix, extract the command and arguments
			args = message.content.slice(prefix.length).trim().split(/ +/);
			command = args.shift().toLowerCase();
		}
		else {
			// If neither, return early
			return;
		}

		if (command === 'eval') {
			const client = this.client;
			// Uncomment this line if you want to restrict who can use eval
			if (message.author.id !== '292936070603997185') return;

			const embed = new EmbedBuilder().setColor('Green');
			try {
				const code = args.join(' ');
				if (!code) return message.channel.send('Invalid command. Please provide code to evaluate.');

				let result = await eval(`(async () => { ${code} })()`);

				if (typeof result !== 'string') {
					result = require('util').inspect(result);
				}

				if (result.length > 1024) {
					const { body } = await snek.post('https://www.hasteb.in/documents').send(result);
					embed.addFields({ name: 'Input', value: `\`\`\`js\n${code}\`\`\`` });
					embed.addFields({ name: 'Output', value: `https://www.hasteb.in/${body.key}.js` });
				}
				else {
					embed.addFields({ name: 'Input', value: `\`\`\`js\n${code}\`\`\`` });
					embed.addFields({ name: 'Output', value: `\`\`\`js\n${result}\`\`\`` });
				}

				message.reply({ embeds: [embed] });
			}
			catch (err) {
				if (err.length > 1024) {
					const { body } = await snek.post('https://www.hasteb.in/documents').send(err);
					embed.addFields({ name: 'Input', value: `\`\`\`js\n${args.join(' ')}\`\`\`` });
					embed.addFields({ name: 'Error', value: `https://www.hasteb.in/${body.key}.js` });
				}
				else {
					embed.addFields({ name: 'Input', value: `\`\`\`js\n${args.join(' ')}\`\`\`` });
					embed.addFields({ name: 'Error', value: `\`\`\`xl\n${err.stack}\`\`\`` });
				}
				message.reply({ embeds: [embed] });
			}
		}
		if (command === 'canvas') {
			if (message.author.id !== '292936070603997185') return;
            const latestTitle = userData.globalLevel.titles.sort((a, b) => b.dateAchieved - a.dateAchieved)[0];
            const titleText = latestTitle ? latestTitle.title : 'No Title'; // Default title if none exists

            // Get local and global data based on rank type
            const currentLevel = '15';
			const currentXP = '3561';
			const maxXP = '7350';

            // Create the canvas for rank display
            const canvas = Canvas.createCanvas(700, 200);
            const ctx = canvas.getContext('2d');

            // Background color
            ctx.fillStyle = '#282B30';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const { body } = await request(message.author.displayAvatarURL({ extension: 'jpg', size: 2048 }));
			// const avatar = await Canvas.loadImage(await body.arrayBuffer());
            const avatar = await Canvas.loadImage('https://media.discordapp.net/attachments/836520920730435596/1276115040327569429/353619744_1691367431325665_2754592312289404653_n.jpg?ex=66c85a3e&is=66c708be&hm=f4dbea4605643c773d1cdc8a6815d849d06eee047ab1743f36a304edf962948e&=&format=webp&width=1193&height=671');

            ctx.shadowColor = 'rgba(0, 0, 0, 1)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;

            ctx.font = 'bold 35px "LEMON MILK", sans-serif';
            ctx.fillStyle = 'white';
            ctx.fillText('@Rihanss', 220, 65);
            ctx.fillRect(220, 75, 400, 6);

            ctx.font = 'bold 30px "LEMON MILK", sans-serif';
            ctx.fillStyle = 'white';
            ctx.fillText('#13', 590, 35);
			ctx.font = 'bold 13px "LEMON MILK", sans-serif';
			ctx.fillText('Server Rank', 590, 50);

            ctx.font = '20px "LEMON MILK", sans-serif';
            ctx.fillText(`Level ${currentLevel}`, 230, 110);
            ctx.fillText('+233 REP', 500, 110);
            ctx.fillText('Master of Conversations', 230, 160);

            ctx.shadowColor = 'rgba(0, 0, 0, 0)';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            const barX = 220;
            const barY = 115;
            const barWidth = 400;
            const barHeight = 25;
            const padding = 10;

            drawRoundedRect(ctx, barX, barY, barWidth, barHeight, 12, 'rgba(85, 85, 85, 0.6)');

            let xpWidth = 0;
            if (maxXP > 0 && currentXP >= 0) {
                xpWidth = (currentXP / maxXP) * (barWidth - padding);
            }

            const minWidth = 5;
            xpWidth = Math.max(minWidth, xpWidth);
            if (xpWidth > 10) {
                drawRoundedRect(ctx, barX, barY, xpWidth, barHeight, 12, 'rgba(255, 255, 255, 0.5)');
            }

            ctx.shadowColor = 'rgba(0, 0, 0, 1)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;

            const xpText = `${currentXP} / ${maxXP} XP`;
            ctx.font = '18px "LEMON MILK", sans-serif';
            ctx.fillStyle = '#ffffff';
            const textWidth = ctx.measureText(xpText).width;
            const textX = barX + (barWidth - padding - textWidth) / 2;
            const textY = barY + (barHeight / 2) + 5;
            ctx.fillText(xpText, textX, textY);

            ctx.beginPath();
            ctx.arc(125, 105, 80, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();

            ctx.fillStyle = 'white';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(125, 105, 75, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatar, 25, 5, 200, 200);

            const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'profile-image.png' });
            await message.channel.send({ files: [attachment] });
		}
	}
};

async function drawXPBar(x, y, w, h, color, alpha, ctx) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.beginPath();
    ctx.arc(x, y + h / 2, 12.5, Math.PI / 2, Math.PI * 1.5);
    ctx.arc(x + w, y + h / 2, 12.5, Math.PI * 1.5, Math.PI / 2);
    ctx.fill();
    ctx.globalAlpha = 1;
}

async function drawRoundedRect(ctx, x, y, width, height, radius, fillColor) {
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
    ctx.fill();
}

function formatXP(value) {
    if (value >= 1000) {
        return (value / 1000).toFixed(1) + 'k';
    }
    return value.toString();
}

function determineTitle(level) {
    if (level >= 1 && level <= 3) {
        return 'Silent Observer';
    }
 else if (level >= 4 && level <= 6) {
        return 'Cautious Communicator';
    }
 else if (level >= 7 && level <= 9) {
        return 'Social Introvert';
    }
 else if (level >= 10 && level <= 12) {
        return 'Reserved Contributor';
    }
 else if (level >= 13 && level <= 15) {
        return 'Balanced Conversationalist';
    }
 else if (level >= 16 && level <= 18) {
        return 'Engaging Communicator';
    }
 else if (level >= 19 && level <= 21) {
        return 'Chatty Companion';
    }
 else if (level >= 22 && level <= 24) {
        return 'Dynamic Conversationalist';
    }
 else if (level >= 25 && level <= 27) {
        return 'Networking Guru';
    }
 else {
        return 'Master of Conversations'; // Default title for levels above 27
    }
}
