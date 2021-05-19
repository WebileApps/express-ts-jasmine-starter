const express = require("express");
import { Application, Request, Response, Handler } from "express";
import { StatusCodes } from "http-status-codes";
const YAML = require('yamljs');

const app: Application = express();

const wait = (x: number = 2) => new Promise(resolve => setTimeout(resolve, x * 1000));
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = YAML.load('./apidoc/swagger.yaml');

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", async (req, res, next) => {
    await wait();
    res.status(StatusCodes.OK).send({ "message": "Hello folks" });
});

export = app;