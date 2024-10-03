import { DataSource } from "typeorm";
import config from "config";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: config.get<string>("database_host"),
  port: config.get<number>("database_port"),
  username: config.get<string>("database_username"),
  password: config.get<string>("database_password"),
  database: config.get<string>("database"),
  synchronize: true,
  logging: false,
  entities: [],
  migrations: [],
  subscribers: [],
});
