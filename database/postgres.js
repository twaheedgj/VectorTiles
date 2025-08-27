import pkg from 'pg';
const { Pool } = pkg;
import {DB_USER,DB_PORT,DB_HOST,DB_NAME,DB_PASSWORD} from '../config/env.js';

const pool= new Pool({
    user: DB_USER,
    host: DB_HOST,
    database: DB_NAME,
    password: DB_PASSWORD,
    port: DB_PORT,
});

pool.connect()
    .then(client => {
        console.log('Connected to PostgreSQL database');
        client.release();
    })
    .catch(err => {
        console.error('Error connecting to PostgreSQL database', err);
    });

export default pool;