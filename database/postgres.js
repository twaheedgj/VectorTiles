import pkg from 'pg';
const { Pool } = pkg;
import {USER,DB_PORT,HOST,DATABASE,PASSWORD} from '../config/env.js';

const pool= new Pool({
    user: USER,
    host: HOST,
    database: DATABASE,
    password: PASSWORD,
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