import { useState, useEffect } from "react";
import { FiMenu, FiX, FiSun, FiMoon, FiChevronDown, FiLogOut } from "react-icons/fi";
import { notify } from "../../../lib/notify";
import blue from "../../../assets/blue.png";
import { Link, useNavigate } from "react-router";

type Theme = "corporate" | "business";

interface NavbarProps {
    handleLogout: () => void;

}

export const Header = ({ handleLogout }: NavbarProps) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [theme, setTheme] = useState<Theme>("corporate");
    const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
    const [mobileAccountDropdownOpen, setMobileAccountDropdownOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        try {
            const storedTheme = localStorage.getItem("theme") as Theme || "corporate";
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
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const handleLogoutClick = () => {
        try {
            handleLogout(); // Call the passed logout function
            notify.success("Logged out successfully");
            navigate("/login"); // Redirect to login page
        } catch (error) {
            console.error("Error logging out:", error);
            notify.error("Failed to log out.");
        }
    };

    return (
        <nav className="bg-base-100 shadow-md p-4 fixed top-0 left-0 w-full z-50">
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
                            Accounts <FiChevronDown className={`transition-transform ${accountDropdownOpen ? "rotate-180" : ""}`} />
                        </button>
                        {accountDropdownOpen && (
                            <ul className="absolute left-0 mt-2 w-52 menu p-2 shadow bg-base-300 rounded-box">
                                <li><Link to="/company-accounts" onClick={handleDropdownItemClick}>Company Accounts</Link></li>
                                <li><Link to="/customer" onClick={handleDropdownItemClick}>Customer</Link></li>
                                <li><Link to="/employees" onClick={handleDropdownItemClick}>Employees</Link></li>
                                <li><Link to="/bank-accounts" onClick={handleDropdownItemClick}>Bank Accounts</Link></li>
                                <li><Link to="/truck-information" onClick={handleDropdownItemClick}>Truck Information</Link></li>
                                <li><Link to="/delivery-routes" onClick={handleDropdownItemClick}>Delivery Routes</Link></li>
                                <li><Link to="/tax-accounts" onClick={handleDropdownItemClick}>Tax Accounts</Link></li>
                                <li><Link to="/factory-expenses" onClick={handleDropdownItemClick}>Factory Expenses</Link></li>
                                <li><Link to="/truck-other-expenses" onClick={handleDropdownItemClick}>Truck Other Expenses</Link></li>
                            </ul>
                        )}
                    </div>

                    <Link to="/brands" className="btn btn-ghost hover:text-info" onClick={handleDropdownItemClick}>Brands</Link>
                    <Link to="/truck-route" className="btn btn-ghost hover:text-info" onClick={handleDropdownItemClick}>Truck Route</Link>

                    <button onClick={toggleTheme} className="btn btn-ghost">
                        {theme === "corporate" ? <FiMoon size={20} /> : <FiSun size={20} />}
                    </button>

                    {/* Logout Button */}
                    <button onClick={handleLogoutClick} className="btn btn-info text-white flex items-center">
                        <FiLogOut size={20} className="mr-2" /> Logout
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button onClick={() => setMenuOpen((prev) => !prev)} className="md:hidden text-2xl z-50">
                    {menuOpen ? <FiX /> : <FiMenu />}
                </button>

                {/* Mobile Menu */}
                <div className={`fixed top-0 right-0 h-full w-64 bg-base-300 shadow-lg transform ${menuOpen ? "translate-x-0" : "translate-x-full"} transition-transform duration-300 md:hidden z-50`}>
                    <button onClick={closeMenu} className="absolute top-3 right-3 text-2xl">
                        <FiX />
                    </button>
                    <div className="p-6 mt-10 space-y-4">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setMobileAccountDropdownOpen((prev) => !prev);
                            }}
                            className="btn btn-ghost flex justify-between items-center w-full"
                        >
                            Accounts <FiChevronDown className={`transition-transform ${mobileAccountDropdownOpen ? "rotate-180" : ""}`} />
                        </button>
                        {mobileAccountDropdownOpen && (
                            <ul className="menu bg-base-200 rounded-box mt-2 p-2 shadow">
                                <li><Link to="/company-accounts" onClick={closeMenu}>Company Accounts</Link></li>
                                <li><Link to="/customer" onClick={closeMenu}>Customer</Link></li>
                                <li><Link to="/employees" onClick={closeMenu}>Employees</Link></li>
                                <li><Link to="/bank-accounts" onClick={closeMenu}>Bank Accounts</Link></li>
                                <li><Link to="/truck-information" onClick={closeMenu}>Truck Information</Link></li>
                                <li><Link to="/delivery-routes" onClick={closeMenu}>Delivery Routes</Link></li>
                                <li><Link to="/tax-accounts" onClick={closeMenu}>Tax Accounts</Link></li>
                                <li><Link to="/factory-expenses" onClick={closeMenu}>Factory Expenses</Link></li>
                                <li><Link to="/truck-other-expenses" onClick={closeMenu}>Truck Other Expenses</Link></li>
                            </ul>
                        )}

                        <Link to="/brands" className="btn btn-ghost flex justify-start py-2" onClick={closeMenu}>Brands</Link>
                        <Link to="/truck-route" className="btn btn-ghost flex justify-start py-2" onClick={closeMenu}>Truck Route</Link>

                        <button onClick={toggleTheme} className="btn btn-ghost flex justify-start w-full mt-4">
                            {theme === "corporate" ? <FiMoon size={20} /> : <FiSun size={20} />} Toggle Theme
                        </button>

                        <button onClick={handleLogoutClick} className="btn btn-info text-white w-full flex justify-center">
                            <FiLogOut size={20} className="mr-2" /> Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};