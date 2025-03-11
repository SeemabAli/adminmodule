import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiX, FiSun, FiMoon } from "react-icons/fi";

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
    };

    return (
        <nav className="bg-base-200 shadow-md p-4 fixed top-0 left-0 w-full z-50">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold">Cement Factory</h1>

                {/* Desktop Menu */}
                <div className="hidden md:flex space-x-6 items-center">
                    {/* DaisyUI Dropdown */}
                    <div className="dropdown dropdown-hover">
                        <label tabIndex={0} className="btn btn-ghost m-1">Accounts</label>
                        <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-300 rounded-box w-52">
                            <li><Link to="/accounts/company-accounts">Company Accounts</Link></li>
                            <li><Link to="/accounts/employees">Employees</Link></li>
                            <li><Link to="/accounts/bank-accounts">Bank Accounts</Link></li>
                            <li><Link to="/accounts/truck-information">Truck Information</Link></li>
                            <li><Link to="/accounts/delivery-routes">Delivery Routes</Link></li>
                            <li><Link to="/accounts/tax-accounts">Tax Accounts</Link></li>
                            <li><Link to="/accounts/factory-expenses">Factory Expenses</Link></li>
                            <li><Link to="/accounts/truck-other-expenses">Truck Other Expenses</Link></li>
                        </ul>
                    </div>

                    <Link to="/brands" className="hover:text-gray-400">Brands</Link>
                    <Link to="/truck-route" className="hover:text-gray-400">Truck Route</Link>

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
                    {/* DaisyUI Dropdown in Mobile Menu */}
                    <div className="dropdown">
                        <label tabIndex={0} className="btn btn-ghost w-full text-left">Accounts</label>
                        <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-300 rounded-box w-52">
                            <li><Link to="/accounts/company-accounts">Company Accounts</Link></li>
                            <li><Link to="/accounts/employees">Employees</Link></li>
                            <li><Link to="/accounts/bank-accounts">Bank Accounts</Link></li>
                            <li><Link to="/accounts/truck-information">Truck Information</Link></li>
                            <li><Link to="/accounts/delivery-routes">Delivery Routes</Link></li>
                            <li><Link to="/accounts/tax-accounts">Tax Accounts</Link></li>
                            <li><Link to="/accounts/factory-expenses">Factory Expenses</Link></li>
                            <li><Link to="/accounts/truck-other-expenses">Truck Other Expenses</Link></li>
                        </ul>
                    </div>

                    <Link to="/brands" className="block py-2">Brands</Link>
                    <Link to="/truck-route" className="block py-2">Truck Route</Link>

                    <button onClick={toggleTheme} className="btn btn-ghost w-full mt-4">
                        {theme === "light" ? <FiMoon size={20} /> : <FiSun size={20} />} Toggle Theme
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
