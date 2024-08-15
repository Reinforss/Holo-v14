const { WebhookClient, EmbedBuilder } = require('discord.js');
const URI = process.env.WEBHOOK;

const webhookClient = new WebhookClient({ url: URI });

module.exports = {
    sendError: async (title, description) => {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle(title)
            .setDescription(description)
            .setTimestamp();
        try {
            await webhookClient.send({
                embeds: [embed],
            });
        }
        catch (error) {
            console.error('Error sending message to webhook:', error);
        }
    },
};