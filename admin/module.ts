import { StatusCodes } from "http-status-codes";
import { Roles, UserModel } from "../users/users-model";
const jwt = require("jsonwebtoken");
import * as bcrypt from "bcryptjs";

export async function login(req, res, next) {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email }).exec();

  if (!user || user?.role !== Roles.SUPER_ADMIN) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .send({ message: "Invalid user" });
  }
  let isPasswordValid = bcrypt.compareSync(password, user.password);

  if (!isPasswordValid) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .send({ message: "Invalid Credintials" });
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: 24 * 60 * 60,
  });
  const { role, id, name } = user;
  return res.status(StatusCodes.OK).send({
    id,
    role,
    email,
    name,
    token,
  });
}

export const createDeafultUser = async function () {
  const user = await UserModel.findOne({
    email: "webileadmin@webileapps.com",
  }).exec();
  if (!user) {
    await UserModel.create([
      {
        name: "webile admin",
        email: "webileadmin@webileapps.com",
        password: "webile@123",
        role: Roles.SUPER_ADMIN,
      },
    ]);
    console.log("Default admin and user created and wokrouts created");
  }
};
