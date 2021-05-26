import { start, stop } from "mongo-unit"
import { connectToDatabase } from "../../database";

export async function startDBServer(): Promise<void> {
    const dbUrl = await start();
    connectToDatabase(dbUrl);
}

export async function stopDBServer(): Promise<void> {
    await stop();
}