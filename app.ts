const express = require("express");
import { Application, Request, Response, Handler } from "express";
import { StatusCodes } from "http-status-codes";

const app : Application = express();

const wait = (x: number= 2) => new Promise(resolve => setTimeout(resolve, x * 1000));

app.get("/", async (req, res, next) => {
    await wait();
    res.status(StatusCodes.OK).send({"message" : "Hello folks"});
});

export = app;