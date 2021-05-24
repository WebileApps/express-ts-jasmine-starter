import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { activateUser, assignReportee, createUser, deactivateUser, getUserInfo, getUsers, login } from "./module";
import {authorizeUser, ensureAdmin} from '../utils/auth'
const router = Router();

router.post("/login", login);
router.post('/users/create', authorizeUser,ensureAdmin, createUser);
router.get('/users', authorizeUser,ensureAdmin, getUsers);
router.get('/users/:id', authorizeUser,ensureAdmin, getUserInfo);
router.get('/users/:id/activate', authorizeUser,ensureAdmin, activateUser);
router.get('/users/:id/deactivate', authorizeUser,ensureAdmin, deactivateUser);
router.post('/users/:id/assign_reportee', authorizeUser,ensureAdmin,assignReportee );


export = router;
