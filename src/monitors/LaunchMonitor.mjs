import Monitor from "../Monitor.mjs";

class LaunchMonitor extends Monitor {
    constructor(interval)
    {
        super(interval);

        this._BASE_URL = 'https://www.nike.com/sitemap-launch-en-us.xml';
        this._PARAMS = {};
        this.buildURL();
    }
}

export default LaunchMonitor;