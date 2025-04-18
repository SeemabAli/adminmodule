/* eslint-disable react-refresh/only-export-components */
interface UserData {
  name: string;
  role: string;
  permissions: string[];
}
// AttendanceContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  type ReactNode,
} from "react";

interface AttendanceContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  fetchUserData: () => Promise<void>;
  userData: UserData | null;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(
  undefined,
);

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error("useAttendance must be used within an AttendanceProvider");
  }
  return context;
};

interface AttendanceProviderProps {
  children: ReactNode;
}

export const AttendanceProvider = ({ children }: AttendanceProviderProps) => {
  const [activeTab, setActiveTab] = useState("Attendance");
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  const fetchUserData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      // Simulate API call with delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const data: UserData = {
        name: "Admin User",
        role: "Administrator",
        permissions: [
          "attendance.view",
          "attendance.edit",
          "leave.manage",
          "holiday.manage",
          "reports.view",
          "settings.manage",
        ],
      };

      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    activeTab,
    setActiveTab,
    isLoading,
    setIsLoading,
    fetchUserData,
    userData,
  };

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  );
};

export default AttendanceContext;
