var { UserModel, Roles } = require("./users-model");
var { Types } = require("mongoose");
var { sign, verify } = require("jsonwebtoken");
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = require('../config/credentials').client_id
const client = new OAuth2Client(CLIENT_ID);

const JWT_TOKEN_EXPIRE_PERIOD = "60 days";
const JWT_SECRET = "lms-api-1234#$"
const emailRegEx = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

const login = async function (event, context, callback) {
    try {
        // console.log(event, typeof event)
        const { email, password, newPassword } = JSON.parse(event.body);
        // const { email, password, newPassword } = (event.body);
        if (!email) {
            throw new Error(JSON.stringify({ statusCode: 400, message: "No email entered" }));
        }
        if (!emailRegEx.test(email)) {
            throw new Error(JSON.stringify({ statusCode: 400, message: "Please check entered email" }));
        }
        if (!password) {
            throw new Error(JSON.stringify({ statusCode: 400, message: "No password entered" }));
        }
        const user = await UserModel.findOne(
            { email: email },
            {
                google_signup: 0,
                googleId: 0
            }
        ).exec();
        console.log(user, "user")
        if (!user) {
            throw new Error(JSON.stringify({ statusCode: 400, message: "Invalid credentials" }));
        }
        if (!user.active || user.active == false) {
            throw new Error(JSON.stringify({ statusCode: 400, message: "Your account has been deactivated, please contact the admin to reactivate" }));
        }
        if (!(await (user).validatePassword(password))) {
            throw new Error(JSON.stringify({ statusCode: 400, message: "Invalid credentials" }));
        }
        if (newPassword) {
            user.set("password", newPassword);
            await user.save();
        }
        console.log(user.id)
        return {
            token: await encode(user.id, (user).email, (user).role)
        }
    } catch (error) {
        throw error;
    }
}

export async function googleLogin(token) {
    try {
        if (!token) {
            throw new Error(JSON.stringify({ statusCode: 400, message: "Token is required" }));
        }
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const audience = payload.aud;
        if (audience !== CLIENT_ID) {
            throw new Error(JSON.stringify({ statusCode: 400, message: "ClientId Mismatched" }));
        }
        const email = payload['email']
        const user = await UserModel.findOne(
            { email: email, active: true }
        ).exec();
        console.log(user, "user")
        if (!user) {
            throw new Error(JSON.stringify({ statusCode: 400, message: "User Not Found" }));
        }
        const userInfo = await UserModel.findByIdAndUpdate(
            user.id,
            { $set: { google_signup: true, googleId: payload['sub'] } },
            { new: true, select: "id name email manager" }
        ).populate([{ path: "manager", select: "id name email" }])
            .exec()
        // const userInfo = {
        //   name: payload['name'], //profile name
        //   pic: payload['picture'], //profile pic
        //   id: payload['sub'], //google id
        //   email_verified: payload['email_verified'],
        //   email: payload['email'],
        //   successMessage: `User logged in successfully`
        // }
        return {
            userInfo, token: await encode(user.id, (user).email, (user).role)
        };
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function getUserById(userId) {
    if (!Types.ObjectId.isValid(userId)) {
        return null;
    }
    const user = await UserModel.findById(userId, {
        password: 0,
        google_signup: 0,
        googleId: 0
    })
        .populate([{ path: "manager", select: "id name email" }])
        .exec();
    if (!user) {
        throw new Error(JSON.stringify({ statusCode: 400, message: "No user found" }));
    }
    return (user).toJSON();
}

const editUserById = async function (id, body) {
    return await UserModel.findByIdAndUpdate(
        id,
        { $set: { ...body } },
        { new: true, select: "id name email manager" }
    )
        .populate([{ path: "manager", select: "id name email" }])
        .exec();
}

const encode = function (id, email, role) {
    return sign({ id, email, role }, (process.env).JWT_SECRET || JWT_SECRET, {
        expiresIn: JWT_TOKEN_EXPIRE_PERIOD
    });
}

const decode = function (token) {
    const payload = verify(token, (process.env).JWT_SECRET || JWT_SECRET);
    return payload;
}

const createDeafultUser = async function () {
    const user = await UserModel.findOne({
        email: "webileadmin@webileapps.com"
    }).exec();
    if (!user) {
        const end = new Date(
            new Date().setFullYear(
                new Date().getFullYear() + 4,
                new Date().getMonth(),
                new Date().getDate()
            )
        ).setHours(0, 0, 0, 0);
        const users = await UserModel.create([
            {
                name: "webile admin",
                email: "webileadmin@webileapps.com",
                password: "webile@123",
                role: Roles.SUPER_ADMIN
            }
        ]);
        console.log("Default admin and user created and wokrouts created");
    }
}

const test = async function () {
    let a = await UserModel.find({}).exec();
    return a;
}

const getListOfManageUsers = async function (userId) {
    if (!Types.ObjectId.isValid(userId)) {
        return null;
    }
    let userWithSubEmployeeDetails = await UserModel.aggregate([
        { $match: { "_id": Types.ObjectId(userId) } },
        {
            $graphLookup: {
                from: "users",
                startWith: "$_id",
                connectFromField: "_id",
                connectToField: "manager",
                maxDepth: 10,
                depthField: "deapth",
                as: "manages"

            }
        },
        {
            $project: {
                "name": 1,
                "email": 1,
                "role": 1,
                "Manages": "$manages"
            }
        }
    ])
    // if (!user) {
    //   throw new Error(JSON.stringify({ statusCode: 400, message: "No user found" }));
    // }
    return userWithSubEmployeeDetails;
}

const checkFroManager = async function (userId) {
    if (!Types.ObjectId.isValid(userId)) {
        return null;
    }
    let userWithSubEmployeeDetails = await UserModel.aggregate([
        { $match: { "_id": Types.ObjectId(userId) } },
        {
            $graphLookup: {
                from: "users",
                startWith: "$_manager",
                connectFromField: "manager",
                connectToField: "_id",
                maxDepth: 10,
                depthField: "deapth",
                as: "managers"

            }
        },
        {
            $project: {
                "name": 1,
                "email": 1,
                "role": 1,
                "Manages": "$manages"
            }
        }
    ])
    // if (!user) {
    //   throw new Error(JSON.stringify({ statusCode: 400, message: "No user found" }));
    // }
    return userWithSubEmployeeDetails;
}

