"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const upload_1 = __importDefault(require("../middleware/upload"));
const messageController_1 = require("../controllers/messageController");
const messageRouter = express_1.default.Router();
messageRouter.get("/users", auth_1.protectRoute, messageController_1.getUserForSidebar);
messageRouter.get("/giants", auth_1.protectRoute, messageController_1.getAllGiants);
messageRouter.get("/:id", auth_1.protectRoute, messageController_1.getMessages);
messageRouter.put("/mark/:id", auth_1.protectRoute, messageController_1.markMessagesAsSeen);
messageRouter.post("/send/:id", auth_1.protectRoute, upload_1.default.single("files"), messageController_1.sendMessage);
exports.default = messageRouter;
