import { useState, useContext, useEffect } from "react";
import MainSidebar from "../components/MainSidebar";
import RightSidebar from "../components/RightSidebar";

import { ChatContext } from "../../context/ChatContext";
import ConnectComp from "../components/ConnectComp";
import ConnectModal from "../components/ConnectModal";
import Navbar from "../components/Navbar";
import ProfileView from "../components/ProfileView";
import ProfileComp from "../components/ProfileComp";
import { Helmet } from "react-helmet";

interface HomePageProps {
  isDark: boolean;
  setIsDark: (value: boolean) => void;
}
const HomePage: React.FC<HomePageProps> = ({ isDark, setIsDark }) => {
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const [showConnectModal, setShowConnectModal] = useState<boolean>(false);
  const [showFullProfile, setShowFullProfile] = useState<boolean>(false);
  const [showprofile, setShowProfile] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState(() => window.innerWidth < 640);
  const [isMobile, setIsMobile] = useState(false);

  const context = useContext(ChatContext);
  if (!context) throw new Error("Context not found");

  const { selectedUser } = context;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
      setIsCollapsed(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="w-full h-screen ">
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
      <div
        className={`border border-gray-600 rounded-lg overflow-hidden h-full grid relative transition-all duration-300 ${
          isMobile
            ? selectedUser
              ? isCollapsed
                ? "grid-cols-[100px_auto]"
                : "grid-cols-[250px_auto]"
              : isCollapsed
              ? "grid-cols-[100px_auto]"
              : "grid-cols-[250px_auto]"
            : selectedUser
            ? isCollapsed
              ? "grid-cols-[100px_3fr_auto]"
              : "grid-cols-[250px_3fr_auto]"
            : isCollapsed
            ? "grid-cols-[100px_4.25fr]"
            : "grid-cols-[250px_4.25fr]"
        }`}
      >
        <MainSidebar
          isDark={isDark}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        {(!isMobile || (isMobile && !showprofile)) && (
          <ConnectComp
            setIsHidden={setIsHidden}
            isDark={isDark}
            setIsDark={setIsDark}
            setShowConnectModal={setShowConnectModal}
            isCollapsed={isCollapsed}
            isMobile={isMobile}
            setShowProfile={setShowProfile}
          />
        )}
        {isMobile && selectedUser && showprofile && (
          <ProfileView isDark={isDark} setShowProfile={setShowProfile} />
        )}

        <ConnectModal
          selectedUser={selectedUser}
          showConnectModal={showConnectModal}
          setShowConnectModal={setShowConnectModal}
        />

        {!showFullProfile && (
          <Navbar
            setIsHidden={setIsHidden}
            isHidden={isHidden}
            isDark={isDark}
            setIsDark={setIsDark}
          />
        )}
        {!isMobile && showFullProfile && (
          <div className="h-full overflow-y-auto bg-[#f9fbfc]">
            <ProfileComp user={selectedUser} setShowFullProfile={setShowFullProfile}/>
          </div>
        )}

        {!isMobile && selectedUser && !showFullProfile&& (
          <RightSidebar
            isHidden={isHidden}
            isDark={isDark}
            setShowFullProfile={setShowFullProfile}
          />
        )}
      </div>
    </div>
  );
};

export default HomePage;
