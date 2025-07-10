import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { X } from "lucide-react";

interface EditProfileProps {
  setEdit: (value: boolean) => void;
}

const EditProfile: React.FC<EditProfileProps> = ({ setEdit }) => {
  const { authUser, updateProfile } = useContext(AuthContext) as any;
  const navigate = useNavigate();

  const [bio, setBio] = useState(authUser?.bio || "");
  const [Title, setTitle] = useState(authUser?.Title || "");
  const [skills, setSkills] = useState<string[]>(authUser?.skills || []);
  const [newSkill, setNewSkill] = useState<string>("");
  const [contact, setContact] = useState(authUser?.contact || "");
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [education, setEducation] = useState(authUser?.education?.[0] || {});
  const [experience, setExperience] = useState(authUser?.experience?.[0] || {});
  const [certificates, setCertificates] = useState(authUser?.certificates || []);
  const [socials, setSocials] = useState(authUser?.socials || {});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePic(e.target.files[0]);
    }
  };

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill("");
    }
  };

  const removeSkill = (index: number) => {
    const updated = [...skills];
    updated.splice(index, 1);
    setSkills(updated);
  };

  const handleCertificateChange = (index: number, field: string, value: string) => {
    const updated = [...certificates];
    updated[index] = { ...updated[index], [field]: value };
    setCertificates(updated);
  };

  const addCertificate = () => {
    setCertificates([
      ...certificates,
      { name: "", issuer: "", date: "", url: "" },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const base64Image = profilePic
      ? await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(profilePic);
        })
      : undefined;

    await updateProfile({
      bio,
      Title,
      contact,
      skills,
      profilePic: base64Image,
      education: [education],
      experience: [experience],
      certificates,
      socials,
    });

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#dce7f8] to-[#e9ecf6] text-[#1A1A1A] flex justify-center items-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-xl shadow-xl w-full max-w-2xl flex flex-col gap-4"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl ml-15 lg:ml-55 font-semibold">Edit Your Profile</h2>
          <button
            type="button"
            onClick={() => setEdit(false)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Image */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileChange}
          />
          <img
            src={
              profilePic
                ? URL.createObjectURL(profilePic)
                : authUser?.profilePic || assets.avatar_icon
            }
            className="w-12 h-12 rounded-full border object-cover"
            alt="avatar"
          />
          <span className="text-sm">Upload Profile Picture</span>
        </label>

        {/* Name and Email */}
        <input
          value={authUser?.name || ""}
          disabled
          className="bg-white/20 border p-3 rounded-md"
        />
        <input
          value={authUser?.email || ""}
          disabled
          className="bg-white/20 border p-3 rounded-md"
        />

        {/* Bio & Title */}
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Bio"
          className="p-3 rounded-md bg-white/20 border"
        />
        <input
          value={Title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Professional Title (e.g., Full Stack Developer)"
          className="p-3 rounded-md bg-white/20 border"
        />
        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Phone Number"
          className="p-3 rounded-md bg-white/20 border"
        />

        {/* Skills */}
        <div className="flex flex-col gap-1">
          <label className="font-semibold">Skills:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill"
              className="flex-1 p-3 rounded-md bg-white/20 border"
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {skills.map((skill, index) => (
              <div
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="text-red-600 font-bold hover:text-red-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="flex flex-col gap-1">
          <label className="font-semibold">Education:</label>
          <input
            value={education.school || ""}
            onChange={(e) => setEducation({ ...education, school: e.target.value })}
            placeholder="School"
            className="p-3 rounded-md bg-white/20 border"
          />
          <input
            value={education.degree || ""}
            onChange={(e) => setEducation({ ...education, degree: e.target.value })}
            placeholder="Degree"
            className="p-3 rounded-md bg-white/20 border"
          />
          <input
            value={education.fieldOfStudy || ""}
            onChange={(e) => setEducation({ ...education, fieldOfStudy: e.target.value })}
            placeholder="Field of Study"
            className="p-3 rounded-md bg-white/20 border"
          />
          <textarea
            value={education.description || ""}
            onChange={(e) => setEducation({ ...education, description: e.target.value })}
            placeholder="Describe your education"
            className="p-3 rounded-md bg-white/20 border"
          />
          <div className="flex gap-4">
            <input
              type="date"
              value={education.from?.slice(0, 10) || ""}
              onChange={(e) => setEducation({ ...education, from: e.target.value })}
              className="w-1/2 p-3 rounded-md bg-white/20 border"
            />
            <input
              type="date"
              value={education.to?.slice(0, 10) || ""}
              onChange={(e) => setEducation({ ...education, to: e.target.value })}
              className="w-1/2 p-3 rounded-md bg-white/20 border"
            />
          </div>
        </div>

        {/* Experience */}
        <div className="flex flex-col gap-1">
          <label className="font-semibold">Experience:</label>
          <input
            value={experience.title || ""}
            onChange={(e) => setExperience({ ...experience, title: e.target.value })}
            placeholder="Job Title"
            className="p-3 rounded-md bg-white/20 border"
          />
          <input
            value={experience.company || ""}
            onChange={(e) => setExperience({ ...experience, company: e.target.value })}
            placeholder="Company"
            className="p-3 rounded-md bg-white/20 border"
          />
          <input
            value={experience.location || ""}
            onChange={(e) => setExperience({ ...experience, location: e.target.value })}
            placeholder="Location"
            className="p-3 rounded-md bg-white/20 border"
          />
          <textarea
            value={experience.description || ""}
            onChange={(e) => setExperience({ ...experience, description: e.target.value })}
            placeholder="Describe your experience"
            className="p-3 rounded-md bg-white/20 border"
          />
          <div className="flex gap-4">
            <input
              type="date"
              value={experience.from?.slice(0, 10) || ""}
              onChange={(e) => setExperience({ ...experience, from: e.target.value })}
              className="w-1/2 p-3 rounded-md bg-white/20 border"
            />
            <input
              type="date"
              value={experience.to?.slice(0, 10) || ""}
              onChange={(e) => setExperience({ ...experience, to: e.target.value })}
              className="w-1/2 p-3 rounded-md bg-white/20 border"
            />
          </div>
        </div>

        {/* Certificates */}
        <div className="flex flex-col gap-1">
          <label className="font-semibold">Certificates:</label>
          {certificates.map((cert, index) => (
            <div key={index} className="flex flex-col gap-2">
              <input
                value={cert.name}
                onChange={(e) => handleCertificateChange(index, "name", e.target.value)}
                placeholder="Certificate Name"
                className="p-3 rounded-md bg-white/20 border"
              />
              <input
                value={cert.issuer}
                onChange={(e) => handleCertificateChange(index, "issuer", e.target.value)}
                placeholder="Issued By"
                className="p-3 rounded-md bg-white/20 border"
              />
              <input
                type="date"
                value={cert.date?.slice(0, 10) || ""}
                onChange={(e) => handleCertificateChange(index, "date", e.target.value)}
                className="p-3 rounded-md bg-white/20 border"
              />
              <input
                value={cert.url}
                onChange={(e) => handleCertificateChange(index, "url", e.target.value)}
                placeholder="Certificate URL"
                className="p-3 rounded-md bg-white/20 border"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addCertificate}
            className="text-blue-700 underline text-sm mt-1"
          >
            + Add Another Certificate
          </button>
        </div>

        {/* Socials */}
        <div className="flex flex-col gap-1">
          <label className="font-semibold">Social Links:</label>
          <input
            value={socials.linkedin || ""}
            onChange={(e) => setSocials({ ...socials, linkedin: e.target.value })}
            placeholder="LinkedIn URL"
            className="p-3 rounded-md bg-white/20 border"
          />
          <input
            value={socials.twitter || ""}
            onChange={(e) => setSocials({ ...socials, twitter: e.target.value })}
            placeholder="Twitter URL"
            className="p-3 rounded-md bg-white/20 border"
          />
          <input
            value={socials.instagram || ""}
            onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
            placeholder="Instagram URL"
            className="p-3 rounded-md bg-white/20 border"
          />
          <input
            value={socials.facebook || ""}
            onChange={(e) => setSocials({ ...socials, facebook: e.target.value })}
            placeholder="Facebook URL"
            className="p-3 rounded-md bg-white/20 border"
          />
        </div>

        <button
          type="submit"
          className="py-3 bg-blue-700 text-white font-semibold rounded-full hover:scale-105 transition-transform"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
