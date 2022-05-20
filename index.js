import 'dotenv/config'
import logger from "./src/Logger.js";
import Database from "./src/data/Database.mjs";
import NikeMonitor from "./src/monitors/NikeMonitor.js";
import SNKRSMonitor from "./src/monitors/SNKRSMonitor.mjs";
import Product from './src/data/schema/Product.js';
import SNKRSReserveMonitor from './src/monitors/SNKRSReserveMonitor.js';
import axios from 'axios';

Database.connect(true).then(async () => {
    logger.info('initializing monitor...');
    new NikeMonitor('30 */1 * * * *', { sendAlerts: true }).init();
    new SNKRSReserveMonitor('30 */1 * * * *', { sendAlerts: true }).init();
})