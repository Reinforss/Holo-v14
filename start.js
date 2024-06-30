const { ClusterManager } = require('discord-hybrid-sharding');
require('dotenv').config();

const manager = new ClusterManager(`${__dirname}/manager.js`, {
	totalShards: 'auto',
	shardsPerClusters: 2,
	totalClusters: 'auto',
	mode: 'process',
	token: process.env.TOKEN || 'YOUR_BOT_TOKEN',
});

manager.on('clusterCreate', (cluster) => console.log(`[INFO] Launched Cluster ${cluster.id}`));
manager.spawn({ timeout: -1 });