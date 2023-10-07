const express = require('express');
const logger = require('morgan');
const createProxyMiddleware = require('http-proxy-middleware').createProxyMiddleware;
const { IpDeniedError, IpFilter } = require('express-ipfilter');
const bodyParser = require('body-parser');

require('./log4js')();
const log4js = require('log4js');
const proxyLogger = log4js.getLogger('proxy');

const config = require('./config');

const app = express();

app.use(logger('dev'));

// whitelist ips
app.use(IpFilter(config.whitelistIps, {
	detectIp: (req, res) => {
		return req.headers['x-forwarded-for'] ? (req.headers['x-forwarded-for']).split(',')[0] : '';		// remove detectIp if x-forwarded-for not supported
	},
	mode: 'allow',
}));

app.use(bodyParser.json());

app.use('/', (req, res, next) => {
	proxyLogger.info(req.originalUrl);
	if (req.body) {
		proxyLogger.info(JSON.stringify(req.body));
	}
	next();
}, createProxyMiddleware({
	target: 'https://api.openai.com',
	changeOrigin: true,
	onProxyReq: (proxyReq, req, res) => {
		console.log(req.originalUrl);

		proxyReq.setHeader('Authorization', `Bearer ${config.apiKey}`);

		if (!req.body || !Object.keys(req.body).length) {
			return;
		}

		const contentType = proxyReq.getHeader('Content-Type');
		let bodyData;

		if (contentType === 'application/json') {
			bodyData = JSON.stringify(req.body);
		}

		if (bodyData) {
			proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
			proxyReq.write(bodyData);
		}
	},
	onProxyRes: (proxyRes, req, res) => {
		proxyRes.headers['Access-Control-Allow-Origin'] = '*';
		proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With';
	},
}));

app.use((err, req, res, next) => {
	if (err instanceof IpDeniedError) {
		res.status(401);
	} else {
		res.status(err.status || 500);
	};

	res.render('error', {
		message: 'You shall not pass',
		error: err
	});
})

app.listen(config.port, () => {
	console.log(`Server started... (port: ${config.port})`);
});
