import axios from 'axios';
import fs from 'fs';
import https from 'https';
import Discord from 'discord.js';

class Monitor {
    constructor(cron = '* * * * */1 *') 
    {
        this._BASE_URL;
        this._PARAMS = {};
        this.URL = '';
        this._METHOD = 'GET';
        this._HEADERS = {};

        this.ERROR_WEBHOOK = new Discord.WebhookClient({
            id: '957843582277021717',
            token: 'W-KTITXhDspi9h9a3qXjfq3BLK56FObvwJPAZ9lOwWhK9yqTQnIfoehVdTthfYe07AoN'
        })
        
        this.CRON = cron;
    }

    buildURL()
    {
        let url = new URL({ toString: () => this._BASE_URL});
        Object.keys(this._PARAMS).forEach(key => {
            if(Array.isArray(this._PARAMS[key]))
            {
                this._PARAMS[key].forEach(item => url.searchParams.append(key, item));
            }
            else
            {
                url.searchParams.append(key, this._PARAMS[key]);
            }
        })
        this.URL = url.toString();
    }

    async fetchData(useProxy)
    {
        const options = {
            method: this._METHOD,
            headers: this._HEADERS,
            httpsAgent: new https.Agent({rejectUnauthorized: false})
        }

        if(useProxy) {
            const proxy = this.getProxy();
            console.log(proxy);
            options.proxy = {
                protocol: 'https',
                host: proxy[0],
                port: proxy[1]
            }
        }

        try {
            const res = await axios(this.URL, options)
            return res.data;
        }
        catch (error)
        {
            console.error(error.message);
            this.sendError(error.message);
        }
    }

    getProxy()
    {
        const proxyArr = fs.readFileSync('./http_proxies.txt', 'utf-8').split('\n');
        const random = Math.floor(Math.random() * proxyArr.length);
        return proxyArr[random].trimEnd().split(':');
    }

    sendError(error)
    {
        const embed = new Discord.MessageEmbed()
        .setTitle('Error')
        .setDescription(error)
        .setFooter({ text: new Date().toLocaleTimeString() + ' CST' })
        .setColor(0xad2828);

        this.ERROR_WEBHOOK.send({embeds: [embed]});
    }
}

export default Monitor;