import React from "react";
import assets from "../assets/assets";
import { Linkedin, Twitter, Facebook, Instagram, X } from "lucide-react";

interface ProfileCompProps {
  user: any;           // Can be authUser or selectedUser
  setEdit?: (value: boolean) => void; // Optional, only for own profile
  setShowFullProfile?: (value: boolean) => void; // Optional, only for own profile

}

const ProfileComp: React.FC<ProfileCompProps> = ({ user, setEdit, setShowFullProfile }) => {
  return (
    <div className="w-full mx-auto p-4 sm:p-6 bg-[#f9fbfc] min-h-screen">
      {/* Header */}
      <div className="bg-gray-400/20 p-4 sm:p-6 shadow-md flex flex-col sm:flex-row items-center justify-between mb-6 gap-4 sm:gap-6 rounded-lg">
        <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
          <img
            src={user?.profilePic || assets.avatar_icon}
            alt="Profile"
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border object-cover"
          />
          <div className="space-y-1 sm:space-y-2 flex-1">
            <h1 className="text-xl sm:text-3xl font-semibold">{user?.name || "No Name"}</h1>
            <p className="text-gray-600 text-xs sm:text-sm uppercase">
              {user?.Title || "No Title"}
            </p>
            {user?.role === "giant" && user?.costToConnect !== undefined && (
              <span className="inline-block bg-green-100 text-green-700 px-3 py-0.5 rounded-md font-medium text-xs sm:text-sm">
                ₹{user.costToConnect}/connect
              </span>
            )}
          </div>
        </div>
        {setEdit && (
          <button
            onClick={() => setEdit(true)}
            className="bg-green-100 text-green-700 px-4 py-1.5 rounded-md font-medium text-sm hover:bg-green-200 transition"
          >
            Edit Profile
          </button>
        )}
        {setShowFullProfile && (
          <button
            onClick={() => setShowFullProfile(false)}
            className="bg-red-500 fixed right-5 top-5 text-white px-3 py-1 rounded-md font-medium text-sm hover:bg-red-600 transition"
          >
           <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* About Me */}
          <section className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold text-blue-600 mb-2">About me</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              {user?.bio || "No bio provided."}
            </p>
          </section>

          {/* Experience */}
          {user?.experience?.length > 0 && (
            <section className="bg-gray-400/20 p-4 sm:p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold text-blue-600 mb-2">Experience</h2>
              {user.experience.map((exp: any, idx: number) => (
                <div key={idx} className="mb-4">
                  <p className="font-semibold text-sm">{exp.title || "No title"}</p>
                  <p className="text-blue-600 text-sm">{exp.company || "No company"}</p>
                  <p className="text-sm text-gray-600">{exp.location || ""}</p>
                  <p className="text-sm text-gray-600">
                    {exp.from ? new Date(exp.from).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "N/A"} –{" "}
                    {exp.current ? "Present" : exp.to ? new Date(exp.to).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "N/A"}
                    {exp.current && (
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs ml-2">
                        Current
                      </span>
                    )}
                  </p>
                  {exp.description && (
                    <p className="text-sm text-gray-700 mt-1">{exp.description}</p>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Education */}
          {user?.education?.length > 0 && (
            <section className="bg-gray-400/20 p-4 sm:p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold text-blue-600 mb-2">Education</h2>
              {user.education.map((edu: any, idx: number) => (
                <div key={idx} className="mb-4">
                  <p className="font-semibold">{edu.degree || "No degree"}</p>
                  <p className="text-blue-600 text-sm">{edu.school || ""}</p>
                  <p className="text-sm text-gray-600">{edu.fieldOfStudy || ""}</p>
                  <p className="text-sm text-gray-600">
                    {edu.from ? new Date(edu.from).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "N/A"} –{" "}
                    {edu.current ? "Present" : edu.to ? new Date(edu.to).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : ""}
                  </p>
                  {edu.description && (
                    <p className="text-sm text-gray-700 mt-1">{edu.description}</p>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Skills */}
          <section className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold text-blue-600 mb-2">Skills</h2>
            {user?.skills?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill: string, idx: number) => (
                  <span key={idx} className="bg-gray-400/20 text-gray-700 px-3 py-1 text-sm rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p>No skills added.</p>
            )}
          </section>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* Connect */}
          <section className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold text-blue-600 mb-4">Connect</h2>
            {Object.keys(user?.socials || {}).length > 0 ? (
              <ul className="text-sm text-gray-700 space-y-3">
                {user?.socials?.linkedin && (
                  <li className="flex items-center gap-2 hover:text-blue-600 transition">
                    <Linkedin className="w-4 h-4" />
                    <a href={user.socials.linkedin} target="_blank" rel="noreferrer">
                      {user.socials.linkedin}
                    </a>
                  </li>
                )}
                {user?.socials?.twitter && (
                  <li className="flex items-center gap-2 hover:text-blue-600 transition">
                    <Twitter className="w-4 h-4" />
                    <a href={user.socials.twitter} target="_blank" rel="noreferrer">
                      {user.socials.twitter}
                    </a>
                  </li>
                )}
                {user?.socials?.facebook && (
                  <li className="flex items-center gap-2 hover:text-blue-600 transition">
                    <Facebook className="w-4 h-4" />
                    <a href={user.socials.facebook} target="_blank" rel="noreferrer">
                      {user.socials.facebook}
                    </a>
                  </li>
                )}
                {user?.socials?.instagram && (
                  <li className="flex items-center gap-2 hover:text-blue-600 transition">
                    <Instagram className="w-4 h-4" />
                    <a href={user.socials.instagram} target="_blank" rel="noreferrer">
                      {user.socials.instagram}
                    </a>
                  </li>
                )}
              </ul>
            ) : (
              <p>No social links added.</p>
            )}
          </section>

          {/* Certifications */}
          {user?.certificates?.length > 0 && (
            <section className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold text-blue-600 mb-4">Certifications</h2>
              <div className="grid grid-cols-1 gap-4">
                {user.certificates.map((cert: any, idx: number) => (
                  <div key={idx} className="bg-gray-400/20 border rounded-lg p-4 shadow-sm hover:shadow-md transition">
                    <h3 className="font-semibold text-gray-800 text-lg">{cert.name || "No name"}</h3>
                    <p className="text-sm text-gray-600">
                      <a href={cert.url || "#"} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        {cert.issuer || "No issuer"}
                      </a>
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      {cert.date ? new Date(cert.date).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "No date"}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileComp;
