import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { login } from "./module";

const router = Router();

router.post("/login", login);

export = router;
