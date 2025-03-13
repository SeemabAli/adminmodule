import { useState } from "react";
import { notify } from "../../lib/notify";
import logo from "../../assets/logo.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export const Login = () => {
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
            window.location.href = "/";
        } else {
            notify.error("Invalid credentials");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-base-200">
            <div className="card w-full max-w-md bg-white shadow-lg rounded-2xl p-8">

                {/* Logo & Branding */}
                <div className="flex flex-col items-center mb-6">
                    <img src={logo} alt="MB&CO Logo" className="h-16 w-auto rounded-full shadow-md" />
                    <h1 className="text-2xl font-bold text-gray-800 mt-2">MB&CO</h1>
                </div>

                <h2 className="text-xl font-semibold text-center text-gray-700">Welcome Back</h2>
                <p className="text-sm text-gray-500 text-center mb-6">Sign in to continue</p>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Email Input */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text text-gray-700">Email</span>
                        </label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={() => setErrors({ ...errors, email: validateInput(email) })}
                            className={`input input-bordered w-full ${errors.email ? "border-red-500" : ""}`}
                        />
                        {errors.email && <div className="alert alert-error mt-2">{errors.email}</div>}
                    </div>

                    {/* Password Input with Toggle */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text text-gray-700">Password</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onBlur={() => setErrors({ ...errors, password: validateInput(password) })}
                                className={`input input-bordered w-full pr-10 ${errors.password ? "border-red-500" : ""}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                            </button>
                        </div>
                        {errors.password && <div className="alert alert-error mt-2">{errors.password}</div>}
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        className="btn btn-primary w-full text-lg py-3 rounded-lg hover:scale-105 transition-all"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};
