import Monitor from "../Monitor.mjs";
import Discord from "discord.js";

class SNKRSMonitor extends Monitor {
    constructor(interval)
    {
        super(interval);

        this.WEBOOK = new Discord.WebhookClient({
            id: '949908948037804052',
            token: 'pdDeI-ZTHn4gtk-9FiMF-eUQMpXyZ_BDI2OQpVXn-GLHcYYEwlT7BqO6sTm9lS_SXaYl'
        })

        this._BASE_URL = 'https://api.nike.com/product_feed/threads/v3';
        this._PARAMS = {
            anchor: 0,
            count: 50,
            filter: [
                'marketplace(US)',
                'language(en)',
                'channelId(008be467-6c78-4079-94f0-70e2d6cc4003)',
                'exclusiveAccess(true,false)',
                'upcoming(true)'
            ],
            includeContentThreads: true
        };
        this._HEADERS = {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
        }
        this.buildURL();
    }

    async init()
    {
        setInterval(() => {
            this.fetchData().then(data => {
                for(const obj of data.objects)
                {
                    // Checks if object is a product
                    if(obj.productInfo) this.validateProduct(obj);
                    else if(obj.publishedContent)
                    console.log(obj.productInfo.length)
                }
            })
        }, this.INTERVAL);
    }

    validateProduct(data)
    {

    }
}

export default SNKRSMonitor;