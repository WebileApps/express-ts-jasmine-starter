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
    token:`Bearer ${token}`,
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

export const createUser = async (req, res, next) => {
  const { name = "", email } = req.body;
  try {
    if (!email) {
      throw new Error("Email id required to create user.");
    }
    const isUserExist = await UserModel.findOne({email}).exec();
    if(isUserExist){
      throw new Error('User already Exists')
    }
    const user = await UserModel.create([
      {
        name,
        email,
      },
    ]);
    if (!user) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: "Something went wrong." });
    }
    return res.status(StatusCodes.OK).send({ id: user.id });
  } catch (err) {
    return res.status(StatusCodes.BAD_REQUEST).send({ message: err.message });
  }
};