import { useState, useEffect } from "react";
import {
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
  FiChevronDown,
  FiLogOut,
} from "react-icons/fi";
import blue from "@/assets/blue.png";
import { Link, useNavigate } from "react-router";
import { notify } from "@/lib/notify";
import { ROLES } from "@/common/constants/roles.constants";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store/store";

type Theme = "corporate" | "business";

interface NavbarProps {
  handleLogout: () => void;
}

export const Header = ({ handleLogout }: NavbarProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("corporate");
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [mobileAccountDropdownOpen, setMobileAccountDropdownOpen] =
    useState(false);
  const navigate = useNavigate();

  const userRoles = useSelector((state: RootState) => state.auth.roles);

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

  const closeMenu = () => {
    try {
      setMenuOpen(false);
      setMobileAccountDropdownOpen(false);
    } catch (error) {
      console.error("Error closing menu:", error);
      notify.error("Failed to close menu.");
    }
  };

  const handleDropdownItemClick = () => {
    try {
      setAccountDropdownOpen(false);
    } catch (error) {
      console.error("Error handling dropdown click:", error);
      notify.error("Failed to close dropdown.");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      try {
        if (!(event.target as HTMLElement).closest(".dropdown")) {
          setAccountDropdownOpen(false);
          setMobileAccountDropdownOpen(false);
        }
      } catch (error) {
        console.error("Error handling outside click:", error);
        notify.error("Failed to close dropdown.");
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleLogoutClick = () => {
    try {
      handleLogout(); // Call the passed logout function
      notify.success("Logged out successfully");
      void navigate("/login"); // Redirect to login page
    } catch (error) {
      console.error("Error logging out:", error);
      notify.error("Failed to log out.");
    }
  };

  type NavLink = {
    path: string;
    title: string;
    allowedRoles: number[];
    inDropdown: boolean;
  };

  const allNavLinks: NavLink[] = [
    {
      path: "/company-accounts",
      title: "Company Accounts",
      allowedRoles: [ROLES.ADMIN],
      inDropdown: true,
    },
    {
      path: "/delivery-routes",
      allowedRoles: [ROLES.ADMIN],
      title: "Delivery Routes",
      inDropdown: true,
    },
    {
      path: "/tax-accounts",
      allowedRoles: [ROLES.ADMIN],
      title: "Tax Accounts",
      inDropdown: true,
    },
    // {
    //   path: "/purchase",
    //   allowedRoles: [ROLES.ADMIN],
    //   title: "Purchase",
    //   inDropdown: true,
    // },
    // {
    //   path: "/bank-accounts",
    //   allowedRoles: [ROLES.ADMIN],
    //   title: "Bank Accounts",
    //   inDropdown: true,
    // },
    // {
    //   path: "/employees",
    //   allowedRoles: [ROLES.ADMIN],
    //   title: "Employees",
    //   inDropdown: true,
    // },
    // {
    //   path: "/truck-information",
    //   allowedRoles: [ROLES.ADMIN],
    //   title: "Truck Information",
    //   inDropdown: true,
    // },
    // {
    //   path: "/factory-expenses",
    //   allowedRoles: [ROLES.ADMIN],
    //   title: "Factory Expenses",
    //   inDropdown: true,
    // },
    // {
    //   path: "/truck-other-expenses",
    //   allowedRoles: [ROLES.ADMIN],
    //   title: "Truck Other Expenses",
    //   inDropdown: true,
    // },
    {
      path: "/customer",
      allowedRoles: [ROLES.ADMIN],
      title: "Customer",
      inDropdown: true,
    },
    {
      path: "/brands",
      allowedRoles: [ROLES.ADMIN],
      title: "Brands",
      inDropdown: false,
    },
    // {
    //   path: "/truck-route",
    //   allowedRoles: [ROLES.ADMIN],
    //   title: "Truck Route",
    //   inDropdown: false,
    // },
  ];

  if (!userRoles) return null;

  const roleBasedNavLinks = allNavLinks.filter(({ allowedRoles }) =>
    allowedRoles.some((role) => userRoles.includes(role)),
  );

  const dropdownLinks = roleBasedNavLinks.filter((link) => link.inDropdown);
  const topNavLinks = roleBasedNavLinks.filter((link) => !link.inDropdown);

  return (
    <nav className="bg-base-100 shadow-md p-4 fixed top-0 left-0 w-full z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3">
          <img src={blue} alt="Logo" className="h-10 w-auto" />
          <h1 className="text-2xl font-bold hover:text-info">MB & CO</h1>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4">
          <div className="dropdown relative">
            <button
              className="btn btn-ghost flex items-center gap-2 hover:text-info"
              onClick={(e) => {
                e.stopPropagation();
                setAccountDropdownOpen((prev) => !prev);
              }}
            >
              Accounts{" "}
              <FiChevronDown
                className={`transition-transform ${accountDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>
            {accountDropdownOpen && (
              <ul className="absolute left-0 mt-2 w-52 menu p-2 shadow bg-base-300 rounded-box">
                {dropdownLinks.map((link, index) => (
                  <li key={index}>
                    <Link to={link.path} onClick={handleDropdownItemClick}>
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {topNavLinks.map((link, index) => (
            <Link
              key={index}
              to={link.path}
              className="btn btn-ghost hover:text-info"
              onClick={handleDropdownItemClick}
            >
              {link.title}
            </Link>
          ))}

          <button onClick={toggleTheme} className="btn btn-ghost">
            {theme === "corporate" ? <FiMoon size={20} /> : <FiSun size={20} />}
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogoutClick}
            className="btn btn-info text-white flex items-center"
          >
            <FiLogOut size={20} className="mr-2" /> Logout
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => {
            setMenuOpen((prev) => !prev);
          }}
          className="md:hidden text-2xl z-50"
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        {/* Mobile Menu */}
        <div
          className={`fixed top-0 right-0 h-full w-64 bg-base-300 shadow-lg transform ${menuOpen ? "translate-x-0" : "translate-x-full"} transition-transform duration-300 md:hidden z-50`}
        >
          <button
            onClick={closeMenu}
            className="absolute top-3 right-3 text-2xl"
          >
            <FiX />
          </button>
          <div className="p-6 mt-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMobileAccountDropdownOpen((prev) => !prev);
              }}
              className="btn btn-ghost flex justify-between items-center w-full"
            >
              Accounts{" "}
              <FiChevronDown
                className={`transition-transform ${mobileAccountDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>
            {mobileAccountDropdownOpen && (
              <ul className="menu bg-base-200 p-2 shadow">
                {dropdownLinks.map((link, index) => (
                  <li key={index}>
                    <Link to={link.path} onClick={closeMenu}>
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {topNavLinks.map((link, index) => (
              <Link
                key={index}
                to={link.path}
                className="btn btn-ghost flex justify-start py-2"
                onClick={closeMenu}
              >
                {link.title}
              </Link>
            ))}

            <button
              onClick={toggleTheme}
              className="btn btn-ghost flex justify-start w-full mt-2 mb-4"
            >
              {theme === "corporate" ? (
                <FiMoon size={20} />
              ) : (
                <FiSun size={20} />
              )}{" "}
              Toggle Theme
            </button>

            <button
              onClick={handleLogoutClick}
              className="btn btn-info text-white w-full flex justify-center"
            >
              <FiLogOut size={20} className="mr-2" /> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
