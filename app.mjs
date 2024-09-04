import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import chalk from 'chalk';
import moment from 'moment';
import fs from 'fs';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

async function main() {
    try{
        const connection = process.env.NODE_ENV === 'development' ? process.env.MONGO_DB_URL : process.env.ATLAS_URL;
        await mongoose.connect(connection);
        console.log(chalk.green('Database connected'));
    } catch (err) {
        console.error(chalk.red("Error connecting to database: " + err));
    }
}

main().catch(err => console.error(chalk.red(err)));

export const app = express();

app.use(express.json());

app.use(morgan(function (tokens, req, res) {
    const status = tokens.status(req, res)
    
        return [
            chalk.blue(tokens.method(req, res)),
            chalk.green(tokens.url(req, res)),
            status >= 200 && status < 400 ? chalk.bgGreen(tokens.status(req, res)) : chalk.bgRed(tokens.status(req, res)),
            chalk.red(moment().format('YYYY-MM-DD HH:mm')), '-',
            chalk.bgBlack(tokens['response-time'](req, res)), 'ms'
        ].join(' ')
    }
));    

app.use(express.static('public'));

app.use(cors({
    origin: true,
    credentials: true,
    methods: 'GET,POST,PUT,DELETE,PATCH',
    allowedHeaders: 'Content-Type, Authorization',
}));

app.use((req, res, next) => {
    const fileName = 'log_' + moment().format('YYYY-MM-DD') + '.txt';

    res.on('finish', () => {
        if (res.statusCode >= 400) {
            let fileContent = '';
            fileContent += 'Date: ' + moment().format('YYYY-MM-DD HH:mm:ss') + '\n';
            fileContent += 'Method: ' + req.method + '\n';
            fileContent += 'Status code: ' + res.statusCode + '\n';
            fileContent += 'URL: ' + req.originalUrl + '\n';  
            fileContent += 'Error: ' + res.statusMessage + '\n\n';

            fs.mkdirSync('./logs', { recursive: true });
            fs.appendFile('./logs/' + fileName, fileContent, (err) => {
                if (err) {
                    console.error(chalk.red(err));
                }
            });
        }
    });

    next();
});

app.listen(process.env.PORT, () => {
    console.log(chalk.green('Server running on port ' + process.env.PORT));
});

app.get('/', (req, res) => {
    res.send(`Welcome to Mickael Allouche's project`);
});

(async () => {
    await import('./handlers/users/auth.mjs');
    await import('./handlers/users/user.mjs');
    await import('./handlers/cards/cards.mjs');
    await import('./initial-data/initial-data-service.mjs');

    app.get("/*", (req, res) => {
        res.sendFile(path.resolve('public/404.html'));
    });
})();
