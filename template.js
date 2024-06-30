const Command = require('../../structures/CommandClass');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = class Example extends Command {
	constructor(client) {
		super(client, {
			data: new SlashCommandBuilder()
				.setName('')
				.setDescription('')
				.setDMPermission(true),
			usage: '',
			category: '',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
			hidden: false,
		});
	}

	run() {
		if (!this.run) throw new RangeError('Expected a run method');
	}
};
