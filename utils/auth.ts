import { StatusCodes } from "http-status-codes";
import { UserModel } from "../users/users-model";
const { Types } = require("mongoose");
const jwt = require("jsonwebtoken");

export const decode = (token: string) => {
  let decodedData = null;
  jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
    if (err) {
      throw new Error("Failed to authenticate token.");
    }
    decodedData =  decoded;
  });
  return decodedData
};

export const authorizeUser = async (req, res, next) => {
  let token = null;
  if (req.headers && req.headers.authorization) {
    let parts = req.headers.authorization.split(" ");
    if (parts.length == 2 && parts[0] == "Bearer") {
      token = parts[1];
    }
  }
  try {
    if (token) {
      const { id }: any = decode(token);
      const user = await getUserById(id);
      if (!user) {
        throw new Error(
          JSON.stringify({ code: StatusCodes.FORBIDDEN, message: "Invalid user" })
        );
      }
      next();
    } else {
      throw new Error(
        JSON.stringify({
          statusCode: 401,
          message: "Unable to find auth headers",
        })
      );
    }
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).send({message : error.message})
  }
};

const getUserById = async function (userId) {
  if (!Types.ObjectId.isValid(userId)) {
    return null;
  }
  const user = await UserModel.findById(userId, {
    password: 0,
    active: 0,
    google_signup: 0,
    googleId: 0,
  })
    .populate([{ path: "manager", select: "id name email" }])
    .exec();
  if (!user) {
    throw new Error('No User Found.');
  }
  return user;
};
