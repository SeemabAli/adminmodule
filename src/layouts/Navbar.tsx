import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiX, FiSun, FiMoon, FiChevronDown } from "react-icons/fi";

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
    const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
    const [mobileAccountDropdownOpen, setMobileAccountDropdownOpen] = useState(false); // Separate state

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    // Close menu on mobile item click
    const closeMenu = () => {
        setMenuOpen(false);
        setMobileAccountDropdownOpen(false); // Close mobile dropdown too
    };

    // Close desktop dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!(event.target as HTMLElement).closest(".dropdown")) {
                setAccountDropdownOpen(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    return (
        <nav className="bg-base-200 shadow-md p-4 fixed top-0 left-0 w-full z-50">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/">
                    <h1 className="text-2xl font-bold hover:text-primary">Cement Factory</h1>
                </Link>
                {/* Desktop Menu */}
                <div className="hidden md:flex items-center">
                    {/* Desktop Dropdown */}
                    <div className="dropdown relative">
                        <button
                            className="btn btn-ghost flex items-center gap-2 hover:text-primary"
                            onClick={(e) => {
                                e.stopPropagation();
                                setAccountDropdownOpen(!accountDropdownOpen);
                            }}
                        >
                            Accounts <FiChevronDown className={`transition-transform ${accountDropdownOpen ? "rotate-180" : ""}`} />
                        </button>
                        {accountDropdownOpen && (
                            <ul className="absolute left-0 mt-2 w-52 menu p-2 shadow bg-base-300 rounded-box">
                                <li><Link to="/accounts/company-accounts">Company Accounts</Link></li>
                                <li><Link to="/accounts/employees">Employees</Link></li>
                                <li><Link to="/accounts/bank-accounts">Bank Accounts</Link></li>
                                <li><Link to="/accounts/truck-information">Truck Information</Link></li>
                                <li><Link to="/accounts/delivery-routes">Delivery Routes</Link></li>
                                <li><Link to="/accounts/tax-accounts">Tax Accounts</Link></li>
                                <li><Link to="/accounts/factory-expenses">Factory Expenses</Link></li>
                                <li><Link to="/accounts/truck-other-expenses">Truck Other Expenses</Link></li>
                            </ul>
                        )}
                    </div>

                    <Link to="/brands" className="btn btn-ghost hover:text-primary" onClick={closeMenu}>Brands</Link>
                    <Link to="/truck-route" className="btn btn-ghost hover:text-primary" onClick={closeMenu}>Truck Route</Link>

                    <button onClick={toggleTheme} className="btn btn-ghost">
                        {theme === "light" ? <FiMoon size={20} /> : <FiSun size={20} />}
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-2xl z-50">
                    {menuOpen ? <FiX /> : <FiMenu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <div className={`fixed top-0 right-0 h-full w-64 bg-base-300 shadow-lg transform ${menuOpen ? "translate-x-0" : "translate-x-full"} transition-transform duration-300 md:hidden z-50`}>
                <button onClick={() => setMenuOpen(false)} className="absolute top-3 right-3 text-2xl">
                    <FiX />
                </button>
                <div className="p-6 mt-10 space-y-4">
                    {/* Mobile Dropdown */}
                    <div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setMobileAccountDropdownOpen(!mobileAccountDropdownOpen);
                            }}
                            className="btn btn-ghost flex justify-between items-center"
                        >
                            Accounts <FiChevronDown className={`transition-transform ${mobileAccountDropdownOpen ? "rotate-180" : ""}`} />
                        </button>
                        {mobileAccountDropdownOpen && (
                            <ul className="menu bg-base-200 rounded-box mt-2 p-2 shadow">
                                <li><Link to="/accounts/company-accounts" onClick={closeMenu}>Company Accounts</Link></li>
                                <li><Link to="/accounts/employees" onClick={closeMenu}>Employees</Link></li>
                                <li><Link to="/accounts/bank-accounts" onClick={closeMenu}>Bank Accounts</Link></li>
                                <li><Link to="/accounts/truck-information" onClick={closeMenu}>Truck Information</Link></li>
                                <li><Link to="/accounts/delivery-routes" onClick={closeMenu}>Delivery Routes</Link></li>
                                <li><Link to="/accounts/tax-accounts" onClick={closeMenu}>Tax Accounts</Link></li>
                                <li><Link to="/accounts/factory-expenses" onClick={closeMenu}>Factory Expenses</Link></li>
                                <li><Link to="/accounts/truck-other-expenses" onClick={closeMenu}>Truck Other Expenses</Link></li>
                            </ul>
                        )}
                    </div>

                    <Link to="/brands" className="btn btn-ghost flex justify-start py-2" onClick={closeMenu}>Brands</Link>
                    <Link to="/truck-route" className="btn btn-ghost flex justify-start py-2" onClick={closeMenu}>Truck Route</Link>

                    <button onClick={toggleTheme} className="btn btn-ghost flex justify-start w-full mt-4">
                        {theme === "light" ? <FiMoon size={20} /> : <FiSun size={20} />} Toggle Theme
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
