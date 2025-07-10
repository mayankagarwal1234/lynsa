"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.checkAuth = exports.login = exports.signup = void 0;
const User_1 = __importDefault(require("../models/User")); // IUser interface from your User model
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const utils_1 = require("../lib/utils");
const cloudinary_1 = __importDefault(require("../lib/cloudinary"));
// Helper to safely remove password from user object
const sanitizeUser = (user) => {
    if (typeof user.toObject === "function") {
        const _a = user.toObject(), { password } = _a, rest = __rest(_a, ["password"]);
        return rest;
    }
    else {
        // fallback if plain object
        const { password } = user, rest = __rest(user, ["password"]);
        return rest;
    }
};
// Signup controller
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, bio, role, costToConnect, education, certificates, socials, Title, skills, contact, experience, } = req.body;
        if (!name || !email || !password || !Title || !contact) {
            res.status(400).json({ success: false, msg: "Name, email, Title , contact and password are required" });
            return;
        }
        if (role === "giant" && (costToConnect === undefined || costToConnect === null)) {
            res.json({ success: false, msg: "Cost to connect is required for role giant" });
            return;
        }
        const userExists = yield User_1.default.findOne({ email });
        if (userExists) {
            res.status(409).json({ success: false, msg: "User already exists with this email" });
            return;
        }
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        const userData = {
            name,
            email,
            password: hashedPassword,
            role: role === "giant" ? "giant" : "user",
            bio,
            education,
            certificates,
            socials,
            Title,
            skills,
            contact,
            experience
        };
        if (role === "giant") {
            userData.costToConnect = costToConnect;
        }
        const newUser = yield User_1.default.create(userData);
        const token = (0, utils_1.generateToken)(newUser._id.toString());
        const userWithoutPassword = sanitizeUser(newUser);
        res.status(201).json({
            success: true,
            message: "Account created successfully",
            token,
            userData: userWithoutPassword,
        });
    }
    catch (error) {
        console.error("Signup error:", error.message);
        res.status(500).json({ success: false, msg: "Server error during signup", error: error.message });
    }
});
exports.signup = signup;
// Login controller
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const userData = yield User_1.default.findOne({ email });
        if (!userData) {
            res.json({ success: false, message: "Email does not exist , Sign Up to continue" });
            return;
        }
        const isMatch = yield bcryptjs_1.default.compare(password, userData.password);
        if (!isMatch) {
            res.json({ success: false, message: "Incorrect password" });
            return;
        }
        const token = (0, utils_1.generateToken)(userData._id.toString());
        const userWithoutPassword = sanitizeUser(userData);
        res.json({
            success: true,
            userData: userWithoutPassword,
            token,
            message: "Logged in Successfully",
        });
    }
    catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ success: false, msg: "Server error", error: error.message });
    }
});
exports.login = login;
// Check Auth
const checkAuth = (req, res) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
    }
    const userWithoutPassword = sanitizeUser(req.user);
    res.json({ success: true, user: userWithoutPassword });
};
exports.checkAuth = checkAuth;
// Update Profile
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { profilePic, bio, education, certificates, socials, Title, skills, contact, experience } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        const updateData = {
            bio,
            education,
            certificates,
            socials,
            Title,
            skills,
            contact,
            experience,
        };
        if (profilePic) {
            // Add typing to cloudinary uploader upload result
            const upload = yield cloudinary_1.default.uploader.upload(profilePic);
            updateData.profilePic = upload.secure_url;
        }
        const updatedUser = yield User_1.default.findByIdAndUpdate(userId, updateData, { new: true });
        if (!updatedUser) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        const userWithoutPassword = sanitizeUser(updatedUser);
        res.json({ success: true, user: userWithoutPassword });
    }
    catch (error) {
        console.error("Update profile error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.updateProfile = updateProfile;
