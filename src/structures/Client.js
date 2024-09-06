const { Client, GatewayIntentBits } = require('discord.js');
const { Poru } = require('poru');
const { Collection } = require('@discordjs/collection');
const { ClusterClient, getInfo } = require('discord-hybrid-sharding');

const CommandHandler = require('../handle/Command');
const EventHandler = require('../handle/Events');

module.exports = class Bot extends Client {
	constructor(...opt) {
		super({
			shards: getInfo().SHARD_LIST,
			shardCount: getInfo().TOTAL_SHARDS,
			opt,
			partials: [
				'GUILD_MEMBERS',
				'MESSAGE',
				'CHANNEL',
				'USER',
			],
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildVoiceStates,
				GatewayIntentBits.GuildMembers,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.GuildMessageReactions,
				GatewayIntentBits.GuildEmojisAndStickers,
				GatewayIntentBits.GuildIntegrations,
				// GatewayIntentBits.MessageContent,
			],
			allowedMentions: {
				parse: ['users', 'roles'],
				repliedUser: true,
			},
		});
		this.config = require('../util/config.js');
		this.emoji = require('../util/emoji.js');
		this.util = require('../util/util.js');
		this.Database = require('./mongoose.js');
		this.embeds = require('../assets/js/embeds.js');
		this.hook = require('../assets/js/webhook.js');

		this.helps = new Collection();
		this.commands = new Collection();
		this.events = new Collection();

		this.cluster = new ClusterClient(this);

		this.poru = new Poru(this, this.config.nodes, this.config.poruOptions);
		require('../handle/Poru.js')(this);

		new EventHandler(this).build('../events/global');
		new CommandHandler(this).build('../commands');
	}

	async login() {
		await super.login(process.env.TOKEN);
	}

	exit() {
		if (this.quitting) return;
		this.quitting = true;
		this.destroy();
	}

	fetchCommand(cmd) {
		return this.commands.get(cmd);
	}
};
