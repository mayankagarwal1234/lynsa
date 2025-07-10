import express from "express";
import { protectRoute } from "../middleware/auth";
import upload from "../middleware/upload";
import { getAllGiants, getMessages, getUserForSidebar, markMessagesAsSeen, sendMessage } from "../controllers/messageController";

const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, getUserForSidebar);
messageRouter.get("/giants", protectRoute, getAllGiants);
messageRouter.get("/:id", protectRoute, getMessages);
messageRouter.put("/mark/:id", protectRoute, markMessagesAsSeen);
messageRouter.post("/send/:id", protectRoute, upload.single("files"),sendMessage);

export default messageRouter;
