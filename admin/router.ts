import { Router } from "express";
import { activateUser, assignReportee, createUser, deactivateUser, getUserInfo, getUsers, login } from "./module";
import { ensureAdmin } from '../utils/auth'
const router = Router();

router.post("/login", login);
router.post('/users/create', ensureAdmin, createUser);
router.get('/users', ensureAdmin, getUsers);
router.get('/users/:id', ensureAdmin, getUserInfo);
router.get('/users/:id/activate', ensureAdmin, activateUser);
router.get('/users/:id/deactivate', ensureAdmin, deactivateUser);
router.post('/users/:id/assign_reportee', ensureAdmin, assignReportee);


export = router;
