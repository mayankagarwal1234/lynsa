"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const userRouter = express_1.default.Router();
// Routes
userRouter.post("/signup", userController_1.signup);
userRouter.post("/login", userController_1.login);
userRouter.put("/update-profile", auth_1.protectRoute, userController_1.updateProfile);
userRouter.get("/check", auth_1.protectRoute, userController_1.checkAuth);
exports.default = userRouter;
