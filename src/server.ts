import "reflect-metadata";
import config from "config";
import app from "./app";
import { AppDataSource } from "./data-source";

const port: string = config.get<string>("port");

// Test the connection
AppDataSource.initialize()
  .then(async () => {
    console.log("Successfully connected to the database");
  })
  .catch((error) => console.log("Error connecting to database", error));

const server = app.listen(port, async (): Promise<void> => {
  console.log(`server started running at ${port}`);
});
