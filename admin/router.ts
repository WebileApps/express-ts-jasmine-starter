import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { createUser, login } from "./module";
import {authorizeUser} from '../utils/auth'
const router = Router();

router.post("/login", login);
router.post('/users/create', authorizeUser, createUser)

export = router;
