import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { PORT ,NODE_ENV } from './config/env.js';
import pool from './database/postgres.js';
import  tile_route  from './routes/tiles.routes.js';
import errorMiddleware from './middleware/error.middleware.js';
const app = express();
app.use(cors({ origin: '*', methods: ['GET','OPTIONS'] }));
app.use(cookieParser());
app.use(express.json());
app.use(errorMiddleware);
app.use('/tile', tile_route);

app.get('/', async(req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT NOW()');
        res.send(`Hello World! Current time is: ${result.rows[0].now}`);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    } finally {
        client.release();
    }
});
app.listen(PORT, () => {
    console.log(`Tiles API running at port ${PORT} in ${NODE_ENV} mode`)
});
