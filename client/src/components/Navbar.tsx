import { useContext } from "react";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ChatContext } from "../../context/ChatContext";

interface NavbarProps {
  isHidden: boolean;
  isDark: boolean;
  setIsHidden: (value: boolean) => void;
  setIsDark: (value: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ isHidden, isDark, setIsHidden, setIsDark }) => {
  const { selectedUser } = useContext(ChatContext);
  const { authUser } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div
      className={`fixed top-0 left-267 right-0 z-30 flex items-center justify-between px-6 py-3 
        ${isDark ? " text-white" : "text-[#1A1A1A]"}
      `}
    >
      {/* Back or Hide arrow if needed */}
      {selectedUser && !isHidden && (
        <img
          onClick={() => setIsHidden(true)}
          className={`w-6 h-6 rotate-180 cursor-pointer ${
            isDark ? "filter brightness-0 invert" : "invert"
          }`}
          src={assets.arrow_icon}
          alt="Hide Sidebar"
        />
      )}

      <div className="flex items-center gap-5 ml-auto">
        {/* Dark mode toggle */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            onChange={(e) => setIsDark(e.target.checked)}
            checked={isDark}
          />
          <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full 
            after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white
            after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all 
            peer-checked:bg-gray-600"></div>
        </label>

        {/* Profile image */}
        <img
          src={authUser?.profilePic || assets.avatar_icon}
          onClick={() => navigate("/profile")}
          alt="avatar"
          className="w-9 h-9 border border-gray-400 rounded-full object-cover shadow cursor-pointer"
        />
      </div>
    </div>
  );
};

export default Navbar;
