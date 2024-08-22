/* eslint-disable no-inline-comments */
const Command = require('../../structures/CommandClass');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { PermissionsBitField } = require('discord.js');

const serverModel = require('../../schema/server');
const userModel = require('../../schema/user');

module.exports = class Settings extends Command {
    constructor(client) {
        super(client, {
            data: new SlashCommandBuilder()
                .setName('settings')
                .setDescription('[Holo | Moderation] Change server Settings like welcome/goodbye, leveling etc.')
                .setDMPermission(true)
                .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
                .addSubcommand(subcommand => subcommand
                    .setName('info')
                    .setDescription('Check current information about server Settings like welcome/goodbye, leveling etc.'),
                )
                .addSubcommand(subcommand => subcommand
                    .setName('welcome')
                    .setDescription('Settings for welcome channel, message, background, status')
                    .addStringOption(option => option
                        .setName('status')
                        .setDescription('Settings to enable / disable welcome message.')
                        .addChoices(
                            { name: 'Enable', value: 'true' },
                            { name: 'Disable', value: 'false' },
                        ),
                    )
                    .addChannelOption(option => option
                        .setName('channel')
                        .setDescription('Channel you want the bot to send the welcome message.')
                        .addChannelTypes(ChannelType.GuildText),
                    )
                    .addStringOption(option => option
                        .setName('message')
                        .setDescription('The message you want to add to the welcome message. 40 Character max')
                        .setMaxLength(40),
                    )
                    .addAttachmentOption(option => option
                        .setName('background')
                        .setDescription('The background of the welcome message you want to set.'),
                    ),
                )
                .addSubcommand(subcommand => subcommand
                    .setName('goodbye')
                    .setDescription('Settings for goodbye channel, message, background, status')
                    .addStringOption(option => option
                        .setName('status')
                        .setDescription('Settings to enable / disable goodbye message.')
                        .addChoices(
                            { name: 'Enable', value: 'true' },
                            { name: 'Disable', value: 'false' },
                        ),
                    )
                    .addChannelOption(option => option
                        .setName('channel')
                        .setDescription('Channel you want the bot to send the goodbye message.')
                        .addChannelTypes(ChannelType.GuildText),
                    )
                    .addStringOption(option => option
                        .setName('message')
                        .setDescription('The message you want to add to the goodbye message. 40 Character max')
                        .setMaxLength(40),
                    )
                    .addAttachmentOption(option => option
                        .setName('background')
                        .setDescription('The background of the goodbye message you want to set.'),
                    ),
                )
                .addSubcommand(subcommand => subcommand
                    .setName('leveling')
                    .setDescription('Settings for server leveling like enable or disable')
                    .addStringOption(option => option
                        .setName('status')
                        .setDescription('Settings to enable / disable server leveling.')
                        .addChoices(
                            { name: 'Enable', value: 'true' },
                            { name: 'Disable', value: 'false' },
                        ),
                    )
                    .addStringOption(option => option
                        .setName('levelupmessage')
                        .setDescription('Set up custom level up message for your user'),
                    ),
                )
                .addSubcommand(subcommand => subcommand
                    .setName('resetlevel')
                    .setDescription('Reset level for a user or all users.')
                    .addUserOption(option => option
                        .setName('user')
                        .setDescription('User to reset level.'),
                    ),
                )
                .addSubcommand(subcommand => subcommand
                    .setName('setlevel')
                    .setDescription('Set level for a user.')
                    .addUserOption(option => option
                        .setName('user')
                        .setDescription('The user you want to reset.')
                        .setRequired(true),
                    )
                    .addIntegerOption(option => option
                        .setName('level')
                        .setDescription('Number of level you want to set')
                        .setRequired(true),
                    ),
                ),
            usage: 'Settings <subcommand> <option>',
            category: 'Moderation',
            permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
            hidden: false,
        });
    }

    async run(client, interaction) {
        try {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                return interaction.reply({ embeds: [client.embeds.missingPermsEmbed('You need \'Manage Server\' permission to access this command.', 'Make sure you have the correct permission to do this.')], ephemeral: true });
            }
            const subcommand = interaction.options.getSubcommand();
            const status = interaction.options.getString('status');
            const channel = interaction.options.getChannel('channel');
            const message = interaction.options.getString('message');
            const background = interaction.options.getAttachment('background');

            const user = interaction.options.getUser('user');
            const level = interaction.options.getInteger('level');
            const xp = interaction.options.getInteger('xp');

            // Check if server data exists
            let serverData = await serverModel.findOne({ serverID: interaction.guild.id });
            if (!serverData) {
                serverData = new serverModel({ serverID: interaction.guild.id });
                await serverData.save();
            }

            switch (subcommand) {
                case 'info': {
                    // Create the dynamic message for leveling status
                    const levelingStatus = serverData.leveling.status ? 'Enabled' : 'Disabled';
                    const dynamicMessage = `Currently, Server Leveling is ${levelingStatus}.\n\nIf you want to ${levelingStatus === 'Enabled' ? 'disable' : 'enable'} leveling, please do /settings leveling ${levelingStatus === 'Enabled' ? 'Disable' : 'Enable'}.`;

                    // Create the embed message
                    const embed = new EmbedBuilder()
                        .setColor('Random')
                        .setTitle(`Current Settings for ${interaction.guild.name}`)
                        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                        .addFields({
                            name: '__Server Leveling__',
                            value: dynamicMessage,
                        })
                        .addFields({
                            name: '__Welcome Feature__',
                            value: `
                            • Welcome Status: ${serverData.welcome.status ? 'Enabled' : 'Disabled'}
                            • Welcome Channel: ${serverData.welcome.channel ? `<#${serverData.welcome.channel}>` : 'Not Set'}
                            • Welcome Message: ${serverData.welcome.message || 'Not Set'}
                            `,
                        })
                        .addFields({
                            name: '__Goodbye Feature__',
                            value: `
                            • Goodbye Status: ${serverData.goodbye.status ? 'Enabled' : 'Disabled'}
                            • Goodbye Channel: ${serverData.goodbye.channel ? `<#${serverData.goodbye.channel}>` : 'Not Set'}
                            • Goodbye Message: ${serverData.goodbye.message || 'Not Set'}
                            `,
                        });

                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    break;
                }
                case 'welcome': {
                    // Update the welcome settings
                    if (status !== null) {
                        serverData.welcome.status = status === 'true'; // Convert string to boolean
                    }

                    if (channel) {
                        serverData.welcome.channel = channel.id;
                    }
                    if (message) {
                        serverData.welcome.message = message;
                    }
                    if (background) {
                        serverData.welcome.background = background.url;
                    }

                    await serverData.save();

                    const embed = new EmbedBuilder()
                        .setColor('Random')
                        .setTitle(`Current settings for ${interaction.guild.name}`)
                        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                        .addFields({
                            name: '__Welcome Feature__',
                            value: `
                            • Welcome Status: ${serverData.welcome.status ? 'Enabled' : 'Disabled'}
                            • Welcome Channel: ${serverData.welcome.channel ? `<#${serverData.welcome.channel}>` : 'Not Set'}
                            • Welcome Message: ${serverData.welcome.message || 'Not Set'}
                            • Welcome Background: ${serverData.welcome.background || 'Not Set'}
                            `,
                        });
                    await interaction.reply({ content: `Welcome settings updated! Status currently ${serverData.welcome.status ? 'Enabled' : 'Disabled'}.`, embeds: [embed], ephemeral: true });
                    break;
                }
                case 'goodbye': {
                    // Update the goodbye settings
                    if (status !== null) {
                        serverData.goodbye.status = status === 'true'; // Convert string to boolean
                    }

                    if (channel) {
                        serverData.goodbye.channel = channel.id;
                    }
                    if (message) {
                        serverData.goodbye.message = message;
                    }
                    if (background) {
                        serverData.goodbye.background = background.url;
                    }

                    await serverData.save();

                    const embed = new EmbedBuilder()
                        .setColor('Random')
                        .setTitle(`Current settings for ${interaction.guild.name}`)
                        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                        .addFields({
                            name: '__Goodbye Feature__',
                            value: `
                            • Goodbye Status: ${serverData.goodbye.status ? 'Enabled' : 'Disabled'}
                            • Goodbye Channel: ${serverData.goodbye.channel ? `<#${serverData.goodbye.channel}>` : 'Not Set'}
                            • Goodbye Message: ${serverData.goodbye.message || 'Not Set'}
                            • Goodbye Background: ${serverData.goodbye.background || 'Not Set'}
                            `,
                        });
                    await interaction.reply({ content: `Goodbye settings updated! Status currently ${serverData.goodbye.status ? 'Enabled' : 'Disabled'}.`, embeds: [embed], ephemeral: true });
                    break;
                }
                case 'leveling': {
                    // Update the leveling settings
                    const levelupMessage = interaction.options.getString('levelupmessage');
                    if (status !== null) {
                        serverData.leveling.status = status === 'true';
                    }

                    if (levelupMessage) {
                        serverData.levelupmessage = levelupMessage;
                    }

                    await serverData.save();

                    const embed = new EmbedBuilder()
                        .setColor('Random')
                        .setTitle(`Current settings for ${interaction.guild.name}`)
                        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                        .addFields({
                            name: '__Leveling Feature__',
                            value: `
                            • Leveling Status: ${serverData.leveling.status ? 'Enabled' : 'Disabled'}
                            • Level-Up Message: ${serverData.leveling.levelupmessage || 'Not Set'}
                            `,
                        })
                        .addFields({
                            name: '__Placeholders__',
                            value: `
                            • {user} = mentioned user
                            • {username} = non mentioned user
                            • {level} = user level
                            `,
                        });

                    await interaction.reply({ content: `Leveling settings updated! Status is now ${serverData.leveling.status ? 'Enabled' : 'Disabled'}.`, embeds: [embed], ephemeral: true });
                    break;
                }
                case 'resetlevel': {
                    // Check if leveling is enabled
                    if (!serverData.leveling.status) {
                        return interaction.reply({
                            embeds: [client.embeds.errorEmbed('Leveling is currently disabled.', 'You cannot reset levels while leveling is disabled.')],
                            ephemeral: true,
                        });
                    }

                    // Create confirmation embed
                    const confirmationEmbed = new EmbedBuilder()
                        .setColor('Random')
                        .setTitle('Are you sure you want to reset levels?')
                        .setDescription(user ? `Reset level for ${user.username}.` : 'Reset levels for all users in this server.')
                        .setFooter({ text: 'This action cannot be undone!' });

                    // Create buttons for confirmation
                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('confirm')
                                .setLabel('Yes, Reset Levels')
                                .setStyle(ButtonStyle.Primary),
                            new ButtonBuilder()
                                .setCustomId('cancel')
                                .setLabel('No, Cancel')
                                .setStyle(ButtonStyle.Danger),
                        );

                    // Send the initial reply with the embed and buttons
                    await interaction.reply({
                        embeds: [confirmationEmbed],
                        components: [row],
                        ephemeral: false,
                    });

                    // Create a message collector to handle button interactions
                    const filter = (i) => i.customId === 'confirm' || i.customId === 'cancel';
                    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 }); // 15 seconds

                    collector.on('collect', async (i) => {
                        await i.deferUpdate(); // Acknowledge the button press

                        if (i.customId === 'confirm') {
                            // Perform the reset action
                            if (user) {
                                const userData = await userModel.findOne({ userID: user.id, 'localLevels.serverID': interaction.guild.id });
                                if (!userData) {
                                    // Edit the original reply to inform the user
                                    return await interaction.editReply({
                                        embeds: [client.embeds.errorEmbed('No level data found.', `No level data found for ${user.username}.`)],
                                        components: [],
                                    });
                                }

                                await userModel.updateOne(
                                    { userID: user.id, 'localLevels.serverID': interaction.guild.id },
                                    { $set: { 'localLevels.$.level': 1, 'localLevels.$.experience': 0 } },
                                );

                                // Edit the original reply to confirm the reset
                                await interaction.editReply({
                                    embeds: [new EmbedBuilder().setColor('Green').setDescription(`✅ Level reset for ${user.username}.`)],
                                    components: [],
                                });
                            }
                            else {
                                const userCount = await userModel.countDocuments({ 'localLevels.serverID': interaction.guild.id });
                                if (userCount === 0) {
                                    // Edit the original reply to inform the user
                                    return await interaction.editReply({
                                        embeds: [client.embeds.errorEmbed('No users found.', 'No user levels found to reset in this server.')],
                                        components: [],
                                    });
                                }

                                await userModel.updateMany(
                                    { 'localLevels.serverID': interaction.guild.id },
                                    { $set: { 'localLevels.$[].level': 1, 'localLevels.$[].experience': 0 } },
                                );

                                // Edit the original reply to confirm the reset
                                await interaction.editReply({
                                    embeds: [new EmbedBuilder().setColor('Green').setDescription('✅ Reset levels for all users in this server.')],
                                    components: [],
                                });
                            }
                        }
                        else {
                            // Edit the original reply to inform the user of cancellation
                            await interaction.editReply({
                                embeds: [new EmbedBuilder().setColor('Red').setDescription('❌ Reset level action has been canceled.')],
                                components: [],
                            });
                        }
                        collector.stop(); // Stop collecting after a response
                    });

                    collector.on('end', async (collected) => {
                        if (collected.size === 0) {
                            await interaction.editReply({
                                embeds: [new EmbedBuilder().setColor('Orange').setDescription('⏳ You took too long to respond. The action has been canceled.')],
                                components: [],
                            });
                        }
                    });

                    break;
                }


                case 'setlevel': {
                    // Check if leveling is enabled
                    if (!serverData.leveling.status) {
                        return interaction.reply({ embeds: [client.embeds.errorEmbed('Leveling is currently disabled.', 'You cannot set levels while leveling is disabled.')], ephemeral: true });
                    }

                    const userData = await userModel.findOne({ userID: user.id });
                    if (!userData) {
                        return interaction.reply({ content: `No existing level data found for ${user.username}. Please reset levels first or ensure they have participated in the leveling system.`, ephemeral: true });
                    }

                    await userModel.updateOne(
                        { userID: user.id },
                        { $set: { 'localLevels': { serverID: interaction.guild.id, level, experience: xp } } },
                        { upsert: true },
                    );

                    await interaction.reply({ content: `Set level to ${level} and XP to ${xp} for ${user.username}.`, ephemeral: true });
                    break;
                }

            }
        }
        catch (e) {
            await client.hook.sendError('An error occurred', `**${e.stack.split('\n')[0]}**\n${e.stack.split('\n').slice(1).join('\n')}`);
            return interaction.reply({ embeds: [client.embeds.errorEmbed('An error has occurred', 'Something went wrong with this command, this issue has been reported. Sorry for the inconvenience.')], ephemeral: true });
        }
    }
};
