const express = require("express");
import { Application, Request, Response, Handler } from "express";
import { StatusCodes } from "http-status-codes";
import * as mongoose from "mongoose";
const YAML = require('yamljs');
import * as usersRouter from "./users/router";
import * as adminRouter from "./admin/router";


const app: Application = express();

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = YAML.load('./apidoc/swagger.yaml');

console.log(process.env.DB_URI);
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(_ => {
        console.log("Connected to database successfully");
    }).catch(err => {
        console.log("Failed connecting to database");
        console.error(err);
    });

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.json())

app.use("/users", usersRouter);
app.use("/admin", adminRouter);

app.get("/", async (req, res, next) => {
    res.status(StatusCodes.OK).send({ "message": "Hello folks" });
});

export = app;