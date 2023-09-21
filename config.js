require('dotenv').config();

module.exports = {
	port: parseInt(process.env.PORT) || 3000,
	apiKey: process.env.API_KEY,
	whitelistIps: JSON.parse(process.env.WHITELIST_IPS),
};