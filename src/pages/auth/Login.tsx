import { useState } from "react";
import { notify } from "../../lib/notify";
import logo from "../../assets/logo.png"; // Importing the company logo
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Importing eye icons

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({ email: "", password: "" });

    const validateInput = (value: string) => {
        if (!value.trim()) return "This field is required";
        if (value.length < 3) return "Minimum 3 characters required";
        return "";
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (email === "admin@gmail.com" && password === "pass123") {
            localStorage.setItem("isAuthenticated", "true");
            window.location.href = "/"; // Redirect to the homepage
        } else {
            notify.error("Invalid credentials");
        }
    };

    return (
        <div className="flex justify-center items-center px-4 min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-gray-900 dark:to-gray-800">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl border dark:border-gray-700">

                {/* Logo and Company Name */}
                <div className="flex flex-col items-center mb-6">
                    <img src={logo} alt="MB&CO Logo" className="h-16 w-auto rounded-full shadow-md" />
                    <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white mt-2">MB&CO</h1>
                </div>

                <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-white">Welcome Back</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">Sign in to continue</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email Input */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text dark:text-gray-200 text-md">Email</span>
                        </label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={() => setErrors({ ...errors, email: validateInput(email) })}
                            className={`input input-bordered w-full px-4 py-3 text-md rounded-lg shadow-md ${errors.email ? "border-red-500" : ""
                                }`}
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    {/* Password Input with Toggle Icon */}
                    <div className="form-control relative">
                        <label className="label">
                            <span className="label-text dark:text-gray-200 text-md">Password</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onBlur={() => setErrors({ ...errors, password: validateInput(password) })}
                                className={`input input-bordered w-full px-4 py-3 text-md rounded-lg shadow-md pr-10 ${errors.password ? "border-red-500" : ""
                                    }`}
                            />
                            {/* Eye Icon Button */}
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-800 dark:text-gray-300 hover:text-gray-800 dark:hover:text-black"
                            >
                                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>

                    <button type="submit" className="btn btn-success mt-5 w-full text-lg py-3 rounded-lg shadow-md hover:scale-105 transition-all">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
