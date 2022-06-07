import Monitor from "../Monitor.mjs";
import Discord from "discord.js";
import Product from "../data/schema/Product.js";
import { CronJob } from 'cron';
import logger from "../Logger.js";

class NikeMonitor extends Monitor {
    constructor(cron, config)
    {
        super(cron);

        this._CONFIG = config;
        this._MONITOR_NAME = 'nike-us';

        this.WEBOOKS = {
            nike: {
                active: new Discord.WebhookClient({
                    id: '983521715478994964',
                    token: 'rywQSSFn8Xan7XhH2ipJHeR2TuLsC8_EkVmWe99aPd7fRECxlJk5K6UHcGEWxeRfcyzG'
                }),
                inactive: new Discord.WebhookClient({
                    id: '983521825030012938',
                    token: 'BwR1XOHPgmIvBqHoryzyIvQHkGvfaCKOz_p-NN4AGGJWy9zje9DWM9nVV3a6YxLJYuQN'
                })
            },
            snkrs: {
                active: new Discord.WebhookClient({
                    id: '983522053967736863',
                    token: 'lhMfAKJoXi6FdQ6epLeoT0uwkQbYyWX4HfR49ijCrY12Sd0361jb5JKt86L1HuFLUdRo'
                }),
                inactive: new Discord.WebhookClient({
                    id: '983522108191674378',
                    token: 'Duvk_C0u7lyfbgdIPA0my3AA86SH6NsApqvOH_-L_HFSAvx4CXalUAnGzdIY80rBND2V'
                })
            }
        }

        this._CHANNELS = {
            '010794e5-35fe-4e32-aaff-cd2c74f89d61': 'SNKRS Web',
            '008be467-6c78-4079-94f0-70e2d6cc4003': 'SNKRS',
            '82a74ac1-c527-4470-b7b0-fb5f3ef3c2e2': 'Nike App',
            'd9a5bc42-4b9c-4976-858a-f159cf99c647': 'Nike.com',
            '16134d36-74f2-11ea-bc55-00242ac13000': 'Nike Store Experiences'
        }

        this._BASE_URL = 'https://api.nike.com/product_feed/threads/v2';
        this._PARAMS = {
            anchor: 0,
            count: 100,
            filter: [
                'marketplace(US)',
                'language(en)',
                'channelId(16134d36-74f2-11ea-bc55-00242ac13000)',
                'exclusiveAccess(true,false)',
                'attributeIds(16633190-45e5-4830-a068-232ac7aea82c)',
                'productInfo.merchProduct.channels(NikeApp,SNKRS)'
            ]
        };
        this._HEADERS = {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
            'origin': 'https://www.nike.com',
            'referer': 'https://www.nike.com'
        }
        this.buildURL();
    }

    async init()
    {
        const job = new CronJob(this.CRON, () => {
            logger.info(`[${this._MONITOR_NAME}] ` + 'fetching products...');
            this.fetchData().then(async data => {
                if(this._CONFIG.changePages)
                {
                    this._PARAMS.anchor += this._PARAMS.count;
                    this.buildURL();
                }
                if(!data) return logger.error('data == null')
                logger.info(`[${this._MONITOR_NAME}] ` + `success! page #: ${this._PARAMS.anchor / this._PARAMS.count} total products: ${data.pages.totalResources} objects shown: ${data.objects.length}`);

                for(const obj of data.objects)
                {
                    if(obj.productInfo)
                    {
                        for(const item of obj.productInfo)
                        {
                            if(!item.merchProduct) return;
    
                            const merchProduct = item.merchProduct;
                            const merchPrice = item.merchPrice;
                            const productContent = item.productContent;
                            const launchView = item.launchView;

                            const exists = await Product.findOne({styleCode: merchProduct.styleColor}).exec();
                            if(exists)
                            {
                                const product = this.populateProduct(item, obj);
                                if(product.availabilityInfo.status != exists.availabilityInfo.status /*|| product.availabilityInfo.visible != exists.availabilityInfo.visible*/)
                                {
                                    logger.info(`[${this._MONITOR_NAME}] ` + 'status update')

                                    exists.releaseInfo = product.releaseInfo;
                                    exists.availabilityInfo = product.availabilityInfo;
                                    exists.sizes = product.sizes;
                                    exists.save();
                                    if(this._CONFIG.sendAlerts) this.sendAlert(product, true, 'Availabilty Info Updated');
                                }
                                else if(product.releaseInfo.method != exists.releaseInfo.method || product.releaseInfo.exclusiveAccess != exists.releaseInfo.exclusiveAccess)
                                {
                                    logger.info(`[${this._MONITOR_NAME}] ` + 'release info update')

                                    exists.releaseInfo = product.releaseInfo;
                                    exists.sizes = product.sizes;
                                    exists.save();
                                    if(this._CONFIG.sendAlerts) this.sendAlert(product, true, 'Release Info Updated');
                                }
                            }
                            else
                            {
                                logger.info(`[${this._MONITOR_NAME}] ` + 'new product detected')

                                const product = this.populateProduct(item, obj);
                                product.save();

                                if(this._CONFIG.sendAlerts) this.sendAlert(product);
                            }
                        }
                    }
                   
                }
            })
        })

        logger.info(`[${this._MONITOR_NAME}] ` + `started job at ${this.CRON}`);
        job.start();
    }

