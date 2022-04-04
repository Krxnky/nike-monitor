import mongoose from "mongoose";
import logger from "../Logger.js";

class Database
{
    static connect(debug = false) {
        if(debug) logger.debug('connected to debug db');
        return mongoose.connect((debug) ? 'mongodb://localhost' : process.env.DB_URL, {
            useNewUrlParser: true, useUnifiedTopology: true
        })
            .then(
                () => logger.info(`connected to database: ${debug ? 'mongodb://localhost' : process.env.DB_URL}`),
                (err) => logger.error('could not connect to database!')
            )
    }
}

export default Database;