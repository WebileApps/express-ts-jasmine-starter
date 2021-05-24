import { StatusCodes } from "http-status-codes";
import { Roles, UserModel } from "../users/users-model";
const jwt = require("jsonwebtoken");
import * as bcrypt from "bcryptjs";
import { getUserById } from "../utils/auth";

/**
 * Super Admin Login
 * @param req
 * @param res
 * @param next
 * @returns Promise<any>
 */
export async function login(req, res, next): Promise<any> {
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
    token: `Bearer ${token}`,
  });
}

/**
 * Create default admin in database
 */
export const createDeafultUser = async () => {
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

/**
 * Creating User By Super Admin
 * @param req
 * @param res
 * @param next
 * @returns Promise<any>
 */
export const createUser = async (req, res, next): Promise<any> => {
  const { name = "", email } = req.body;
  try {
    if (!email) {
      throw new Error("Email id required to create user.");
    }
    const isUserExist = await UserModel.findOne({ email }).exec();
    if (isUserExist) {
      throw new Error("User already Exists");
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

/**
 * Fetching User list
 * @param req
 * @param res
 * @param next
 * @returns Promise<any>
 */
export const getUsers = async (req, res, next): Promise<any> => {
  try {
    const dbUsers = await UserModel.find({}).exec();
    const users = dbUsers
      .map((user) => {
        const { id, role, active, reportee, email, name } = user;
        return {
          id,
          role,
          active,
          reportee,
          email,
          name,
        };
      })
      .filter((user) => user.role !== Roles.SUPER_ADMIN);
    return res.status(StatusCodes.OK).send(users);
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: err.message });
  }
};

/**
 * Fetch User By Id
 * @param req
 * @param res
 * @param next
 * @returns Promise<any>
 */
export const getUserInfo = async (req, res, next): Promise<any> => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);
    if (!user) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ message: "Invalid user id supplied" });
    }
    const { role, active, reportee, email, name } = user;
    const payload = {
      id,
      role,
      active,
      reportee,
      email,
      name,
    };
    return res.status(StatusCodes.OK).send(payload);
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: err.message });
  }
};

/**
 * Activate User By Super Admin
 * @param req
 * @param res
 * @param next
 * @returns Promise<any>
 */
export const activateUser = async (req, res, next): Promise<any> => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);
    if (!user) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ message: "Invalid user id supplied" });
    }
    if (!!user.active) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ message: "User is already in active state" });
    }

    const updateStatus = await UserModel.findOneAndUpdate(
      { _id: id },
      { $set: { active: true } }
    );
    if (!updateStatus) {
      throw new Error(
        "Failed to activate user. Please try again after sometime "
      );
    }
    return res
      .status(StatusCodes.OK)
      .send({ message: "User activated successfully" });
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: err.message || "Somehthing went wrong" });
  }
};

/**
 * Deactivate User By Super Admin
 * @param req
 * @param res
 * @param next
 * @returns Promise<any>
 */
export const deactivateUser = async (req, res, next): Promise<any> => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);
    if (!user) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ message: "Invalid user id supplied" });
    }
    if (!user.active) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ message: "User is already in deactivate state" });
    }

    const updateStatus = await UserModel.findOneAndUpdate(
      { _id: id },
      { $set: { active: false } }
    );
    if (!updateStatus) {
      throw new Error(
        "Failed to deactivate user. Please try again after sometime "
      );
    }
    return res
      .status(StatusCodes.OK)
      .send({ message: "User deactivated successfully" });
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: err.message || "Somehthing went wrong" });
  }
};

/**
 * Assigning Reportee By Super Admin
 * @param req
 * @param res
 * @param next
 * @returns Promise<any>
 */
export const assignReportee = async (req, res, next): Promise<any> => {
  try {
    const { id } = req.params;
    const { reportee } = req.body;

    if (!reportee && !!reportee?.id) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ message: "Reportee is required" });
    }
    if (id === reportee.id) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ message: "Cannot assign user has own reportee" });
    }

    const [user, reporteeInfo] = await Promise.all([
      getUserById(id),
      getUserById(reportee.id),
    ]);

    if (!user) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ message: "Invalid user id supplied" });
    }
    if (!reporteeInfo) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send({ message: "Reportee not found" });
    }

    const updatedUserInfo = await UserModel.findOneAndUpdate(
      { _id: id },
      { $set: { reportee: reportee.id } }
    );
    if (!updatedUserInfo) {
      throw new Error("Unable assign reportee.Please try again");
    }
    return res
      .status(StatusCodes.OK)
      .send({ message: "Reportee assigned successfully" });
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: err.message || "Somehting went wrong" });
  }
};
