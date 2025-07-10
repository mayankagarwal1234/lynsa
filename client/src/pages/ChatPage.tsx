import { useState, useContext, useEffect } from "react";
import ChatContainer from "../components/ChatContainer";
import MainSidebar from "../components/MainSidebar";
import RightSidebar from "../components/RightSidebar";
import Sidebar from "../components/Sidebar";
import { ChatContext } from "../../context/ChatContext";
import Navbar from "../components/Navbar";
import { Helmet } from "react-helmet";

interface ChatPageProps {
  isDark: boolean;
  setIsDark: (value: boolean) => void;
}

const ChatPage: React.FC<ChatPageProps> = ({ isDark, setIsDark }) => {
  const [isHidden, setIsHidden] = useState<boolean>(false);
   const [isCollapsed, setIsCollapsed] = useState(() => window.innerWidth < 640);
  const [showRightSidebar, setShowRightSidebar] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const context = useContext(ChatContext);
  if (!context) throw new Error("Context not found");

  const { selectedUser } = context;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setIsMobile(true);
        setShowRightSidebar(false);
        setIsCollapsed(true)
      } else {
        setIsMobile(false);
        setShowRightSidebar(true);
        setIsCollapsed(false)
      }
    };

    handleResize(); // initial
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="w-full h-screen">
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
        className={`grid h-full w-full transition-all duration-300
          ${
            isMobile
              ? selectedUser
                ? "grid-cols-1" // on mobile, show only chat when selected
                :isCollapsed? "grid-cols-[100px_1fr]": "grid-cols-[250px_1fr]"// only sidebars
              : (selectedUser
              ? isCollapsed
                ? "grid-cols-[100px_0.75fr_1.25fr_auto]"
                : "grid-cols-[250px_0.75fr_1.25fr_auto]"
              : isCollapsed
              ? "grid-cols-[100px_1fr_1.25fr]"
              : "grid-cols-[250px_1fr_1.25fr]")
          }`}
      >
        {/* MainSidebar & Sidebar only if not mobile OR mobile and no user selected */}
        {(!isMobile || !selectedUser) && ( 
          <>
            <MainSidebar
              isDark={isDark}
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
            />

            <Sidebar setIsHidden={setIsHidden} isDark={isDark} />
          </>
        )}

        {/* ChatContainer always */}
        <Navbar isHidden={isHidden} isDark={isDark} setIsDark={setIsDark} setIsHidden={setIsHidden} />
        {(!isMobile || selectedUser) && (
          <ChatContainer
            setIsHidden={setIsHidden}
            isHidden={isHidden}
            showRightSidebar={showRightSidebar}
            isMobile={isMobile}
            isDark={isDark}
            setIsDark={setIsDark}
          />
        )}

        {/* RightSidebar only on non-mobile */}
        {selectedUser && showRightSidebar && !isMobile && (
          <RightSidebar isHidden={isHidden} isDark={isDark} setIsDark={setIsDark} setIsHidden={setIsHidden}/>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
