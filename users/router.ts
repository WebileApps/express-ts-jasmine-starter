import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { getUserById } from "./module";

const router = Router();

router.get("/", async (req, res, next) => {
    await getUserById("somebody");
    res.status(StatusCodes.OK).send({ "message": "Hello from users" });
})
export = router;
