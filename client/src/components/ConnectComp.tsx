import { FC, useContext, useEffect, useState } from "react";
import { User } from "lucide-react";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import assets from "../assets/assets";

interface ConnectCompProps {
  setIsHidden: (value: boolean) => void;
  isCollapsed: boolean;
  isDark: boolean;
  setIsDark: (value: boolean) => void;
  setShowConnectModal: (value: boolean) => void;
  isMobile: boolean;
  setShowProfile: (value: boolean) => void;
}

const ConnectComp: FC<ConnectCompProps> = ({
  setIsHidden,
  isDark,
  setIsDark,
  setShowConnectModal,
  isCollapsed,
  isMobile,
  setShowProfile,
}) => {
  const [input, setInput] = useState<string>("");
  const { getGiants, users, setSelectedUser } = useContext(ChatContext);
  const { onlineUsers } = useContext(AuthContext);

  useEffect(() => {
    getGiants();
  }, [onlineUsers]);

  const filteredUsers = input
    ? users.filter(
        (user) =>
          user.name.toLowerCase().includes(input.toLowerCase()) ||
          user.Title.toLowerCase().includes(input.toLowerCase()) ||
          user.skills?.some((skill) =>
            skill.toLowerCase().includes(input.toLowerCase())
          )
      )
    : users;

  return (
    <div
      className={`w-full h-full shadow-md flex flex-col overflow-hidden 
        ${
          isDark
            ? "bg-gradient-to-b from-[#325fe5] to-[#011755] text-white"
            : "bg-gradient-to-b from-[#dce7f8] to-[#e9ecf6] text-[#1A1A1A]"
        }`}
    >
      {/* Navbar */}
      {isMobile && (
        <div className="sticky top-0 z-20 w-full px-4 py-3 flex items-center gap-4 bg-opacity-70 transition-all duration-300">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 min-w-0 px-4 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Search by name, Title, or skills..."
          />

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              onChange={(e) => setIsDark(e.target.checked)}
              checked={isDark}
            />
            <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
          </label>
        </div>
      )}

      {/* HEADER */}
      {!isMobile && (
        <div
          className={`sticky top-0 z-20 p-4 flex flex-wrap items-center gap-4 
          bg-opacity-70 transition-all duration-300 ${
            isCollapsed ? "max-w-5xl" : "max-w-4xl"
          }
        `}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={`flex-1 min-w-0 px-4 py-2 border border-gray-300 rounded-xl shadow-sm 
            placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm`}
            placeholder="Search by name, Title, or skills..."
          />
        </div>
      )}

      {/* GRID */}
      <div
        className="flex-1 overflow-y-auto p-4 grid 
        grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 
        gap-4"
      >
        {filteredUsers.map((user) => (
          <div
            key={user._id}
            className="bg-white rounded-2xl shadow border border-gray-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 flex flex-col h-[300px] overflow-hidden"
          >
            <div className="flex-1 p-4 flex flex-col items-center text-center overflow-hidden">
              <img
                src={user?.profilePic || assets.avatar_icon}
                alt="User Avatar"
                className="w-14 h-14 rounded-full border-2 border-white object-cover"
              />

              <h3 className="text-base font-semibold text-gray-900 mb-1 truncate w-full">
                {user.name}
              </h3>
              {user.Title && (
                <h5 className="text-sm font-medium text-gray-700 mb-1 truncate w-full">
                  {user.Title}
                </h5>
              )}
              <p className="text-gray-500 text-xs mb-2 line-clamp-2 w-full">
                {user.bio || user.experience}
              </p>
              {user.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1 justify-center">
                  {user.skills.slice(0, 2).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 pt-0 flex gap-2">
              <button
                onClick={() => {
                  setIsHidden(false);
                  setSelectedUser(user);
                  setShowProfile(true);
                }}
                className="flex-1 px-2 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs"
              >
                View Profile
              </button>
              <button
                onClick={() => {
                  setSelectedUser(user);
                  setShowConnectModal(true);
                }}
                className="flex-1 px-2 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
              >
                Connect
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConnectComp;
