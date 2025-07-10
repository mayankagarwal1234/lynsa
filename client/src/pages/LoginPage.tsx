import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import assets from "../assets/assets";
import { Helmet } from "react-helmet";

const LoginPage = () => {
  const [currstate, setCurrState] = useState<"Sign Up" | "Login">("Login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contact, setContact] = useState("");
  const [bio, setBio] = useState("");
  const [Title, setTitle] = useState("");
  const [role, setRole] = useState<"user" | "giant">("user");
  const [costToConnect, setCostToConnect] = useState<number>(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [skills, setSkills] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [twitter, setTwitter] = useState("");
  const [certificates, setCertificates] = useState([
    { name: "", issuer: "", date: "", url: "" },
  ]);
  const [experience, setExperience] = useState({
    title: "",
    company: "",
    location: "",
    from: "",
    to: "",
    description: "",
  });
  const [education, setEducation] = useState({
    school: "",
    degree: "",
    fieldOfStudy: "",
    from: "",
    to: "",
    description: "",
  });

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const onSubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currstate === "Sign Up" && (!privacyAccepted || !termsAccepted)) {
      toast.error("Please agree to both the Terms of Use and Privacy Policy.");
      return;
    }

    if (currstate === "Sign Up") {
      if (role === "giant" && costToConnect <= 0) {
        toast.error("Please enter a valid cost to connect.");
        return;
      }
      if (!name.trim()) {
        toast.error("Please enter your full name.");
        return;
      }
    }

    try {
      await login(currstate === "Sign Up" ? "signup" : "login", {
        name,
        contact,
        email,
        password,
        Title,
        bio,
        skills: skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        socials: { linkedin, twitter, facebook, instagram },
        certificates,
        experience: [experience],
        education: [education],
        role,
        ...(role === "giant" ? { costToConnect } : {}),
      });

      navigate("/dashboard");
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Authentication failed";
      toast.error(message);
      alert(message);
    }
  };

  const handleCertificateChange = (
    index: number,
    field: string,
    value: string
  ) => {
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

  return (
    <div className="min-h-screen bg-cover flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-md px-4  bg-gradient-to-br from-[#dce7f8] to-[#e9ecf6] text-[#1A1A1A]">
     <Helmet>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-YNLRKR5B36"></script>
        <script>
          {`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-YNLRKR5B36');
    `}
        </script>
      </Helmet>
      {/* Left - Logo */}
      <img src={""} alt="" className="w-[min(30vw,250px)]" />

      {/* Right - Form */}
      <form
        className="ml-50 backdrop-blur-lg bg-white/10 border border-white/20 p-6 flex flex-col gap-5 rounded-xl shadow-xl min-w-[300px] max-w-md w-full"
        onSubmit={onSubmitHandler}
      >
        <h2 className="font-semibold text-2xl flex justify-between items-center">
          {currstate}
        </h2>

        {currstate === "Sign Up" && (
          <>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              type="text"
              className="p-3 rounded-md bg-white/20 border border-black/20 placeholder: text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Full Name (required)"
              required
            />
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="Email (required)"
              className="p-3 rounded-md bg-white/20 border  border-black/20 placeholder: text-[#1A1A1A]  focus:outline-none focus:ring-2 focus:ring-blue-300"
              required
            />

            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder="Password (required)"
              className="p-3 rounded-md bg-white/20 border border-black/20 placeholder: text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-blue-300"
              required
            />

            <input
              onChange={(e) => setContact(e.target.value)}
              value={contact}
              type="text"
              placeholder="Contact (required)"
              className="p-3 rounded-md bg-white/20 border border-black/20 placeholder: text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-blue-300"
              required
            />

            <input
              onChange={(e) => setTitle(e.target.value)}
              value={Title}
              type="text"
              placeholder="Title (eg: Software Engineer) (required)"
              className="p-3 rounded-md bg-white/20 border border-black/20 placeholder: text-[#1A1A1A]  focus:outline-none focus:ring-2 focus:ring-blue-300"
              required
            />

            <textarea
              onChange={(e) => setBio(e.target.value)}
              value={bio}
              rows={2}
              className="p-3 rounded-md bg-white/20 border border-black/20 placeholder: text-[#1A1A1A]  focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Short bio..."
            />

            <input
              onChange={(e) => setSkills(e.target.value)}
              value={skills}
              type="text"
              placeholder="Skills (comma separated)"
              className="p-3 rounded-md bg-white/20 border border-black/20 placeholder: text-[#1A1A1A]  focus:outline-none focus:ring-2 focus:ring-blue-300"
            />

            <div className="flex flex-col gap-1">
              <label className="font-semibold">Education:</label>
              <input
                onChange={(e) =>
                  setEducation({ ...education, school: e.target.value })
                }
                value={education.school}
                type="text"
                placeholder="School / University"
                className="p-3 rounded-md bg-white/20 border border-black/20 placeholder: text-[#1A1A1A]  focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <input
                onChange={(e) =>
                  setEducation({ ...education, degree: e.target.value })
                }
                value={education.degree}
                type="text"
                placeholder="Degree"
                className="p-3 rounded-md bg-white/20 border border-black/20 placeholder: text-[#1A1A1A]  focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <input
                onChange={(e) =>
                  setEducation({ ...education, fieldOfStudy: e.target.value })
                }
                value={education.fieldOfStudy}
                type="text"
                placeholder="Field of Study"
                className="p-3 rounded-md bg-white/20 border border-black/20 placeholder: text-[#1A1A1A]  focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <input
                onChange={(e) =>
                  setEducation({ ...education, from: e.target.value })
                }
                value={education.from}
                type="date"
                className="p-3 rounded-md bg-white/20 border border-black/20 placeholder: text-[#1A1A1A]  focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <input
                onChange={(e) =>
                  setEducation({ ...education, to: e.target.value })
                }
                value={education.to}
                type="date"
                className="p-3 rounded-md bg-white/20 border border-black/20 placeholder: text-[#1A1A1A]  focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <textarea
                onChange={(e) =>
                  setEducation({ ...education, description: e.target.value })
                }
                value={education.description}
                rows={2}
                placeholder="Education Description"
                className="p-3 rounded-md bg-white/20 border border-black/20 placeholder: text-[#1A1A1A]  focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold">Experince:</label>
              <input
                onChange={(e) =>
                  setExperience({ ...experience, title: e.target.value })
                }
                value={experience.title}
                type="text"
                placeholder="Job Title"
                className="p-3 rounded-md bg-white/20 border border-black/20 placeholder: text-[#1A1A1A]  focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <input
                onChange={(e) =>
                  setExperience({ ...experience, company: e.target.value })
                }
                value={experience.company}
                type="text"
                placeholder="Company"
                className="p-3 rounded-md bg-white/20 border border-black/20 placeholder: text-[#1A1A1A]  focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <input
                onChange={(e) =>
                  setExperience({ ...experience, location: e.target.value })
                }
                value={experience.location}
                type="text"
                placeholder="Location"
                className="p-3 rounded-md bg-white/20 border border-black/20 placeholder: text-[#1A1A1A]  focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <input
                onChange={(e) =>
                  setExperience({ ...experience, from: e.target.value })
                }
                value={experience.from}
                type="date"
                className="p-3 rounded-md bg-white/20 border border-black/20 placeholder: text-[#1A1A1A]  focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <input
                onChange={(e) =>
                  setExperience({ ...experience, to: e.target.value })
                }
                value={experience.to}
                type="date"
                className="p-3 rounded-md bg-white/20 border border-black/20 placeholder: text-[#1A1A1A]  focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <textarea
                onChange={(e) =>
                  setExperience({ ...experience, description: e.target.value })
                }
                value={experience.description}
                rows={2}
                placeholder="Experience Description"
                className="p-3 rounded-md bg-white/20 border border-black/20 placeholder: text-[#1A1A1A]  focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold">Certificates:</label>
              {certificates.map((cert, index) => (
                <div key={index} className="flex flex-col gap-2">
                  <input
                    value={cert.name}
                    onChange={(e) =>
                      handleCertificateChange(index, "name", e.target.value)
                    }
                    placeholder="Certificate Name"
                    className="p-3 rounded-md bg-white/20 border border-black/20 placeholder: text-[#1A1A1A]  focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <input
                    value={cert.issuer}
                    onChange={(e) =>
                      handleCertificateChange(index, "issuer", e.target.value)
                    }
                    placeholder="Issued By"
                    className="p-3 rounded-md bg-white/20 border border-black/20 placeholder: text-[#1A1A1A]  focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <input
                    value={cert.date}
                    onChange={(e) =>
                      handleCertificateChange(index, "date", e.target.value)
                    }
                    type="date"
                    className="p-3 rounded-md bg-white/20 border border-black/20 placeholder: text-[#1A1A1A]  focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <input
                    value={cert.url}
                    onChange={(e) =>
                      handleCertificateChange(index, "url", e.target.value)
                    }
                    placeholder="Certificate URL"
                    className="p-3 rounded-md bg-white/20 border border-black/20 placeholder: text-[#1A1A1A]  focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addCertificate}
                className="mt-2 text-blue-600 text-sm underline self-start"
              >
                + Add Another Certificate
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold">Social Media:</label>
              <input
                onChange={(e) => setLinkedin(e.target.value)}
                value={linkedin}
                type="url"
                placeholder="LinkedIn URL"
                className="p-3 rounded-md bg-white/20 border border-black/20 placeholder: text-[#1A1A1A]  focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <input
                onChange={(e) => setInstagram(e.target.value)}
                value={instagram}
                type="url"
                placeholder="Instagram URL"
                className="p-3 rounded-md bg-white/20 border border-black/20 placeholder: text-[#1A1A1A]  focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <input
                onChange={(e) => setFacebook(e.target.value)}
                value={facebook}
                type="url"
                placeholder="Facebook URL"
                className="p-3 rounded-md bg-white/20 border border-black/20 placeholder: text-[#1A1A1A]  focus:outline-none focus:ring-2 focus:ring-blue-300"
              />

              <input
                onChange={(e) => setTwitter(e.target.value)}
                value={twitter}
                type="url"
                placeholder="Twitter URL"
                className="p-3 rounded-md bg-white/20 border border-black/20 placeholder: text-[#1A1A1A]  focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </>
        )}

        {currstate === "Login" && (
          <>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="Email"
              className="p-3 rounded-md bg-white/20 border border-black/20 placeholder: text-[#1A1A1A]  focus:outline-none focus:ring-2 focus:ring-blue-300"
              required
            />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder="Password"
              className="p-3 rounded-md bg-white/20 border border-black/20 placeholder: text-[#1A1A1A]  focus:outline-none focus:ring-2 focus:ring-blue-300"
              required
            />
          </>
        )}

        {currstate === "Sign Up" ? (
          <>
            <div className="flex gap-2 text-xs items-center ">
              <input
                type="checkbox"
                className="accent-blue-500"
                checked={termsAccepted}
                onChange={() => setTermsAccepted(!termsAccepted)}
              />
              <p
                onClick={() => window.open(assets.terms, "_blank")}
                className="cursor-pointer hover:underline"
              >
                Agree to Terms of Use & Conditions
              </p>
            </div>

            <div className="flex gap-2 text-xs items-center ">
              <input
                type="checkbox"
                className="accent-blue-500"
                checked={privacyAccepted}
                onChange={() => setPrivacyAccepted(!privacyAccepted)}
              />
              <p
                onClick={() => window.open(assets.privacy, "_blank")}
                className="cursor-pointer hover:underline"
              >
                Agree to Privacy Policy
              </p>
            </div>
          </>
        ) : null}

        <button
          type="submit"
          className="py-3 bg-gradient-to-r from-blue-700 to-blue-800 font-semibold rounded-full hover:scale-[1.02] transition-transform"
        >
          {currstate === "Sign Up" ? "Create Account" : "Login Now"}
        </button>

        <div className="py-0 flex flex-col gap-2 text-sm ">
          {currstate === "Sign Up" ? (
            <p>
              Already have an account?{" "}
              <span
                onClick={() => setCurrState("Login")}
                className="text-blue-800 hover:underline cursor-pointer font-medium"
              >
                Login here
              </span>
            </p>
          ) : (
            <p>
              New here?{" "}
              <span
                onClick={() => setCurrState("Sign Up")}
                className="text-blue-800 hover:underline cursor-pointer font-medium"
              >
                Create an account
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
