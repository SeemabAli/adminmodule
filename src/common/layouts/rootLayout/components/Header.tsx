import { useState, useEffect } from "react";
import { FiSun, FiMoon, FiLogOut } from "react-icons/fi";
import blue from "@/assets/blue.png";
import { Link, useNavigate } from "react-router";
import { notify } from "@/lib/notify";

type Theme = "corporate" | "business";

interface NavbarProps {
  handleLogout: () => void;
}

export const Header = ({ handleLogout }: NavbarProps) => {
  const [theme, setTheme] = useState<Theme>("corporate");
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedTheme =
        (localStorage.getItem("theme") as Theme | undefined) ?? "corporate";
      setTheme(storedTheme);
      document.documentElement.setAttribute("data-theme", storedTheme);
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      notify.error("Failed to load theme settings.");
    }
  }, []);

  useEffect(() => {
    try {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    } catch (error) {
      console.error("Error saving theme to localStorage:", error);
      notify.error("Failed to save theme settings.");
    }
  }, [theme]);

  const toggleTheme = () => {
    try {
      setTheme((prev) => (prev === "corporate" ? "business" : "corporate"));
    } catch (error) {
      console.error("Error toggling theme:", error);
      notify.error("Failed to change theme.");
    }
  };

  const handleLogoutClick = () => {
    try {
      handleLogout();
      notify.success("Logged out successfully");
      void navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      notify.error("Failed to log out.");
    }
  };

  return (
    <nav className="bg-base-100 shadow-md p-4 fixed top-0 left-0 w-full z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3">
          <img src={blue} alt="Logo" className="h-10 w-auto" />
          <h1 className="text-2xl font-bold hover:text-info">E-Bridge</h1>
        </Link>

        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="btn btn-ghost">
            {theme === "corporate" ? <FiMoon size={20} /> : <FiSun size={20} />}
          </button>
          <button
            onClick={handleLogoutClick}
            className="btn btn-info text-white flex items-center"
          >
            <FiLogOut size={20} className="mr-2" /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
};
