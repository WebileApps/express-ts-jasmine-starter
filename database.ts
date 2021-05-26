import * as mongoose from "mongoose";

export async function connectToDatabase(dbUrl: string) {
    console.log("Connecting to database with url", dbUrl);
    return mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
        .then(_ => {
            console.log("Connected to database successfully");
        }).catch(err => {
            console.log("Failed connecting to database");
            console.error(err);
        });
}