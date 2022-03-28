import 'dotenv/config'
import Database from "./src/data/Database.mjs";
import NikeMonitor from "./src/monitors/NikeMonitor.js";
import SNKRSMonitor from "./src/monitors/SNKRSMonitor.mjs";

Database.connect();
console.log('initializing monitor...');
new NikeMonitor('*/2 * * * * *').init()

