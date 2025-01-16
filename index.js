const mongoose = require('mongoose');
const Client = require('./src/structures/Client.js');
require('dotenv').config();

const validateEnv = () => {
    const requiredEnv = ['MONGO_URI', 'prodCERTFILE', 'prodPEMFILE'];
    for (const envVar of requiredEnv) {
        if (!process.env[envVar]) {
            console.error(`[${new Date().toString().split(' ', 5).join(' ')}][ENVIRONMENT] Missing environment variable: ${envVar}. Unable to start bot.`);
            process.exit(1);
        }
    }
};

validateEnv();

const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            tls: true,
            tlsCAFile: process.env.prodCERTFILE,
            tlsCertificateKeyFile: process.env.prodPEMFILE,
            tlsAllowInvalidCertificates: true,
            tlsAllowInvalidHostnames: true,
        });

        console.log(`[${new Date().toString().split(' ', 5).join(' ')}][DATABASE] Database connected successfully.`);
    }
	catch (error) {
        console.error(`[${new Date().toString().split(' ', 5).join(' ')}][DATABASE] Database connection error:`, error);
        throw error;
    }
};

const startBot = async () => {
    try {
        await connectToDatabase();

        const client = new Client();
        await client.login();
        console.log(`[${new Date().toString().split(' ', 5).join(' ')}][CHECK] Everything check out, starting discord bot`);

        process
            .on('unhandledRejection', error => {
                console.error(`[${new Date().toString().split(' ', 5).join(' ')}][ERROR] Unhandled promise rejection:`, error);
            })
            .on('uncaughtException', error => {
                console.error(`[${new Date().toString().split(' ', 5).join(' ')}][ERROR] Uncaught exception:`, error);
            });
    }
	catch (error) {
        console.error(`[${new Date().toString().split(' ', 5).join(' ')}][BOT] Failed to start bot:`, error);
        process.exit(1);
    }
};

// Start the bot
startBot();
