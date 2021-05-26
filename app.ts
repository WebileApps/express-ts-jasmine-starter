const express = require("express");
import { Application, NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as morgan from "morgan";
import { load as loadYaml } from "yamljs";
import { authorizeUser } from "./utils/auth";
import { APIError } from "./utils/api-error";
import { connectToDatabase } from "./database";

const app: Application = express();

/**
 * Database connection.
 */
connectToDatabase(process.env.DB_URI);

/**
 * Adds logging for all the requests.
 */
app.use(morgan('common'));

/**
 * Custom middleware to handler the `Authorization` header in the request.
 */
app.use(authorizeUser);

/**
 * Load swagger.yml and expose swagger ui at route `api-docs`
 */
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = loadYaml('./apidoc/swagger.yaml');
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/**
 * Body parser for the incoming json content types.
 */
app.use(express.json())

/**
 * Routers for admin and employee users.
 */
// import * as usersRouter from "./users/router"
// app.use("/users", usersRouter);

/**
 * Root handler just for testing if the api is working.
 */
app.get("/", async (req, res, next) => {
    res.status(StatusCodes.OK).send('Hello from Users API. API Documentation can be found <a href="./api-docs/">here</a>');
});

/**
 * Common error handler for the app.
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    if (error instanceof APIError) {
        const apiError: APIError = error as APIError;
        res.status(apiError.code).send({ message: apiError.message });
    } else {
        res.status(StatusCodes.BAD_REQUEST).send({ message: error.message });
    }
})

export = app;