import { useState, useContext, useEffect } from "react";
import MainSidebar from "../components/MainSidebar";
import { ChatContext } from "../../context/ChatContext";
import Meeting from "../components/Meeting";
import Navbar from "../components/Navbar";
import { Helmet } from "react-helmet";


interface HomePageProps {
  isDark: boolean;
  setIsDark: (value: boolean) => void;
}
const HomePage: React.FC<HomePageProps> = ({ isDark, setIsDark }) => {

  const [isCollapsed, setIsCollapsed] = useState(() => window.innerWidth < 640);
   const [isHidden, setIsHidden] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState<boolean>(false);

  const context = useContext(ChatContext);
  if (!context) throw new Error("Context not found");

  const { selectedUser } = context;

    useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
       setIsMobile(true)
        setIsCollapsed(true)
      } else {
        setIsCollapsed(false)
        setIsMobile(false)
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
        className={`border border-gray-600 rounded-lg overflow-hidden h-full grid relative transition-all duration-300 ${
          isMobile
            ? isCollapsed
              ? "grid-cols-[100px_auto]"
              : "grid-cols-[250px_auto]"
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
       <Navbar isHidden={isHidden} isDark={isDark} setIsDark={setIsDark} setIsHidden={setIsHidden}/>
        <Meeting
         isDark={isDark}
         isMobile={isMobile}
         setIsDark={setIsDark}
        />
      </div>
    </div>
  );
};

export default HomePage;
