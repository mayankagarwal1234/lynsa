import React, { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import { formatMessageTime } from "../lib/util";

interface SidebarProps {
  setIsHidden: (val: boolean) => void;
  isDark: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ setIsHidden, isDark }) => {
  const [input, setInput] = useState<string>("");

  const chatContext = useContext(ChatContext);
  const authContext = useContext(AuthContext);

  if (!chatContext || !authContext) {
    throw new Error("ChatContext or AuthContext is not available");
  }

  const {
    getUsers,
    users,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
  } = chatContext;

  const { onlineUsers } = authContext;

  const filteredUsers = input
    ? users.filter((user) =>
        user.name.toLowerCase().includes(input.toLowerCase())
      )
    : users;

  useEffect(() => {
    getUsers();
  }, [onlineUsers]);

  const totalUnseen = Object.values(unseenMessages).reduce((a, b) => a + b, 0);

  return (
    <div
      className={`w-full h-full shadow-md flex flex-col overflow-hidden
        ${isDark
          ? "bg-gradient-to-b from-[#325fe5] to-[#011755] text-white"
          : "bg-gradient-to-b from-[#dce7f8] to-[#e9ecf6] text-[#1A1A1A]"
        }
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-4">
        <div className="text-lg font-semibold">
          Messaging
          {totalUnseen >= 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {totalUnseen}
            </span>
          )}
        </div>
      </div>

      {/* Search bar */}
      <div className="relative px-4 pt-5 mb-3">
        <input
          onChange={(e) => setInput(e.target.value)}
          type="text"
          value={input}
          className={`w-full rounded-full px-4 py-2 pl-10 text-sm outline-none shadow-inner 
            ${isDark
              ? "bg-white text-black placeholder:text-gray-500"
              : "bg-white bg-opacity-70 backdrop-blur-md placeholder:text-gray-400"
            }
          `}
          placeholder="Search in Inbox..."
        />
        <img
          src={assets.search_icon}
          alt="search"
          className={`absolute left-7 top-7  w-4 h-4 opacity-60 ${isDark ? "invert" : ""}`}
        />
      </div>

      {/* Scrollable Chat List */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-1">
          {filteredUsers.map((user, index) => (
            <React.Fragment key={user._id}>
              <div
                onClick={() => {
                  setSelectedUser(user);
                  setIsHidden(false);
                  setUnseenMessages((prev) => ({
                    ...prev,
                    [user._id]: 0,
                  }));
                }}
                className={`flex items-center justify-between p-3 rounded-xl min-h-[56px] transition cursor-pointer
                  ${isDark
                    ? "hover:bg-blue-500 hover:bg-opacity-10"
                    : "hover:bg-white hover:bg-opacity-40"
                  }
                `}
              >
                <div className="flex items-center gap-3 w-full overflow-hidden">
                  <img
                    src={user.profilePic || assets.avatar_icon}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex flex-col overflow-hidden">
                    <p className={`text-sm font-medium ${isDark ? "text-white" : "text-black"}`}>
                      {user.name}
                    </p>
                    <p className={`text-xs truncate max-w-[140px] sm:max-w-[200px] ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      {user.lastMessageText || ""}
                    </p>
                  </div>
                </div>
                <div className={`flex flex-col items-end text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  <span>
                    {user.lastMessageTime ? formatMessageTime(user.lastMessageTime) : ""}
                  </span>
                  <span className={onlineUsers.includes(user._id) ? "text-green-400" : "text-neutral-400"}>
                    {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                  </span>
                </div>
              </div>

              {index < filteredUsers.length - 1 && (
                <div className={`h-[1px] mx-2 border-b ${isDark ? "border-gray-400 shadow-gray-800" : "border-gray-300 shadow-gray-200"} shadow-sm`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
