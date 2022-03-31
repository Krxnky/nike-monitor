import Monitor from "../Monitor.mjs";
import Discord from "discord.js";

class SNKRSMonitor extends Monitor {
    constructor(cron, config)
    {
        super(cron);

        this._CONFIG = config;
        this._MONITOR_NAME = 'snkrs-us';

        this.WEBOOK = new Discord.WebhookClient({
            id: '958470588224135188',
            token: '99p2qpyHNUULnIXOhgtP3Tgmb7AHZRiyR0ihhb4b1B9OgjPZeOUrnGG2Y5PU20d-ZUro'
        })

        this._BASE_URL = 'https://api.nike.com/product_feed/threads/v2';
        this._PARAMS = {
            anchor: 0,
            count: 100,
            filter: [
                'marketplace(US)',
                'language(en)',
                'channelId(008be467-6c78-4079-94f0-70e2d6cc4003)',
                'exclusiveAccess(true,false)'
            ]
        };
        this._HEADERS = {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
        }
        this.buildURL();
    }

    async init()
    {
        const job = new CronJob(this.CRON, () => {
            logger.info(`[${this._MONITOR_NAME}] ` + 'fetching products...');
            this.fetchData().then(async data => {

            })
        })

        logger.info(`[${this._MONITOR_NAME}] ` + `started job at ${this.CRON}`);
        job.start();
    }
}

export default SNKRSMonitor;