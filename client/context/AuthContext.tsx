import { createContext, useEffect, useState, ReactNode } from "react";
import axios, { AxiosInstance } from "axios";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";

// -------- Interfaces (copied from your User model) --------

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

export interface IUser {
  _id: string;
  contact:string;
  name: string;
  email: string;
  Title:string;
  role: "user" | "giant";
  costToConnect?: number;
  createdAt: string;
  updatedAt: string;
  bio?: string;
  profilePic?: string;
  experience?: IExperience[];
  education?: IEducation[];
  certificates?: ICertificate[];
  socials?: ISocials;
  skills?: string[];
}

// -------- Context Interface --------

interface AuthContextType {
  axios: AxiosInstance;
  authUser: IUser | null;
  onlineUsers: string[];
  socket: Socket | null;
  login: (state: "login" | "signup", credentials: Record<string, any>) => Promise<void>;
  logout: () => void;
  updateProfile: (body: Record<string, any>) => Promise<void>;
  loading: boolean;
}

// -------- Default Context --------

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// -------- Provider Component --------

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL as string;
  axios.defaults.baseURL = backendUrl;

  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState<IUser | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);

  // Check user auth
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (err) {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  const login = async (state: "login" | "signup", credentials: Record<string, any>) => {
  try {
    const { data } = await axios.post(`/api/auth/${state}`, credentials);
    if (data.success) {
      setAuthUser(data.userData);
      connectSocket(data.userData);
      axios.defaults.headers.common["token"] = data.token;
      setToken(data.token);
      localStorage.setItem("token", data.token);
      toast.success(data.message);
    } else {
      toast.error(data.msg || data.message || "Authentication failed");
    }
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const msg = error.response?.data?.msg || error.response?.data?.message;
      if (status === 409) {
        toast.error("Email already registered. Please log in.");
      } else if (status === 400) {
        toast.error(msg || "Validation error.");
      } else {
        toast.error(msg || "Something went wrong. Try again.");
      }
    } else {
      toast.error(error.message || "Login error");
    }
  }
};


  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    delete axios.defaults.headers.common["token"];
    socket?.disconnect();
    toast.success("Logged out Successfully");
  };

  // Update profile
  const updateProfile = async (body: Record<string, any>) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile Updated Successfully");
      }
    } catch (error: any) {
      toast.error(error.message || "Profile update failed");
    }
  };

  // Connect socket.io
  const connectSocket = (userData: IUser) => {
    if (!userData || socket?.connected) return;

    const newSocket = io(backendUrl, {
      query: { userId: userData._id },
    });

    newSocket.connect();
    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (userIds: string[]) => {
      setOnlineUsers(userIds);
    });
  };

  // On mount
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["token"] = token;
    }
    checkAuth();
  }, []);

  const value: AuthContextType = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
