/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-loop-func */
const Event = require('../../structures/EventClass');

const { ActivityType } = require('discord.js');
// const { getInfo } = require('discord-hybrid-sharding');
// const axios = require('axios');
// const activities = require('../../assets/json/status.json');

const reminderModel = require('../../schema/reminder');

module.exports = class ReadyEvent extends Event {
	constructor(client) {
		super(client, {
			name: 'ready',
			once: true,
		});
	}

	async run(client) {
		setInterval(async () => {
			const guildEval = await client.cluster.broadcastEval(c => c.guilds.cache.size);
			const serverCount = guildEval.reduce((prev, val) => prev + val, 0);
		    client.user.setActivity(`/help | In ${serverCount} Servers`, { type: ActivityType.Playing });
		  }, 60000);

		console.log(`[${new Date().toString().split(' ', 5).join(' ')}][INFO] Discord Bot is now online`);

		// setInterval(async () => {
		// 	const guildEval = await client.cluster.broadcastEval(c => c.guilds.cache.size);
		// 	const serverCount = guildEval.reduce((prev, val) => prev + val, 0);

		// 	axios.post('https://top.gg/api/bots/519521318719324181/stats', { server_count: serverCount, shard_count: getInfo().TOTAL_SHARDS }, { headers: { 'Authorization': process.env.TOPGGTOKEN } });
		// }, 60000);

		try {
			await client.poru.init(client);
		}
		catch (e) {
			console.error('Error initializing poru:', e);
		}

		const reminderData = await reminderModel.find();
		if (!reminderData) return;

		for (const reminder of reminderData) {
			const { userID, reminderDuration, reminderReason, reminderStart, reminderFormat, reminderMsgID } = reminder;

			let timems;
			switch (reminderFormat) {
				case 's':
					timems = reminderDuration * 1000;
					break;
				case 'm':
					timems = reminderDuration * 60 * 1000;
					break;
				case 'h':
					timems = reminderDuration * 60 * 60 * 1000;
					break;
				case 'd':
					timems = reminderDuration * 24 * 60 * 60 * 1000;
					break;
				default:
					console.error(`Invalid reminder format: ${reminderFormat}`);
					continue;
			}
			const elapsed = Date.now() - reminderStart;
			const timeLeft = timems - elapsed;

			if (timeLeft <= 0) {
				console.warn(`Reminder for user ${userID} is already due.`);
				continue;
			}

			const remind = async () => {
				try {
					const user = await client.users.fetch(userID);
					if (user) {
						if (reminderReason) {
							await user.send({ embeds: [client.embeds.reminderEmbed('Reminder', `${reminderReason}`)] });
						}
						else {
							console.warn(`No reminder reason for user ${userID}`);
						}
					}
					else {
						console.warn(`User ${userID} not found or bot is not in the same server.`);
					}

					await reminderModel.findOneAndDelete({ reminderMsgID }, { useFindAndModify: false });
				}
				catch (error) {
					console.error(`Error sending reminder to user ${userID}:`, error);
				}
			};

			setTimeout(remind, timeLeft);
		}
	}
};