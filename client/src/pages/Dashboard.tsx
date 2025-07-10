import { useContext, useState } from "react";
import MainSidebar from "../components/MainSidebar";
import DashboardContainer from "../components/DashboardContainer";
import GiantContainer from "../components/GiantContainer";
import { AuthContext } from "../../context/AuthContext";
import { Helmet } from "react-helmet";

interface DashboardProps {
  isDark: boolean;
  setIsDark: (value: boolean) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ isDark, setIsDark }) => {
 const [isCollapsed, setIsCollapsed] = useState(() => window.innerWidth < 640);
  const {authUser}= useContext(AuthContext)

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
        className="border border-gray-600 rounded-lg overflow-hidden h-full grid transition-all duration-300"
        style={{
          gridTemplateColumns: isCollapsed ? "100px auto" : "250px auto",
        }}
      >
        <MainSidebar
          isDark={isDark}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        {authUser?.role === "giant"?<GiantContainer
             isDark={isDark}
          setIsDark={setIsDark}
          isCollapsed={isCollapsed}/>
        :<DashboardContainer
          isDark={isDark}
          setIsDark={setIsDark}
          isCollapsed={isCollapsed}
        />}
      </div>
    </div>
  );
};

export default Dashboard;
