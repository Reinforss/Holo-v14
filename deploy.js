const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const fs = require('fs');
const { ClusterManager } = require('discord-hybrid-sharding');

require('dotenv').config();

const deployCommands = async () => {
    const commandData = [];

    try {
        // Read commands dynamically
        fs.readdirSync('./src/commands/').forEach(category => {
            const commands = fs
                .readdirSync(`./src/commands/${category}/`)
                .filter(cmd => cmd.endsWith('.js'));

            for (const commandFile of commands) {
                const Command = require(`./src/commands/${category}/${commandFile}`);
                const cmdInstance = new Command();

                if (cmdInstance?.data?.toJSON) {
                    commandData.push(cmdInstance.data.toJSON());
                }
				else {
                    console.warn(`[WARN] Command file ${commandFile} is missing valid "data" or "toJSON" method.`);
                }
            }
        });

        const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
        const clientId = process.env.CLIENTID;

        if (!clientId) {
            throw new Error('CLIENTID is not set in environment variables.');
        }

        console.log(`[${new Date().toISOString()}][COMMANDS] Deploying ${commandData.length} commands...`);

        await rest.put(Routes.applicationCommands(clientId), { body: commandData });

        console.log(`[${new Date().toISOString()}][COMMANDS] Commands deployed successfully.`);
    }
	catch (error) {
        console.error(`[${new Date().toISOString()}][ERROR] Failed to deploy commands:`, error);
    }
};

// Create a ClusterManager instance
const manager = new ClusterManager('./index.js', {
    totalShards: 'auto',
    shardsPerClusters: 2,
    totalClusters: 'auto',
    mode: 'process',
    token: process.env.TOKEN,
});

manager.on('clusterCreate', async (cluster) => {
    console.log(`[${new Date().toISOString()}][INFO] Launched Cluster ${cluster.id}`);
    await deployCommands();
});

// Start the ClusterManager
manager.spawn({ timeout: -1 });
