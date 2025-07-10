import { useContext } from "react";
import assets from "../assets/assets";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

interface ProfileViewProps {
  isDark: boolean;
  setShowProfile: (value: boolean) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({
  isDark,
  setShowProfile,
}) => {
  const { selectedUser } = useContext(ChatContext);
  const { onlineUsers } = useContext(AuthContext);

  return (
    <div
      className={`h-screen w-full shadow-md flex flex-col overflow-y-auto transition-all duration-500 ease-in-out 
      ${
        isDark
          ? "bg-gradient-to-b from-[#325fe5] to-[#011755] text-white"
          : "bg-gradient-to-b from-[#dce7f8] to-[#e9ecf6] text-[#1A1A1A]"
      }`}
    >
      <div className="flex items-center ml-50 justify-between p-5 sticky top-0 bg-opacity-50 z-20">
        <button
          onClick={() => setShowProfile(false)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 pb-6 flex-1">
        {selectedUser && (
          <>
            <div className="flex flex-col items-center gap-3 text-center">
              <img
                src={selectedUser.profilePic || assets.avatar_icon}
                alt="User Avatar"
                className="w-24 h-24 object-cover rounded-full border-2 border-white shadow-md"
              />
              <div className="text-xl font-semibold flex items-center gap-2">
                {onlineUsers.includes(selectedUser._id) && (
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                )}
                {selectedUser.name}
              </div>
              {selectedUser.Title && (
                <div className="text-lg font-medium">{selectedUser.Title}</div>
              )}
            </div>

            {selectedUser.bio && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-500">About</h3>
                <p
                  className={`mt-1 text-sm ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {selectedUser.bio}
                </p>
              </div>
            )}

            {selectedUser.skills?.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-500 mb-2">
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.skills.map((skill, index) => (
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

            {selectedUser.experience?.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-500">
                  Experience
                </h3>
                <ul
                  className={`list-disc list-inside mt-1 space-y-1 text-sm ${
                    isDark ? "text-gray-300" : "text-gray-700"
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

            {selectedUser.education?.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-500">
                  Educational Background
                </h3>
                <ul
                  className={`list-disc list-inside mt-1 space-y-1 text-sm ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {selectedUser.education.map((edu, index) => (
                    <li key={index}>
                      {edu.degree} in {edu.fieldOfStudy || "N/A"}, {edu.school}{" "}
                      ({edu.from ? new Date(edu.from).getFullYear() : ""} -{" "}
                      {edu.to ? new Date(edu.to).getFullYear() : "Present"})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedUser.certificates?.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-500">
                  Certifications
                </h3>
                <ul
                  className={`list-disc list-inside mt-1 space-y-1 text-sm ${
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

            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-500 mb-2">
                Social Links
              </h3>
              <ul
                className={`text-sm space-y-1 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {selectedUser.socials?.linkedin && (
                  <li>
                    <span className="font-medium">LinkedIn:</span>{" "}
                    <a
                      href={selectedUser.socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      {selectedUser.socials.linkedin}
                    </a>
                  </li>
                )}
                {selectedUser.socials?.instagram && (
                  <li>
                    <span className="font-medium">Instagram:</span>{" "}
                    <a
                      href={selectedUser.socials.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-500 underline"
                    >
                      {selectedUser.socials.instagram}
                    </a>
                  </li>
                )}
                {selectedUser.socials?.facebook && (
                  <li>
                    <span className="font-medium">Facebook:</span>{" "}
                    <a
                      href={selectedUser.socials.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      {selectedUser.socials.facebook}
                    </a>
                  </li>
                )}
                {selectedUser.socials?.twitter && (
                  <li>
                    <span className="font-medium">Twitter:</span>{" "}
                    <a
                      href={selectedUser.socials.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      {selectedUser.socials.twitter}
                    </a>
                  </li>
                )}
              </ul>
            </div>

            
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileView;
