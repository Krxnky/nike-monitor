import Monitor from "../Monitor.mjs";
import Discord from "discord.js";

class NikeMonitor extends Monitor {
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
            count: 100,
            filter: [
                'marketplace(US)',
                'language(en)',
                'channelId(d9a5bc42-4b9c-4976-858a-f159cf99c647)',
                'exclusiveAccess(true,false)',
                'productInfo.merchProduct.status(INACTIVE)',
            ],
            searchTerms: 'air jordan 1'
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
                    const modificationDate = new Date(obj.productInfo[0].merchProduct.modificationDate);
                     //console.log(modificationDate.getMonth(), modificationDate.getDay(), modificationDate.getFullYear(), obj.productInfo[0].merchProduct.styleColor);
                    if(modificationDate.getDay() >= 5 && modificationDate.getMonth() == 3 && modificationDate.getFullYear() == 2022) 
                    {
                        console.log(modificationDate.getDay(), modificationDate.getFullYear(), obj.productInfo[0].merchProduct.styleColor);
                        console.log(obj.productInfo[0].merchProduct);
                    }
                }
                this._PARAMS.anchor += this._PARAMS.count;
                this.buildURL();
            })
        }, this.INTERVAL);
    }

    validateProduct(data)
    {

    }
}

export default NikeMonitor;