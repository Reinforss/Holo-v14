const Event = require('../../structures/EventClass');
const { AttachmentBuilder } = require('discord.js');

const Canvas = require('@napi-rs/canvas');

const serverModel = require('../../schema/server');
const { request } = require('undici');

module.exports = class GuildMemberRemove extends Event {
    constructor(client) {
        super(client, {
            name: 'guildMemberRemove',
            category: 'guildMember',
        });
    }

    async run(member) {

        let serverData = await serverModel.findOne({ serverID: member.guild.id });
        if (!serverData) {
            serverData = new serverModel({ serverID: member.guild.id });
            await serverData.save();
        }

        if (!serverData.goodbye.status) return;

        const canvas = Canvas.createCanvas(700, 340);
        const context = canvas.getContext('2d');

        const backgroundURL = serverData.goodbye.background || serverData.welcome.background;

        if (backgroundURL) {
            const background = await Canvas.loadImage(backgroundURL);
            context.drawImage(background, 0, 0, canvas.width, canvas.height);
        }
        else {
            context.clearRect(0, 0, canvas.width, canvas.height);
        }

        const { body } = await request(member.displayAvatarURL({ extension: 'jpg', size: 2048 }));
        const avatar = await Canvas.loadImage(await body.arrayBuffer());

        context.shadowColor = 'rgba(0, 0, 0, 1)';
        context.shadowBlur = 10;
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;

        const username = `${member.user.username}`;
        const customMessage = `${serverData.goodbye.message || 'Sad to see you go :('}`;

        context.font = 'bold 50px "LEMON MILK", sans-serif';
        context.fillStyle = 'white';
        context.fillText('Goodbye', 220, 245);

        context.font = 'bold 28px "LEMON MILK", sans-serif';
        const customUsernameWidth = context.measureText(username).width;
        const customUsernameX = (canvas.width - customUsernameWidth) / 2;
        context.fillText(username, customUsernameX, 285);

        context.font = 'bold 22px "LEMON MILK", sans-serif';
        const customMessageWidth = context.measureText(customMessage).width;
        const customMessageX = (canvas.width - customMessageWidth) / 2;
        context.fillText(customMessage, customMessageX, 320);

        const avatarOffset = 15;
        const avatarX = (canvas.width / 2) - (90) + avatarOffset;
        const avatarY = 10;

        context.beginPath();
        context.arc((canvas.width / 2) + avatarOffset, avatarY + 90, 90, 0, Math.PI * 2, true);
        context.closePath();
        context.lineWidth = 4;
        context.strokeStyle = 'white';
        context.stroke();

        context.beginPath();
        context.arc((canvas.width / 2) + avatarOffset, avatarY + 90, 90, 0, Math.PI * 2, true);
        context.closePath();
        context.clip();

        context.drawImage(avatar, avatarX, avatarY, 180, 180);

        const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'welcome.png' });
        const channel = member.guild.channels.cache.get(serverData.goodbye.channel);
        if (!channel) return;
        channel.send({ files: [attachment] });
    }
};