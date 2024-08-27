/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-inline-comments */
const Command = require('../../structures/CommandClass');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { AttachmentBuilder } = require('discord.js');
const Canvas = require('@napi-rs/canvas');
const { request } = require('undici');

const funModel = require('../../schema/fun');
const userModel = require('../../schema/user');
const serverModel = require('../../schema/server');

module.exports = class RankCommand extends Command {
    constructor(client) {
        super(client, {
            data: new SlashCommandBuilder()
                .setName('rank')
                .setDescription('Check your rank profile or others')
                .setDMPermission(true)
                .addStringOption(option => option
                    .setName('type')
                    .setDescription('Type of rank you want to check')
                    .addChoices(
                        { name: 'Global', value: 'global' },
                        { name: 'Server', value: 'server' },
                        { name: 'Leaderboard', value: 'leaderboard' },
                    )
                    .setRequired(true),
                )
                .addUserOption(option => option
                    .setName('user')
                    .setDescription('The user you want to check the rank'),
                ),
            usage: 'rank [@user]',
            category: 'Fun',
            permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
            hidden: false,
        });
    }

    async run(client, interaction) {
        await interaction.deferReply();
        try {
            const user = interaction.options.getUser('user') || interaction.user;
            if (user.bot) return;

            const rankType = interaction.options.getString('type');

            const funData = await funModel.findOne({ userID: user.id }) || new funModel({ userID: user.id });
            if (!funData) await funData.save();

            const userData = await userModel.findOne({ userID: user.id }) || new userModel({ userID: user.id });
            if (!userData) await userData.save();

            let localLevelData = userData.localLevels.find(level => level.serverID === interaction.guild.id);
            if (!localLevelData) {
                localLevelData = { serverID: interaction.guild.id, experience: 0, level: 1 };
                userData.localLevels.push(localLevelData);
            }

            const latestTitle = userData.globalLevel.titles.sort((a, b) => b.dateAchieved - a.dateAchieved)[0];
            const titleText = latestTitle ? latestTitle.title : 'No Title';

            let currentLevel, currentXP, maxXP;

            if (rankType === 'global') {
                currentLevel = userData.globalLevel.level || 0;
                currentXP = userData.globalLevel.experience || 0;
                maxXP = 10 * Math.pow(currentLevel, 2) + 40 * currentLevel + 50;
            }
            else {
                // Server ranking
                currentLevel = localLevelData.level || 0;
                currentXP = localLevelData.experience || 0;
                maxXP = 10 * Math.pow(currentLevel, 2) + 40 * currentLevel + 50;
            }

            let userRank, allUsers;

            if (rankType === 'global') {
                const userDoc = await userModel.findOne({ userID: user.id }, { 'globalLevel.experience': 1 });

                if (!userDoc || userDoc.globalLevel.experience === undefined || userDoc.globalLevel.experience <= 0) {
                    userRank = 'N/A';
                }
                else {

                    allUsers = await userModel.find().sort({ 'globalLevel.experience': -1 }).limit(999);

                    allUsers = allUsers.sort((a, b) => {
                        const aLevel = a.globalLevel.level;
                        const bLevel = b.globalLevel.level;

                        if (aLevel !== bLevel) {
                            return bLevel - aLevel;
                        }

                        return b.globalLevel.experience - a.globalLevel.experience;
                    });

                    const userIndex = allUsers.findIndex(u => u.userID === user.id);
                    userRank = userIndex === -1 ? '999+' : userIndex + 1;
                }
            }
            else {
                const serverLevelingEnabled = await checkServerLevelingEnabled(interaction.guild.id);

                if (!serverLevelingEnabled) {
                    userRank = 'N/A';
                }
                else {

                    const userDoc = await userModel.findOne({
                        userID: user.id,
                        'localLevels.serverID': interaction.guild.id,
                    }, { 'localLevels.$': 1 });

                    if (!userDoc || !userDoc.localLevels || userDoc.localLevels.length === 0 || userDoc.localLevels[0].experience === undefined || userDoc.localLevels[0].experience <= 0) {
                        userRank = 'N/A';
                    }
                    else {
                        allUsers = await userModel.find({ 'localLevels.serverID': interaction.guild.id })
                            .sort({ 'localLevels.experience': -1 })
                            .limit(999);

                        allUsers = allUsers.sort((a, b) => {
                            const aLevel = a.localLevels.find(level => level.serverID === interaction.guild.id).level;
                            const bLevel = b.localLevels.find(level => level.serverID === interaction.guild.id).level;

                            if (aLevel !== bLevel) {
                                return bLevel - aLevel;
                            }

                            return b.localLevels.find(level => level.serverID === interaction.guild.id).experience - b.localLevels.find(level => level.serverID === interaction.guild.id).experience; // Higher XP first
                        });

                        const userIndex = allUsers.findIndex(u => u.userID === user.id);
                        userRank = userIndex === -1 ? '999+' : userIndex + 1;
                    }
                }
            }

            const canvas = Canvas.createCanvas(700, 200);
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = '#282B30';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const { body } = await request(user.displayAvatarURL({ extension: 'jpg', size: 2048 }));
            const avatar = await Canvas.loadImage(await body.arrayBuffer());

            ctx.shadowColor = 'rgba(0, 0, 0, 1)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;

            ctx.font = 'bold 35px "LEMON MILK", sans-serif';
            ctx.fillStyle = 'white';
            ctx.fillText(`@${user.username}`, 220, 65);
            ctx.fillRect(220, 75, 400, 6);

            ctx.font = 'bold 30px "LEMON MILK", sans-serif';
            ctx.fillStyle = 'white';
            ctx.fillText(`#${userRank}`, 590, 35);
            ctx.font = 'bold 13px "LEMON MILK", sans-serif';
            ctx.fillText(rankType === 'global' ? 'Global Rank' : 'Server Rank', 590, 50);

            ctx.font = '20px "LEMON MILK", sans-serif';
            ctx.fillText(`Level ${currentLevel}`, 230, 110);
            ctx.fillText(`+${funData.reputation} REP`, 500, 110);
            ctx.fillText(titleText, 230, 160);

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
            await interaction.editReply({ files: [attachment] });
        }
        catch (e) {
            await client.hook.sendError('An error occurred', `**${e.stack.split('\n')[0]}**\n${e.stack.split('\n').slice(1).join('\n')}`);
            return interaction.editReply({
                embeds: [client.embeds.errorEmbed('An error has occurred', 'Something went wrong with this command, this issue has been reported. Sorry for the inconvenience')],
                ephemeral: true,
            });
        }
    }
};

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

async function checkServerLevelingEnabled(serverID) {
    const serverConfig = await serverModel.findOne({ serverID: serverID });
    return serverConfig ? serverConfig.leveling.status : false;
}