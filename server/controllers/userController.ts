import { Request, Response } from "express";
import User, { IUser } from "../models/User"; // IUser interface from your User model
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils";
import cloudinary from "../lib/cloudinary";

// Extend Express Request to include authenticated user
// Assuming req.user is a full Mongoose document or at least has _id and toObject()
export interface AuthRequest extends Request {
  user?: IUser & { toObject?: () => any }; // toObject optional in case it's plain object
}

// Helper to safely remove password from user object
const sanitizeUser = (user: IUser | any) => {
  if (typeof user.toObject === "function") {
    const { password, ...rest } = user.toObject();
    return rest;
  } else {
    // fallback if plain object
    const { password, ...rest } = user;
    return rest;
  }
};

// Signup controller
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      email,
      password,
      bio,
      role,
      costToConnect,
      education,
      certificates,
      socials,
      Title,
      skills,
     contact,
      experience,
    } = req.body;

    if (!name || !email || !password || !Title || !contact) {
      res.status(400).json({ success: false, msg: "Name, email, Title , contact and password are required" });
      return;
    }

    if (role === "giant" && (costToConnect === undefined || costToConnect === null)) {
      res.json({ success: false, msg: "Cost to connect is required for role giant" });
      return;
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(409).json({ success: false, msg: "User already exists with this email" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData: Partial<IUser> = {
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

    const newUser = await User.create(userData);

    const token = generateToken(newUser._id.toString());

    const userWithoutPassword = sanitizeUser(newUser);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      userData: userWithoutPassword,
    });
  } catch (error: any) {
    console.error("Signup error:", error.message);
    res.status(500).json({ success: false, msg: "Server error during signup", error: error.message });
  }
};

// Login controller
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const userData = await User.findOne({ email });
    if (!userData) {
      res.json({ success: false, message: "Email does not exist , Sign Up to continue" });
      return;
    }

    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      res.json({ success: false, message: "Incorrect password" });
      return;
    }

    const token = generateToken(userData._id.toString());

    const userWithoutPassword = sanitizeUser(userData);

    res.json({
      success: true,
      userData: userWithoutPassword,
      token,
      message: "Logged in Successfully",
    });
  } catch (error: any) {
    console.error("Login error:", error.message);
    res.status(500).json({ success: false, msg: "Server error", error: error.message });
  }
};

// Check Auth
export const checkAuth = (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }
  const userWithoutPassword = sanitizeUser(req.user);
  res.json({ success: true, user: userWithoutPassword });
};

// Update Profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { profilePic, bio,
      education,
      certificates,
      socials,
      Title,
      skills,
      contact,
      experience } = req.body;

    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

  const updateData: Partial<IUser> = {
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
      const upload: { secure_url: string } = await cloudinary.uploader.upload(profilePic);
      updateData.profilePic = upload.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!updatedUser) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const userWithoutPassword = sanitizeUser(updatedUser);
    res.json({ success: true, user: userWithoutPassword });
  } catch (error: any) {
    console.error("Update profile error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
