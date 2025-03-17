import { Header } from "./components/Header";
import Footer from "./components/Footer";
import { Outlet } from "react-router";

export function RootLayout() {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const handleLogout = () => {};
  return (
    <div className="flex flex-col min-h-screen pt-16">
      <Header handleLogout={handleLogout} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
