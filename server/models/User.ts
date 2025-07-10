import mongoose, { Document, Model, Schema } from "mongoose";

interface ISocials {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  [key: string]: string | undefined;
}

interface IExperience {
  title: string;
  company: string;
  location?: string;
  from: Date;
  to?: Date;
  current?: boolean;
  description?: string;
}

interface IEducation {
  school: string;
  degree: string;
  fieldOfStudy?: string;
  from: Date;
  to?: Date;
  current?: boolean;
  description?: string;
}

interface ICertificate {
  name: string;
  issuer: string;
  date: Date;
  url?: string;
}

interface IUser extends Document {
  name: string;
 contact:string;
  email: string;
  password: string;
  Title:string;
  role: "user" | "giant";
  costToConnect?: number;
  createdAt: Date;
  updatedAt: Date;
  bio?: string;
  profilePic?: string;
  experience?: IExperience[];
  education?: IEducation[];
  certificates?: ICertificate[];
  socials?: ISocials;
  skills?: string[];
}

// Sub-schemas
const SocialsSchema = new Schema<ISocials>(
  {
    linkedin: { type: String },
    twitter: { type: String },
    facebook: { type: String },
    instagram: { type: String },
  },
  { _id: false }
);

const ExperienceSchema = new Schema<IExperience>(
  {
    title: { type: String, },
    company: { type: String,},
    location: { type: String },
    from: { type: Date, },
    to: { type: Date },
    current: { type: Boolean, default: false },
    description: { type: String },
  },
  { _id: false }
);

const EducationSchema = new Schema<IEducation>(
  {
    school: { type: String, },
    degree: { type: String, },
    fieldOfStudy: { type: String },
    from: { type: Date,},
    to: { type: Date },
    current: { type: Boolean, default: false },
    description: { type: String },
  },
  { _id: false }
);

const CertificateSchema = new Schema<ICertificate>(
  {
    name: { type: String, },
    issuer: { type: String, },
    date: { type: Date, },
    url: { type: String },
  },
  { _id: false }
);

// Main User schema
const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: { type: String, required: true },
   contact: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true,minlength:8 },
    Title: { type: String,required: true },
    role: {
      type: String,
      enum: ["user", "giant"],
      required: true,
      default: "user",
    },
    costToConnect: {
      type: Number,
      required: function (this: IUser) {
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
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
export { IUser };
