import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import toast from "react-hot-toast";
import { AuthContext } from "./AuthContext";
import { AxiosInstance } from "axios";
import { IUser } from "../../server/models/User";
import { IMessage } from "../../server/models/Message";

interface SendMessageFile {
  fileName: string;
  fileType: string;
  data?: string;
  fileUrl?: string;
}

interface SendMessageData {
  text?: string;
  image?: string;
  files?: SendMessageFile[];
}

interface ChatContextType {
  messages: IMessage[];
  users: IUser[];
  selectedUser: IUser | null;
  unseenMessages: Record<string, number>;
  getUsers: () => Promise<void>;
  getGiants: () => Promise<void>;
  getPayments:()=>Promise<void>;
  getMessages: (userId: string) => Promise<void>;
  sendMessage: (messageData: SendMessageData) => Promise<void>;
  setMessages: React.Dispatch<React.SetStateAction<IMessage[]>>;
  setSelectedUser: React.Dispatch<React.SetStateAction<IUser | null>>;
  setUnseenMessages: React.Dispatch<
    React.SetStateAction<Record<string, number>>
  >;
}

export const ChatContext = createContext<ChatContextType | undefined>(
  undefined
);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [payments, setPayments] = useState<any[]>([]); // Optionally type with IPayment[]
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [unseenMessages, setUnseenMessages] = useState<Record<string, number>>(
    {}
  );

  const { socket, axios } = useContext(AuthContext) as {
    socket: any;
    axios: AxiosInstance;
  };

  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

    const getGiants = async () => {
    try {
      const { data } = await axios.get("/api/messages/giants");
      if (data.success) {
       setUsers(data.giants);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

    const getPayments = async () => {
    try {
      const { data } = await axios.get("/api/payments/get");
      if (data.success) {
        setPayments(data.payments);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
    }
  };


  const getMessages = async (userId: string) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const sendMessage = async (messageData: SendMessageData) => {
    try {
      if (!selectedUser) {
        toast.error("No user selected to send message.");
        return;
      }
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );

      if (data.success) {
        setMessages((prev) => [...prev, data.newMessage]);
      } else {
        toast.error(data.message || "Failed to send message.");
      }
    } catch (error: any) {
      // Add this for detailed error info
      if (error.response) {
        console.error("Backend error response data:", error.response.data);
        toast.error(error.response.data.message || "Server error occurred.");
      } else {
        toast.error(error.message || "An error occurred.");
      }
    }
  };

  const subscribeToMessages = () => {
    if (!socket) return;

    socket.on("newMessage", (newMessage: IMessage) => {
      if (selectedUser && newMessage.senderId.toString() === selectedUser._id) {
        newMessage.seen = true;
        setMessages((prev) => [...prev, newMessage]);
        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId.toString()]:
            prev[newMessage.senderId.toString()] + 1 || 1,
        }));
      }
    });
  };

  const unsubscribeFromMessages = () => {
    if (socket) socket.off("newMessage");
  };

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [socket, selectedUser]);

  const value: ChatContextType = {
    messages,
    users,
    selectedUser,
    unseenMessages,
    getUsers,
    getMessages,
    sendMessage,
    setMessages,
    setSelectedUser,
    setUnseenMessages,
    getGiants,
    getPayments,
    payments,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
