import { StatusCodes } from "http-status-codes";
import { Roles, UserModel } from "../users/users-model";
const jwt = require("jsonwebtoken");
import * as bcrypt from "bcryptjs";
import { getUserById } from "../utils/auth";

/**
 * Super Admin Login
 * @param body
 * @returns Promise<LoginPayload>
 */
export async function login(body: LoginType): Promise<LoginPayload & AuthType> {
  const { email, password } = body;
  const user = await UserModel.findOne({ email }).exec();

  if (!user || user?.role !== Roles.SUPER_ADMIN) {
    throw new Error("User not found");
  }
  let isPasswordValid = bcrypt.compareSync(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid Credintials");
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: 24 * 60 * 60,
  });

  const { role, id, name } = user;
  return {
    id,
    role,
    email,
    name,
    token: `Bearer ${token}`,
  };
}

/**
 * Create default admin in database
 */
export const createDeafultUser = async () => {
  console.log('Startup funtion called')
  const user = await UserModel.findOne({
    email: "webileadmin@webileapps.com",
  }).exec();
  if (!user) {
    try {
      await UserModel.create([
        {
          name: "webile admin",
          email: "webileadmin@webileapps.com",
          password: "webile@123",
          role: Roles.SUPER_ADMIN,
        },
      ]);
      console.log('Admin created successfully')
    } catch (err) {
      throw new Error("Something went wrong");
    }
  }

};

/**
 * Creating User By Super Admin
 * @param body
 * @returns Promise<UserCreatePayload>
 */
export const createUser = async (
  body: UserCreateType
): Promise<UserCreatePayload> => {
  const { name = "", email } = body;
  try {
    if (!email) throw new Error("Email id required to create user.");
    const isUserExist = await UserModel.findOne({ email }).exec();
    if (isUserExist) throw new Error("User already Exists");
    const user = await UserModel.create([
      {
        name,
        email,
      },
    ]);
    if (!user.length) throw new Error("Something went wrong.");
    return { id: user[0].id };
  } catch (err) {
    throw err;
  }
};

/**
 * Fetching User list
 * @param
 * @returns Promise<UserPayload[]>
 */
export const getUsers = async (): Promise<UserPayload[]> => {
  try {
    const dbUsers = await UserModel.find({}).exec();
    const users: UserPayload[] = dbUsers
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
    return users;
  } catch (err) {
    throw err;
  }
};

/**
 * Fetch User By Id
 * @param id
 * @returns Promise<UserPayload>
 */
export const getUserInfo = async (id: string): Promise<UserPayload> => {
  try {
    const user = await getUserById(id);
    if (!user) {
      throw new Error("Invalid user id supplied");
    }
    const { role, active, reportee, email, name } = user;
    return {
      id,
      role,
      active,
      reportee,
      email,
      name,
    };
  } catch (err) {
    throw err;
  }
};

/**
 * Activate User By Super Admin
 * @param id
 * @returns Promise<any>
 */
export const activateUser = async (id: string): Promise<any> => {
  try {
    const user = await getUserById(id);
    if (!user) {
      throw new Error("Invalid user id supplied");
    }
    if (!!user.active) {
      throw new Error("User is already in active state");
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
    return { message: "User activated successfully" };
  } catch (err) {
    throw err;
  }
};

/**
 * Deactivate User By Super Admin
 * @param id
 * @returns Promise<any>
 */
export const deactivateUser = async (id: string): Promise<any> => {
  try {
    const user = await getUserById(id);
    if (!user) {
      throw new Error("Invalid user id supplied");
    }
    if (!user.active) {
      throw new Error("User is already in deactivate state");
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
    return { message: "User deactivated successfully" };
  } catch (err) {
    throw err;
  }
};

/**
 * Assigning Reportee By Super Admin
 * @param id
 * @param body
 * @returns Promise<any>
 */
export const assignReportee = async (
  id: string,
  body: AddReporteType
): Promise<any> => {
  try {
    const { reportee } = body;
    if (!reportee && !!reportee?.id) {
      throw new Error("Reportee is required");
    }
    if (id === reportee.id) {
      throw new Error("Cannot assign user has own reportee");
    }
    const [user, reporteeInfo] = await Promise.all([
      getUserById(id),
      getUserById(reportee.id),
    ]);

    if (!user) {
      throw new Error("Invalid user id supplied");
    }
    if (!reporteeInfo) {
      throw new Error("Reportee not found");
    }

    const updatedUserInfo = await UserModel.findOneAndUpdate(
      { _id: id },
      { $set: { reportee: reportee.id } }
    );
    if (!updatedUserInfo) {
      throw new Error(" Unable assign reportee.Please try again");
    }
    return { message: "Reportee assigned successfully" };
  } catch (err) {
    throw err;
  }
};
