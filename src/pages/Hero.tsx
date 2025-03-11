import { FiUser, FiSettings, FiCheckCircle } from "react-icons/fi";
import logo from "../assets/logo.png";

const Hero = () => {
    return (
        <section className="relative bg-base-200 w-full text-center py-20 px-6 md:px-12 lg:px-24">
            <div className="max-w-4xl mx-auto">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <img src={logo} alt="Company Logo" className="w-24 h-24 md:w-32 md:h-32 object-contain" />
                </div>

                <h1 className="text-4xl md:text-5xl font-bold animate-fade-in">
                    Welcome to the Admin Panel
                </h1>
                <p className="mt-4 text-lg text-gray-900 dark:text-gray-400">
                    Manage your cement factory operations efficiently with real-time insights.
                </p>

                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex items-center gap-4 bg-white text-gray-800 p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                        <FiUser className="text-3xl" />
                        <span className="font-semibold">Management</span>
                    </div>
                    <div className="flex items-center gap-4 bg-white text-gray-800 p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                        <FiSettings className="text-3xl" />
                        <span className="font-semibold">Settings</span>
                    </div>
                    <div className="flex items-center gap-4 bg-white text-gray-800 p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                        <FiCheckCircle className="text-3xl" />
                        <span className="font-semibold">Reports & Analytics</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
