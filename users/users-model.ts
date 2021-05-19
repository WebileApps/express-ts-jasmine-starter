var { Schema, model } = require("mongoose");
var mongoosepaginate = require("mongoose-paginate");

var bcrypt = require("bcryptjs");
const SALT_WORK_FACTOR = 10;

export const Roles = {
    SUPER_ADMIN: "super_admin",
    ADMIN: "admin",
    EMPLOYEE: "employee",
    HR: "hr",
    MANGER: "manager"
};


const UserSchema = new Schema(
    {
        role: {
            type: String,
            enum: Object.values(Roles),
            default: Roles.EMPLOYEE
        },
        name: {
            type: String,
            maxlength: [16, "Max length cannot be more than 16 characters"],
            trim: true
        },
        phone: {
            type: String
        },
        email: {
            type: String,
            unique: true,
            trim: true,
            lowercase: true
        },
        picture: {
            type: String
        },
        password: {
            type: String,
            minlength: [6, "Password min length is 6"],
            hide: true
        },
        active: {
            type: Boolean,
            default: true
        },
        blocked: {
            type: Boolean,
            default: false
        },
        google_signup: {
            type: Boolean,
            default: false
        },
        googleId: {
            type: String
        },
        lastLogin: {
            type: Date,
            default: new Date().setUTCHours(0, 0, 0, 0)
        },
        manager: {
            type: Schema.Types.ObjectId,
            ref: "users",
            default: null
        }
    },
    {
        timestamps: true
    }
);

UserSchema.pre("save", function (next) {
    const user = this;
    if (!user.isModified("password")) return next();
    bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.validatePassword = function (password) {
    return new Promise((resolve, reject) => {
        if (!this.password) {
            return reject(`You haven't created password`);
        }
        bcrypt.compare(password, this.password, (err, isMatch) => {
            if (err) return reject(err);
            resolve(isMatch);
        });
    });
};

UserSchema.path("phone").validate(function (value) {
    var phoneRegExp = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return phoneRegExp.test((value));
}, "Not a valid mobile number");

UserSchema.plugin(mongoosepaginate);


export const UserModel = model("users", UserSchema);

