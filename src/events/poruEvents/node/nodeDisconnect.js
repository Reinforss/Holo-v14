module.exports.run = (client, node) => {
	console.log(`[${new Date().toString().split(' ', 5).join(' ')}][WARN] Node ${node.name} Disconnected!`);
};