    populateProduct(item, obj)
    {
        const publishedContent = obj.publishedContent;
        const merchProduct = item.merchProduct;
        const merchPrice = item.merchPrice;
        const productContent = item.productContent;
        const launchView = item.launchView;
        const availableSkus = item.availableSkus;
        const skus = item.skus;

        const product = new Product();
        product.styleCode = merchProduct.styleColor;
        product.name = productContent.fullTitle;
        product.color = productContent.colorDescription;
        product.imageUrl = item.imageUrls.productImageUrl;
        product.slug = productContent.slug;
        product.priceInfo = {
            price: merchPrice.currentPrice,
            currency: merchPrice.currency
        }
        product.availabilityInfo = {
            status: merchProduct.status,
            visible: new Date(publishedContent.viewStartDate) < new Date() && merchProduct.status == 'ACTIVE'
        }

        product.releaseInfo = {};
        if(launchView) {
            product.releaseInfo.method = launchView.method;
            product.releaseInfo.startDate = launchView.startEntryDate
        }
        else {
            product.releaseInfo.startDate = merchProduct.commerceStartDate;
        }
        product.releaseInfo.exclusiveAccess = merchProduct.exclusiveAccess;
        product.releaseInfo.channels = merchProduct.consumerChannels.map(c => this._CHANNELS[c.id]);

        if(availableSkus) {
            product.sizes = availableSkus.map((sku) => ({
                level: sku.level,
                skuId: sku.skuId,
                size: skus.find((x) => x.id == sku.skuId).nikeSize
            }))
        }

        return product;
    }

    sendAlert(product, update = false, updateMsg = 'Product Updated')
    {
        const formatLink = (channel) => {
            return ({
                'SNKRS': `[SNKRS Web](https://www.nike.com/launch/t/${product.slug}) **|** [SNKRS App](https://krxnky.dev/nike-monitor/redirect?url=snkrs://product/${product.styleCode})`,
                'Nike App': `[Nike App](https://krxnky.dev/nike-monitor/redirect?url=mynike://x-callback-url/product-details?style-color=${product.styleCode})`,
                'Nike.com': `[Nike.com](https://www.nike.com/t/${product.slug})`
            })[channel] ?? '';
        }
        const webProductLink = (product.releaseInfo.channels.includes('SNKRS')) ? 'https://www.nike.com/launch/' + product.slug : 'https://www.nike.com/t/' + product.slug;

        logger.info(`[${this._MONITOR_NAME}] ` + 'sending alert...');
        logger.info(`[${this._MONITOR_NAME}] ` + 'product info:\n'+ JSON.stringify(product));
        const embed = new Discord.MessageEmbed()
        .setAuthor({name: product.color, url: webProductLink})
        .setTitle(product.name)
        .setURL(webProductLink)
        .setThumbnail(product.imageUrl)
        .setTimestamp()
        .setFooter({ text: 'Monitor By Krxnky#1274'})
        .setColor(0xFFFFFF);

        embed.addField('Status', `${product.availabilityInfo.status} ${(product.availabilityInfo.visible) ? ':white_check_mark:' : ':x:'}`, true)
        embed.addField('Style Code', product.styleCode, true)
        embed.addField('Price', `${product.priceInfo.price} ${product.priceInfo.currency}`, true)
        embed.addField('Release Info', `<t:${Math.floor(product.releaseInfo.startDate.getTime() / 1000)}:F>\nExclusive Access: ${(product.releaseInfo.exclusiveAccess) ? ':white_check_mark:' : ':x:'}\nRelease Type: **${product.releaseInfo.method}**\n${product.releaseInfo.channels.filter(c => c !== 'Nike Store Experiences').map(c => `**${c}**`).join(' ')}`)
        if(product.sizes.length > 0) 
        {
            embed.addField('Sizes', product.sizes.slice(0, Math.ceil(product.sizes.length / 2)).map((x) => `${x.size} - [${x.level}]`).join('\n'), true)
            embed.addField('\u200B', product.sizes.slice(-Math.ceil(product.sizes.length / 2)).map((x) => `${x.size} - [${x.level}]`).join('\n'), true)
        }
        embed.addField('Links', product.releaseInfo.channels.map((channel) => ' **|** ' + formatLink(channel)).join(''))

        if(update) 
        {
            embed.setDescription(updateMsg);
            embed.setColor('NAVY');
        }

        switch (product.availabilityInfo.status)
        {
            case 'CLOSEOUT':
            case 'ACTIVE':
                if(product.releaseInfo.channels.includes(Object.values(this._CHANNELS).find((x) => x == 'SNKRS')) || product.releaseInfo.channels.includes(Object.values(this._CHANNELS).find((x) => x == 'SNKRS Web')))
                {
                    this.WEBOOKS.snkrs.active.send({embeds: [embed]});
                }
                else
                {
                    this.WEBOOKS.nike.active.send({embeds: [embed]});
                }
            break;

            default:
                if(product.releaseInfo.channels.includes(Object.values(this._CHANNELS).find((x) => x == 'SNKRS')) || product.releaseInfo.channels.includes(Object.values(this._CHANNELS).find((x) => x == 'SNKRS Web')))
                {
                    this.WEBOOKS.snkrs.inactive.send({embeds: [embed]});
                }
                else
                {
                    this.WEBOOKS.nike.inactive.send({embeds: [embed]});
                }
                break;
        }
    }
}

export default NikeMonitor;