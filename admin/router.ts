import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { createUser, getUserInfo, getUsers, login } from "./module";
import {authorizeUser, ensureAdmin} from '../utils/auth'
const router = Router();

router.post("/login", login);
router.post('/users/create', authorizeUser,ensureAdmin, createUser);
router.get('/users', authorizeUser,ensureAdmin, getUsers);
router.get('/users/:id', authorizeUser,ensureAdmin, getUserInfo)



export = router;
