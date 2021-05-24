import { StatusCodes } from "http-status-codes";
import { Roles, UserModel } from "../users/users-model";
const { Types } = require("mongoose");
const jwt = require("jsonwebtoken");

export const decode = (token: string) => {
  let decodedData = null;
  jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
    if (err) {
      throw new Error("Failed to authenticate token.");
    }
    decodedData = decoded;
  });
  return decodedData;
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
      if (!id) {
        throw new Error(
          JSON.stringify({
            code: StatusCodes.FORBIDDEN,
            message: "Invalid  Token",
          })
        );
      }
      req.user_id = id;
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
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .send({ message: error.message });
  }
};

export const getUserById = async function (userId) {
  if (!Types.ObjectId.isValid(userId)) {
    return null;
  }
  const user = await UserModel.findById(userId)
    .populate([{ path: "manager", select: "id name email" }])
    .exec();
  if (!user) {
    throw new Error("No User Found.");
  }
  return user;
};

export const ensureAdmin = async (req, res, next) => {
  const adminInfo = await getUserById(req.user_id);
  if (adminInfo.role !== Roles.SUPER_ADMIN) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .send("Not authorized to perform this action");
  }
  next();
};
