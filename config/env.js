import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const { PORT, NODE_ENV } = process.env;

export const { USER, HOST, DATABASE, DB_PORT, PASSWORD } = process.env;