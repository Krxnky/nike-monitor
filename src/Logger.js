import winston from 'winston';
import chalk from 'chalk';

const truncate = (str, n) => {
    return (str.length > n) ? str.substr(0, n-1) + '...' : str;
}

const prettyJson = winston.format.printf((info) => {
    const timestamp = new Date().toLocaleTimeString();

    let out = `${chalk.grey(`[${timestamp}]`)} ${info.level} ${chalk.grey(
		'::'
    )} ${info.message}`;
    
    if (Object.keys(info.metadata).length > 0) {
		out = `${out} ${chalk.magenta(JSON.stringify(info.metadata, null, 2))}`;
    }
    
    return out;
})

// const buildProductString = (name, status, style, styleCode, color) => {
//     if(color) {
//         return (
//             chalk.
//         )
//     }
// }

export default winston.createLogger({
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.metadata({
                    fillExcept: ['level', 'message', 'timestamp']
                }),
                prettyJson
            )
        }),
        new winston.transports.File({
            filename: 'logs/combined.log',
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.align(),
                winston.format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`)
            )
        }),
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.align(),
                winston.format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`)
            )
        })
    ]
});