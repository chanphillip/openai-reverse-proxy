const log4js = require('log4js');

module.exports = () => {
    log4js.configure({
        appenders: {
            proxy: {
                type: 'dateFile',
                filename: 'logs/proxy/proxy',
                pattern: 'yyyy-MM-dd.log',
                numBackups: 14,
                alwaysIncludePattern: true,
                keepFileExt: true,
                layout: {
                    type: 'pattern',
                    pattern: '%d [%p] %m'
                }
            },
        },
        categories: {
            default: { appenders: ['proxy'], level: 'ALL' },
        }
    });
};
