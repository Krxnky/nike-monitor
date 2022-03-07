import axios from 'axios';

class Monitor {
    constructor(interval = 5 * 60) 
    {
        this._BASE_URL;
        this._PARAMS = {};
        this.URL = '';
        this._METHOD = 'GET';
        this._HEADERS = {};
        
        this.INTERVAL = interval;
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

    async fetchData()
    {
        try {
            const res = await axios(this.URL, {
                method: this._METHOD,
                headers: this._HEADERS
            })
            return res.data;
        }
        catch (error)
        {
            console.error(error.message);
        }
    }
}

export default Monitor;