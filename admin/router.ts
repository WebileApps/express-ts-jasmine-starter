import { Router } from "express";
import {
  activateUser,
  assignReportee,
  createUser,
  deactivateUser,
  getUserInfo,
  getUsers,
  login,
} from "./module";
import { ensureAdmin } from "../utils/auth";
import { StatusCodes } from "http-status-codes";
const router = Router();

router.post("/login", async (req, res, next) => {
  try {
    const payload: LoginPayload & AuthType = await login(req.body);
    return res.status(StatusCodes.OK).send(payload);
  } catch (err) {
    return res.status(StatusCodes.UNAUTHORIZED).send({ message: err.message });
  }
});

router.post("/users/create", ensureAdmin, async (req, res, next) => {
  try {
    const payload: UserCreatePayload = await createUser(req.body);
    return res.status(StatusCodes.OK).send(payload);
  } catch (err) {
    return res.status(StatusCodes.BAD_REQUEST).send({ message: err.message });
  }
});

router.get("/users", ensureAdmin, async (req, res, next) => {
  try {
    const payload: UserPayload[] = await getUsers();
    return res.status(StatusCodes.OK).send(payload);
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: err.message });
  }
});

router.get("/users/:id", ensureAdmin, async (req, res, next) => {
  try {
    const user: UserPayload = await getUserInfo(req.params.id);
    res.status(StatusCodes.OK).send(user);
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: err.message });
  }
});

router.get("/users/:id/activate", ensureAdmin, async (req, res, next) => {
  try {
    const payload = await activateUser(req.params.id);
    return res.status(StatusCodes.OK).send(payload);
  } catch (err) {
    return res.status(StatusCodes.BAD_REQUEST).send({ message: err.message });
  }
});

router.get("/users/:id/deactivate", ensureAdmin, async (req, res, next) => {
  try {
    const payload = await deactivateUser(req.params.id);
    return res.status(StatusCodes.OK).send(payload);
  } catch (err) {
    return res.status(StatusCodes.BAD_REQUEST).send({ message: err.message });
  }
});

router.post(
  "/users/:id/assign_reportee",
  ensureAdmin,
  async (req, res, next) => {
    try {
      const payload = await assignReportee(req.params.id, req.body);
      return res.status(StatusCodes.OK).send(payload);
    } catch (err) {
      return res.status(StatusCodes.BAD_REQUEST).send({ message: err.message });
    }
  }
);

export = router;
