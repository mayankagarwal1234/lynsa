"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// Sub-schemas
const SocialsSchema = new mongoose_1.Schema({
    linkedin: { type: String },
    twitter: { type: String },
    facebook: { type: String },
    instagram: { type: String },
}, { _id: false });
const ExperienceSchema = new mongoose_1.Schema({
    title: { type: String, },
    company: { type: String, },
    location: { type: String },
    from: { type: Date, },
    to: { type: Date },
    current: { type: Boolean, default: false },
    description: { type: String },
}, { _id: false });
const EducationSchema = new mongoose_1.Schema({
    school: { type: String, },
    degree: { type: String, },
    fieldOfStudy: { type: String },
    from: { type: Date, },
    to: { type: Date },
    current: { type: Boolean, default: false },
    description: { type: String },
}, { _id: false });
const CertificateSchema = new mongoose_1.Schema({
    name: { type: String, },
    issuer: { type: String, },
    date: { type: Date, },
    url: { type: String },
}, { _id: false });
// Main User schema
const userSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    contact: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 8 },
    Title: { type: String, required: true },
    role: {
        type: String,
        enum: ["user", "giant"],
        required: true,
        default: "user",
    },
    costToConnect: {
        type: Number,
        required: function () {
            return this.role === "giant";
        },
        default: 0,
    },
    bio: { type: String },
    profilePic: { type: String, default: "" },
    experience: { type: [ExperienceSchema], default: [] },
    education: { type: [EducationSchema], default: [] },
    certificates: { type: [CertificateSchema], default: [] },
    socials: { type: SocialsSchema, default: () => ({}) },
    skills: { type: [String], default: [] },
}, { timestamps: true });
const User = mongoose_1.default.model("User", userSchema);
exports.default = User;
