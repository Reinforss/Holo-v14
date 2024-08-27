/* eslint-disable no-shadow */
const Event = require('../../structures/EventClass');
const { EmbedBuilder } = require('discord.js');

const channelID = '788383482933411890';

module.exports = class GuildDelete extends Event {
    constructor(client) {
        super(client, {
            name: 'guildDelete',
            category: 'guild',
        });
    }

    async run(guild) {
        const client = this.client;
        if (!guild) return;

        // Fetch all members of the guild
        const members = await guild.members.fetch();

        // Filter members into bots and humans
        const botCount = members.filter(member => member.user.bot).size;
        const humanCount = members.filter(member => !member.user.bot).size;

        // Calculate channel types
        const totalChannels = guild.channels.cache.size;
        const textChannels = guild.channels.cache.filter(ch => ch.type === 0).size;
        const voiceChannels = guild.channels.cache.filter(ch => ch.type === 2).size;

        // Calculate total guilds across the shards.
        const guildEval = await client.cluster.broadcastEval(c => c.guilds.cache.size);
		const serverCount = guildEval.reduce((prev, val) => prev + val, 0);

        // Create the embed message
        const embed = new EmbedBuilder()
            .setTitle('Left a Guild!')
            .setDescription(`
                **Guild Name:** ${guild.name}
                **Guild ID / Owner ID:** \`${guild.id}\` / \`${guild.ownerId}\`
                **Total Channels:** \`${totalChannels}\` Channels\n**Text : ** \`${textChannels}\` Text Channels\n**Voice : ** \`${voiceChannels}\` Voice Channels
                **Total Members**: \`${guild.memberCount}\` Members\n**Humans :** \`${humanCount}\` Users\n**Bots : ** \`${botCount}\` Bots
            `)
            .setColor('Random')
            .setFooter({ text: `Total Guild now: ${serverCount}` })
            .setTimestamp();

        // Broadcast the message to the appropriate shard
        client.cluster.broadcastEval(async (client, context) => {
            const channel = await client.channels.fetch(context.channelId).catch(() => null);
            if (channel) {
                await channel.send({ embeds: [context.embed] });
                return true;
            }
            return false;
        }, {
            context: {
                channelId: channelID,
                embed: embed.toJSON(),
            },
        }).then(results => {
            if (results.includes(true)) {
                console.log(`[${new Date().toString().split(' ', 5).join(' ')}][GUILD] Leaving a discord server.`);
            }
            else {
                console.log(`[${new Date().toString().split(' ', 5).join(' ')}][GUILD] Leaving a discord server. Unable to send message to join-leave logs.`);
            }
        }).catch(console.error);
    }
};
