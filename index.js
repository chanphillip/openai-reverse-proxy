const express = require('express');
const logger = require('morgan');
const createProxyMiddleware = require('http-proxy-middleware').createProxyMiddleware;
const ipfilter = require('express-ipfilter').IpFilter;

const config = require('./config');

const app = express();

app.use(logger('dev'));

// whitelist ips
app.use(ipfilter(config.whitelistIps, {
	detectIp: (req, res) => {
		return req.headers['x-forwarded-for'] ? (req.headers['x-forwarded-for']).split(',')[0] : '';		// remove detectIp if x-forwarded-for not supported
	},
	mode: 'allow',
}));

app.use('/', createProxyMiddleware({
	target: 'https://api.openai.com',
	changeOrigin: true,
	onProxyReq: (proxyReq, req, res) => {
		console.log(req.originalUrl);
		proxyReq.setHeader('Authorization', `Bearer ${config.apiKey}`);
	},
	onProxyRes: (proxyRes, req, res) => {
		proxyRes.headers['Access-Control-Allow-Origin'] = '*';
		proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With';
	},
}));

app.listen(config.port, () => {
	console.log(`Server started... (port: ${config.port})`);
});
