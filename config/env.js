import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const { PORT, NODE_ENV } = process.env;

export const { DB_USER, DB_HOST, DB_NAME, DB_PORT, DB_PASSWORD } = process.env;