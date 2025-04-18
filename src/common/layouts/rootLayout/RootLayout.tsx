import { Header } from "./components/Header";
import { Outlet } from "react-router";
import Sidebar from "./components/Sidebar";

export function RootLayout() {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const handleLogout = () => {};

  return (
    <div className="flex flex-col min-h-screen">
      <Header handleLogout={handleLogout} />
      <div className="flex flex-1 pt-16">
        <div className="md:w-60 flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 p-2 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
