import { config } from "dotenv";

config();

export const DEPTH_LIMIT = 5;
export const BATCH_LIMIT = 10;
export const TARGET_WIKI_HREF = "/wiki/Kevin_Bacon";

const SERVER_HOST = process.env.SERVER_HOST || "localhost";
const SERVER_PORT = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 1234;

export const SERVER_CONFIG = {
    SERVER_HOST,
    SERVER_PORT
};
