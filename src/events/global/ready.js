/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-loop-func */
const Event = require('../../structures/EventClass');

const axios = require('axios');

const { ActivityType } = require('discord.js');
const { getInfo } = require('discord-hybrid-sharding');

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

		setInterval(async () => {
			const guildEval = await client.cluster.broadcastEval(c => c.guilds.cache.size);
			const serverCount = guildEval.reduce((prev, val) => prev + val, 0);

			axios.post('https://top.gg/api/bots/519521318719324181/stats', { server_count: serverCount, shard_count: getInfo().TOTAL_SHARDS }, { headers: { 'Authorization': process.env.TOPGGTOKEN } });
		}, 60000);

		setInterval(() => {
			pushStatus('up'); // Push the bot status to https://uptime.asterax.xyz/status/holo every 1 minute
		}, 60000);


	// Function to push status to https://uptime.asterax.xyz/status/holo
	function pushStatus(status) {
		const uptimeAsterax = `https://uptime.asterax.xyz/api/push/${process.env.UNIQUECODE}?status=${status}&msg=OK&ping=${client.ws.ping}`;

		axios.get(uptimeAsterax);
	}
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
		    if (reminderFormat === 's') {
		        timems = reminderDuration * 1000;
		    }
		    else if (reminderFormat === 'm') {
		        timems = reminderDuration * 60 * 1000;
		    }
		    else if (reminderFormat === 'h') {
		        timems = reminderDuration * 60 * 60 * 1000;
		    }
		    else if (reminderFormat === 'd') {
		        timems = reminderDuration * 24 * 60 * 60 * 1000;
		    }

		    const elapsed = Date.now() - reminderStart;
		    const timeLeft = timems - elapsed;

		    const remind = async () => {
		        const user = await client.users.fetch(userID);

		        if (user) {
		            if (reminderReason) {
		                user.send({ embeds: [client.embeds.reminderEmbed('Reminder', `${reminderReason}`)] });
		            }
		            else {
		                return;
		            }
		        }

		        await reminderModel.findOneAndDelete({ reminderMsgID }, { useFindAndModify: false });
		    };

		    setTimeout(remind(), timeLeft);
		}
	}
};
