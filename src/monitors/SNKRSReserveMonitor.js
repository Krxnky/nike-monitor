import Monitor from "../Monitor.mjs";
import Discord from "discord.js";
import Product from "../data/schema/Product.js";
import { CronJob } from 'cron';
import logger from "../Logger.js";
import Reserve from "../data/schema/Reserve.js";

class SNKRSReserveMonitor extends Monitor {
    constructor(cron, config)
    {
        super(cron);

        this._CONFIG = config;
        this._MONITOR_NAME = 'snkrs-pass-us';

        this.WEBOOK = new Discord.WebhookClient({
            id: '958470588224135188',
            token: '99p2qpyHNUULnIXOhgtP3Tgmb7AHZRiyR0ihhb4b1B9OgjPZeOUrnGG2Y5PU20d-ZUro'
        })

        this._BASE_URL = 'https://snkrs.services.nike.com/snkrs/reserve/v1/events/en/US';
        this._HEADERS = {

        }
        this.buildURL();
    }

    async init()
    {
        const job = new CronJob(this.CRON, () => {
            logger.info(`[${this._MONITOR_NAME}] ` + 'fetching passes...');
            this.fetchData().then(async data => {
                if(!data) return logger.error('data == null')
                logger.info(`[${this._MONITOR_NAME}] ` + `success! objects shown: ${data.objects.length}`);

                for(const obj of data.objects)
                {
                    const exists = await Reserve.findOne({eventId: obj.event_id}).exec();
                    if(!exists)
                    {
                        logger.info(`[${this._MONITOR_NAME}] ` + 'new reserve detected')

                        const reserve = this.populateReserve(obj);
                        reserve.save();

                        if(this._CONFIG.sendAlerts) this.sendAlert(reserve, obj);
                    }
                }
            })
        })

        logger.info(`[${this._MONITOR_NAME}] ` + `started job at ${this.CRON}`);
        job.start();
    }

    populateReserve(obj)
    {
        const reserve = new Reserve();
        reserve.eventType = obj.event_type;
        reserve.eventId = obj.event_id;
        reserve.targetId = obj.target_id;
        reserve.releaseInfo = {
            start: obj.reserve_start,
            end: obj.reserve_end
        }
        reserve.imageUrl = obj.assets.inbox_asset_url;
        reserve.assets = {
            colorway: obj.assets.colorway,
            name: obj.assets.product_name,
            price: obj.assets.price,
            styleCode: obj.assets.style_color
        }

        return reserve;
    }

    sendAlert(reserve, raw_json)
    {
        const event_names = {
            EVENT_PASS: 'SNKRS Pass',
            EVENT_HUNT: 'SNKRS Hunt'
        }

        logger.info(`[${this._MONITOR_NAME}] ` + 'sending alert...');
        logger.info(`[${this._MONITOR_NAME}] ` + 'reserve info:\n'+ JSON.stringify(raw_json));

        const embed = new Discord.MessageEmbed()
        .setAuthor({name: `${reserve.assets.name} ${reserve.assets.colorway}`})
        .setTitle((event_names)[reserve.eventType])
        .setURL()
        .addField('Type', reserve.eventType, true)
        .addField('Starts', ` <t:${Math.floor(reserve.releaseInfo.start.getTime() / 1000)}:F>`, true)
        .addField('Ends', ` <t:${Math.floor(reserve.releaseInfo.end.getTime() / 1000)}:F>`, true)
        .addField('Price', reserve.assets.price, true)
        .addField('Assets', `Colorway: **${reserve.assets.colorway}**\nName: **${reserve.assets.name}**\nPrice: **${reserve.assets.price}**\n\`${reserve.assets.styleCode}\``)
        .setColor('AQUA')
        .setFooter({ text: new Date().toLocaleTimeString() + ' CST' })
        .setThumbnail(reserve.imageUrl);

        this.WEBOOK.send({embeds: [embed]});
        this.WEBOOK.send(`\`\`\`json\n${JSON.stringify(raw_json)}\n\`\`\``)
    }
}

export default SNKRSReserveMonitor;