import { useContext } from "react";
import assets from "../assets/assets";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface RightSidebarProps {
  isHidden: boolean;
  isDark: boolean;
  setShowFullProfile:(value: boolean) => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ isHidden, isDark,setShowFullProfile }) => {
  const { selectedUser } = useContext(ChatContext);
  const { onlineUsers } = useContext(AuthContext); // type accordingly
  const navigate = useNavigate();

  return (
    <div
      className={`
        h-screen shadow-md flex flex-col transition-all duration-500 ease-in-out
        ${
          isHidden
            ? "translate-x-full w-0"
            : "translate-x-0 w-full sm:w-[300px]"
        }
        overflow-hidden max-md:hidden
        ${
          isDark
            ? "bg-gradient-to-b from-[#325fe5] to-[#011755] text-white"
            : "bg-gradient-to-b from-[#dce7f8] to-[#e9ecf6] text-[#1A1A1A]"
        }
      `}
    >
      <div className="p-5 z-10 " />

      <div
        className={`mt-10 flex-1 overflow-y-auto w-full px-4 ${
          isDark ? "text-white" : "text-black"
        }`}
      >
        {selectedUser && (
          <>
            {/* User Info */}
            <div className="pt-6 flex flex-col items-center gap-3 text-sm mx-auto">
              <img
                src={selectedUser.profilePic || assets.avatar_icon}
                alt="User Avatar"
                className="w-24 h-24 object-cover rounded-full border-2 border-white shadow-md"
              />
              <div className="text-xl font-semibold flex items-center gap-2 text-center">
                {onlineUsers.includes(selectedUser._id) && (
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                )}
                {selectedUser.name}
              </div>
              {selectedUser?.Title && (
                <div className="text-xl font-semibold flex items-center gap-2 text-center">
                  {selectedUser?.Title}
                </div>
              )}
              <button  onClick={()=>setShowFullProfile(true)} className="mt-2 px-4 py-1 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded">
                View Full Profile
              </button>
            </div>

            {/* About */}
            {selectedUser.bio && (
              <div className="mb-4 mt-8 ">
                <p
                  className={`text-lg font-semibold ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  About
                </p>
                <p
                  className={`text-sm mt-1 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {selectedUser.bio}
                </p>
              </div>
            )}

            {selectedUser.skills?.length > 0 && (
              <div className="mt-2">
                <h3 className="text-lg font-semibold text-gray-500 mb-2">
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.skills?.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {selectedUser.experience?.length > 0 && (
              <div className="mt-2 ">
                <p
                  className={`text-lg font-semibold ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Experience
                </p>
                <ul
                  className={`list-disc list-inside text-sm mt-1 space-y-1 ${
                    isDark ? "text-gray-300" :"text-gray-700"
                  }`}
                >
                {selectedUser.experience.map((exp, index) => (
                    <li key={index}>
                      {exp.title} at {exp.company} (
                      {exp.from
                        ? new Date(exp.from).toLocaleString("default", {
                            month: "short",
                            year: "numeric",
                          })
                        : ""}
                      {" - "}
                      {exp.current
                        ? "Present"
                        : exp.to
                        ? new Date(exp.to).toLocaleString("default", {
                            month: "short",
                            year: "numeric",
                          })
                        : ""}
                      )
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Education */}
            {selectedUser.education?.length > 0 && (
              <div className="mt-4">
                <p
                  className={`text-lg font-semibold ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Educational Background
                </p>
                <ul
                  className={`list-disc text-sm mt-1 space-y-1 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {selectedUser.education.map((edu, index) => (
                    <li key={index}>
                      {edu.degree} in {edu.fieldOfStudy || "N/A"}, {edu.school}{" "}
                      ({edu.from ? new Date(edu.from).getFullYear() : " "} -{" "}
                      {edu.to ? new Date(edu.to).getFullYear() : "Present"})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Certifications */}
            {selectedUser.certificates?.length > 0 && (
              <div className="mt-4">
                <p
                  className={`text-lg font-semibold ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Certifications
                </p>
                <ul
                  className={`list-disc text-sm mt-1 space-y-1 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {selectedUser.certificates.map((cert, index) => (
                    <li key={index}>
                      {cert.name} – {cert.issuer} (
                      {new Date(cert.date).getFullYear()})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Socials */}
            <div className="mt-4">
              <p
                className={`text-lg font-semibold ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                More connect options
              </p>
              <ul
                className={`text-sm mt-2 list-disc space-y-1 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {" "}
                {selectedUser.socials?.linkedin && (
                  <li className="list-item">
                    <span className="flex gap-1 items-center">
                      <span className="font-medium shrink-0">LinkedIn:</span>
                      <a
                        href={selectedUser.socials.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline truncate"
                        style={{ maxWidth: "200px", display: "inline-block" }}
                        title={selectedUser.socials.linkedin}
                      >
                        {selectedUser.socials.linkedin}
                      </a>
                    </span>
                  </li>
                )}
                {selectedUser.socials?.instagram && (
                  <li className="list-item">
                    <span className="flex gap-1 items-center">
                      <span className="font-medium shrink-0">Instagram:</span>
                      <a
                        href={selectedUser.socials.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-500 underline truncate"
                        style={{ maxWidth: "200px", display: "inline-block" }}
                        title={selectedUser.socials.instagram}
                      >
                        {selectedUser.socials.instagram}
                      </a>
                    </span>
                  </li>
                )}
                {selectedUser.socials?.facebook && (
                  <li className="list-item">
                    <span className="flex gap-1 items-center">
                      <span className="font-medium shrink-0">Facebook:</span>
                      <a
                        href={selectedUser.socials.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline truncate"
                        style={{ maxWidth: "200px", display: "inline-block" }}
                        title={selectedUser.socials.facebook}
                      >
                        {selectedUser.socials.facebook}
                      </a>
                    </span>
                  </li>
                )}
                {selectedUser.socials?.twitter && (
                  <li className="list-item">
                    <span className="flex gap-1 items-center">
                      <span className="font-medium shrink-0">Twitter:</span>
                      <a
                        href={selectedUser.socials.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline truncate"
                        style={{ maxWidth: "200px", display: "inline-block" }}
                        title={selectedUser.socials.twitter}
                      >
                        {selectedUser.socials.twitter}
                      </a>
                    </span>
                  </li>
                )}
              </ul>
            </div>
            <div className="mt-4">
              
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;
