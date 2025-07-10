import React, { useContext, useEffect, useState } from "react";
import MainSidebar from "../components/MainSidebar";
import ProfileComp from "../components/ProfileComp";
import EditProfile from "../components/EditProfile";
import { AuthContext } from "../../context/AuthContext";
import { Helmet } from "react-helmet";


interface ProfileProps {
  isDark: boolean;
  setIsDark: (value: boolean) => void;
}

const Profile: React.FC<ProfileProps> = ({ isDark, setIsDark }) => {
  const [isCollapsed, setIsCollapsed] = useState(() => window.innerWidth < 640);
   const [edit, setEdit] = useState<boolean>(false);
   const {authUser}=useContext(AuthContext)

  useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [])

  return (
   <div
  className={`h-screen grid relative transition-all duration-300 ${
    isCollapsed ? "grid-cols-[100px_1fr]" : "grid-cols-[250px_1fr]"
  }`}
>
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
  <div className="h-screen">
    <MainSidebar
      isDark={isDark}
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
    />
  </div>

  <div className="h-screen overflow-y-auto">
    {!edit && <ProfileComp user = {authUser}setEdit={setEdit} />}
    {edit && <EditProfile setEdit={setEdit} />}
  </div>
</div>

  );
};

export default Profile;
