const express = require("express");
import { Application, NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as mongoose from "mongoose";
import * as morgan from "morgan";
const YAML = require('yamljs');
import * as usersRouter from "./users/router";
import * as adminRouter from "./admin/router";
import { authorizeUser } from "./utils/auth";
import { APIError } from "./utils/api-error";

const app: Application = express();

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = YAML.load('./apidoc/swagger.yaml');

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(_ => {
        console.log("Connected to database successfully");
    }).catch(err => {
        console.log("Failed connecting to database");
        console.error(err);
    });

app.use(morgan('common'));
app.use(authorizeUser);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.json())

app.use("/users", usersRouter);
app.use("/admin", adminRouter);

app.get("/", async (req, res, next) => {
    res.status(StatusCodes.OK).send('Hello from Users API. API Documentation can be found <a href="./api-docs/">here</a>');
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    if (error instanceof APIError) {
        const apiError: APIError = error as APIError;
        res.status(apiError.code).send({ message: apiError.message });
    } else {
        res.status(StatusCodes.BAD_REQUEST).send({ message: error.message });
    }
})

export = app;