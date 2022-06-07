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
            id: '983524523175444490',
            token: 'cPmpTgfqg0BginBcP-UV4LbK9RH0SNuHO64j2NKOJ14AnE1jG0-YUeLpr8jWIfeDeiOe'
        })

        this._BASE_URL = 'https://snkrs.services.nike.com/snkrs/reserve/v1/events/en/US'; // /snkrs/hunts/v1?locale=en_US&country=US&lazy=true&clear=true
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

                        if(this._CONFIG.sendAlerts) this.sendAlert(reserve);
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

    sendAlert(reserve)
    {
        const event_names = {
            EVENT_PASS: 'SNKRS Pass',
            EVENT_HUNT: 'SNKRS Hunt'
        }

        logger.info(`[${this._MONITOR_NAME}] ` + 'sending alert...');
        logger.info(`[${this._MONITOR_NAME}] ` + 'reserve info:\n'+ reserve);

        const embed = new Discord.MessageEmbed()
        .setTitle((event_names)[reserve.eventType])
        .setDescription(`${reserve.assets.name} ${reserve.assets.colorway}`)
        .addField('Starts', ` <t:${Math.floor(reserve.releaseInfo.start.getTime() / 1000)}:F>`, true)
        .addField('Ends', ` <t:${Math.floor(reserve.releaseInfo.end.getTime() / 1000)}:F>`, true)
        .addField('Price', reserve.assets.price, true)
        .setColor('AQUA')
        .setTimestamp()
        .setFooter({ text: 'Monitor By Krxnky#1274'})
        .setThumbnail(reserve.imageUrl);

        this.WEBOOK.send({embeds: [embed]});
    }
}

export default SNKRSReserveMonitor;