import { config } from "dotenv";

config();

export default {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_username: process.env.DATABASE_USERNAME,
  database_password: process.env.DATABASE_PASSWORD,
  database_dialect: process.env.DATABASE_DIALECT,
  database_host: process.env.DATABASE_HOST,
  database: process.env.DATABASE,
  database_port: process.env.DATABASE_PORT,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  access_token_expires: process.env.ACCESS_TOKEN_EXPIRES,
};
