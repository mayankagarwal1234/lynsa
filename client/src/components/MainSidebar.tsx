import React, { useContext, useState } from "react";
import {
  LayoutDashboard,
  Search,
  Mail,
  Zap,
  User,
  Video,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";

interface MainSidebarProps {
  isDark: boolean;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const MainSidebar: React.FC<MainSidebarProps> = ({
  isDark,
  isCollapsed,
  setIsCollapsed,
}) => {
  const { authUser, logout } = useContext(AuthContext);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <div
      className={`h-full flex flex-col shadow-md p-4 transition-all duration-300 ${
        isCollapsed ? "w-[100px]" : "w-[250px]"
      } ${
        isDark
          ? "bg-gradient-to-b from-[#325fe5] to-[#011755] text-white"
          : "bg-gradient-to-b from-[#dce7f8] to-[#e9ecf6] text-[#1A1A1A]"
      }`}
    >
      {/* Profile Section */}
      {/* Profile Section */}
      <div
        className={`flex flex-col items-center ${
          isCollapsed ? "mb-4" : "mb-6"
        } relative`}
      >
        {/* Profile Image */}
        <img
          src={authUser?.profilePic || assets.avatar_icon}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover border border-gray-300"
        />

        {/* User Info when expanded */}
        {!isCollapsed && (
          <div className="mt-2 text-center w-full">
            <p
              className={`text-sm uppercase ${
                isDark ? "text-white" : "text-gray-500"
              }`}
            >
              {authUser?.Title}
            </p>
            <p className="text-lg mt-1 font-semibold">
              {authUser?.name || "User Name"}
            </p>
          </div>
        )}

        {/* Collapse Toggle Button */}
        {isCollapsed ? (
          <div className="mt-5">
            <button
              onClick={toggleSidebar}
              className="p-1 rounded hover:bg-white/20 transition"
            >
              <ChevronRight />
            </button>
          </div>
        ) : (
          <div className="absolute right-0 top-0">
            <button
              onClick={toggleSidebar}
              className="p-1 rounded hover:bg-white/20 transition"
            >
              <ChevronLeft />
            </button>
          </div>
        )}
      </div>

      {/* Sidebar Sections */}
      {!isCollapsed && (
        <p
          className={`text-sm uppercase mb-2 ${
            isDark ? "text-white" : "text-gray-500"
          }`}
        >
          Main
        </p>
      )}
      <nav className={`space-y-2 ${isDark ? "text-white" : "text-gray-500"}`}>
        <SidebarItem
          icon={<LayoutDashboard />}
          label="Dashboard"
          to="/dashboard"
          isDark={isDark}
          collapsed={isCollapsed}
        />
        <SidebarItem
          icon={<Search />}
          label="Explore"
          to="/explore"
          isDark={isDark}
          collapsed={isCollapsed}
        />
        <SidebarItem
          icon={<Mail />}
          label="Inbox"
          to="/chat"
          isDark={isDark}
          collapsed={isCollapsed}
        />
        <SidebarItem
          icon={<Zap />}
          label="Hot Outreach"
          to="/outreach"
          isDark={isDark}
          collapsed={isCollapsed}
        />
      </nav>

      <hr className="my-6 border-gray-300" />

      {!isCollapsed && (
        <p
          className={`text-sm uppercase mb-2 ${
            isDark ? "text-white" : "text-gray-500"
          }`}
        >
          Profile Management
        </p>
      )}
      <nav className="space-y-2">
        <SidebarItem
          icon={<User />}
          label="Profile"
          to="/profile"
          isDark={isDark}
          collapsed={isCollapsed}
        />
        <SidebarItem
          icon={<Video />}
          label="Video Scheduler"
          to="/video"
          isDark={isDark}
          collapsed={isCollapsed}
        />
      </nav>

      <hr className="my-6 border-gray-300" />

      {!isCollapsed && (
        <p
          className={`text-sm uppercase mb-2 ${
            isDark ? "text-white" : "text-gray-500"
          }`}
        >
          Utilities
        </p>
      )}
      <nav className="space-y-2">
        <SidebarItem
          icon={<LogOut />}
          label="Logout"
          onClick={logout}
          isDark={isDark}
          collapsed={isCollapsed}
        />
      </nav>
    </div>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  to?: string;
  dropdown?: boolean;
  isDark: boolean;
  onClick?: () => void;
  collapsed: boolean;
}

function SidebarItem({
  icon,
  label,
  to,
  dropdown,
  isDark,
  onClick,
  collapsed,
}: SidebarItemProps) {
  const content = (
    <div
      className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition gap-3 ${
        isDark
          ? "text-white hover:bg-[#425bb5]"
          : "text-gray-700 hover:bg-gray-100"
      }`}
      onClick={onClick}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
      {!collapsed && dropdown && (
        <ChevronDown className="w-10 h-8 text-gray-400 ml-auto" />
      )}
    </div>
  );

  return to ? <Link to={to}>{content}</Link> : content;
}

export default MainSidebar;
