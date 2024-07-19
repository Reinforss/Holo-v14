/* eslint-disable no-unused-vars */
module.exports.run = (client, node, error) => {
	console.log(`[${new Date().toString().split(' ', 5).join(' ')}][ERROR] Node ${node.name} Error!`);
};