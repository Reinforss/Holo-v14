const Command = require('../../structures/CommandClass');
const { SlashCommandBuilder } = require('@discordjs/builders');

const { EmbedBuilder } = require('discord.js');
const BookmarkModel = require('../../schema/bookmark'); // Adjust the path as needed for your project structure

module.exports = class Bookmark extends Command {
    constructor(client) {
        super(client, {
            data: new SlashCommandBuilder()
                .setName('bookmark')
                .setDescription('[Holo | Utility] Create personalized bookmark')
                .addSubcommand(subcommand => subcommand
                    .setName('view')
                    .setDescription('[Holo | Utility] View the bookmark you have created')
                    .addStringOption(option => option
                        .setName('id')
                        .setDescription('ID of the bookmark'))
                    .addStringOption(option => option
                        .setName('list')
                        .setDescription('List of all your bookmarks'))
                    .addBooleanOption(option => option
                        .setName('ephemeral')
                        .setDescription('View your bookmark hidden')))
                .addSubcommand(subcommand => subcommand
                    .setName('create')
                    .setDescription('[Holo | Utility] Create bookmark')
                    .addStringOption(option => option
                        .setName('name')
                        .setDescription('Title of the bookmark')
                        .setRequired(true))
                    .addStringOption(option => option
                        .setName('content')
                        .setDescription('Content of the bookmark')
                        .setRequired(true)))
                .addSubcommand(subcommand => subcommand
                    .setName('delete')
                    .setDescription('[Holo | Utility] Delete bookmark')
                    .addStringOption(option => option
                        .setName('name')
                        .setDescription('Name of the bookmark you want to delete'))
                    .addStringOption(option => option
                        .setName('id')
                        .setDescription('ID of the bookmark you want to delete')))
                .setDMPermission(true),
            usage: 'bookmark',
            category: 'Utility',
            permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
            hidden: false,
        });
    }

    async run(client, interaction) {
        try {
            const subcommand = interaction.options.getSubcommand();
            const name = interaction.options.getString('name');
            const id = interaction.options.getString('id');
            const content = interaction.options.getString('content');
            const ephemeral = interaction.options.getBoolean('ephemeral') || false;

            switch (subcommand) {
                case 'view': {
                    if (id) {
                        const bookmark = await BookmarkModel.findOne({ userId: interaction.user.id, _id: id });
                        if (!bookmark) {
                            return interaction.reply({
                                content: 'No bookmark found with the specified ID.',
                                ephemeral: true,
                            });
                        }
                        const embed = new EmbedBuilder()
                            .setTitle(bookmark.name)
                            .setDescription(bookmark.content)
                            .setColor('Blue')
                            .setFooter({ text: `ID: ${bookmark._id}` });

                        return interaction.reply({ embeds: [embed], ephemeral });
                    }
                    else {
                        const bookmarks = await BookmarkModel.find({ userId: interaction.user.id });
                        if (!bookmarks.length) {
                            return interaction.reply({
                                content: 'You have no bookmarks.',
                                ephemeral: true,
                            });
                        }

                        const list = bookmarks.map(b => `**${b.name}** (ID: ${b._id})`).join('\n');

                        return interaction.reply({
                            content: `Here are your bookmarks:\n${list}`,
                            ephemeral,
                        });
                    }
                }

                case 'create': {
                    const existing = await BookmarkModel.findOne({ userId: interaction.user.id, name });
                    if (existing) {
                        return interaction.reply({
                            content: 'You already have a bookmark with this name.',
                            ephemeral: true,
                        });
                    }

                    const newBookmark = new BookmarkModel({
                        userId: interaction.user.id,
                        name,
                        content,
                    });

                    await newBookmark.save();

                    return interaction.reply({
                        content: `Bookmark **${name}** has been created successfully!`,
                        ephemeral: true,
                    });
                }

                case 'delete': {
                    if (!name && !id) {
                        return interaction.reply({
                            content: 'You must provide either a bookmark name or ID to delete.',
                            ephemeral: true,
                        });
                    }

                    const query = { userId: interaction.user.id };
                    if (id) query._id = id;
                    if (name) query.name = name;

                    const bookmark = await BookmarkModel.findOneAndDelete(query);

                    if (!bookmark) {
                        return interaction.reply({
                            content: 'No bookmark found matching the specified criteria.',
                            ephemeral: true,
                        });
                    }

                    return interaction.reply({
                        content: `Bookmark **${bookmark.name}** has been deleted successfully!`,
                        ephemeral: true,
                    });
                }
            }
        }
        catch (e) {
            await client.hook.sendError('An error occurred', `**${e.stack.split('\n')[0]}**\n${e.stack.split('\n').slice(1).join('\n')}`);
            return interaction.reply({
                embeds: [
                    client.embeds.errorEmbed(
                        'An error has occurred',
                        'Something went wrong with this command, this issue has been reported. Sorry for the inconvenience.',
                    ),
                ],
                ephemeral: true,
            });
        }
    }
};