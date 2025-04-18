import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  signInUserSchema,
  type SignInUserData,
} from "@/core/auth/schema/auth.schema";
import {
  signInUser,
  requestPasswordReset,
} from "@/core/auth/services/auth.service";
import { authActions } from "@/core/auth/auth.slice";
import { notify } from "@/lib/notify";
import { FormField } from "@/common/components/ui/form/FormField";
import { Button } from "@/common/components/ui/Button";
import {
  FaEye,
  FaEyeSlash,
  FaUserGraduate,
  FaLock,
  FaEnvelope,
} from "react-icons/fa";
import { motion } from "framer-motion";

import logo from "@/assets/logo.png";

// Schema for forgot password email validation
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: pending },
  } = useForm<SignInUserData>({
    resolver: zodResolver(signInUserSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    register: registerForgotPassword,
    handleSubmit: handleForgotPasswordSubmit,
    formState: {
      errors: forgotPasswordErrors,
      isSubmitting: forgotPasswordPending,
    },
    reset: resetForgotPassword,
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleForgotPassword = () => {
    setShowForgotPassword((prev) => !prev);
    resetForgotPassword();
  };

  const onSubmit: SubmitHandler<SignInUserData> = async (data) => {
    try {
      const { accessToken, roles, requiresPasswordChange } =
        await signInUser(data);

      dispatch(authActions.setAuth({ accessToken, roles }));

      // Redirect to set-password page on one-time login
      if (requiresPasswordChange) {
        await navigate("/set-password");
        notify.success("Create new password");
        return;
      }

      notify.success("Sign in successful");
      await navigate("/");
    } catch (error) {
      if (error instanceof Error) {
        notify.error(error.message);
      }
    }
  };

  const onForgotPasswordSubmit: SubmitHandler<ForgotPasswordData> = async (
    data,
  ) => {
    try {
      await requestPasswordReset(data.email);
      notify.success("Password reset link sent to your email");
      toggleForgotPassword();
    } catch (error) {
      if (error instanceof Error) {
        notify.error(error.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="grid md:grid-cols-2 w-full max-w-5xl bg-base-100 rounded-lg shadow-md overflow-hidden">
        {/* Left Side - Illustration/Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden md:flex flex-col justify-center items-center p-8 bg-gray-300 text-base-content"
        >
          <div className="text-center">
            <img
              src={logo}
              alt="E-Bridge Logo"
              className="w-32 h-32 mx-auto mb-6"
            />
            <h1 className="text-4xl font-bold mb-4">E-Bridge</h1>
            <p className="text-xl mb-6">School Admin Panel</p>
            <div className="space-y-4 text-left">
              <div className="flex items-center">
                <div className="bg-base-300 p-2 rounded-full mr-3">
                  <FaUserGraduate className="text-base-content text-xl" />
                </div>
                <p>Manage students, staff, and classes</p>
              </div>
              <div className="flex items-center">
                <div className="bg-base-300 p-2 rounded-full mr-3">
                  <FaEnvelope className="text-base-content text-xl" />
                </div>
                <p>Communication and notifications</p>
              </div>
              <div className="flex items-center">
                <div className="bg-base-300 p-2 rounded-full mr-3">
                  <FaLock className="text-base-content text-xl" />
                </div>
                <p>Secure access to school resources</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="p-8 md:p-12 flex flex-col justify-center"
        >
          {/* Mobile Logo */}
          <div className="md:hidden flex flex-col items-center mb-8">
            <img src={logo} alt="E-Bridge Logo" className="w-20 h-20 mb-2" />
            <h1 className="text-2xl font-bold">E-Bridge</h1>
            <p className="text-sm text-gray-500">School Admin Panel</p>
          </div>

          {!showForgotPassword ? (
            <>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-500 mb-8">
                Sign in to access your admin dashboard
              </p>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6 bg-base-200 p-4 rounded-lg shadow-md"
                noValidate
              >
                {/* Email Input */}
                <div className="relative">
                  <FormField
                    type="email"
                    label="Email Address"
                    placeholder="Enter your email"
                    errorMessage={errors.email?.message}
                    name="email"
                    register={register}
                  ></FormField>
                </div>

                {/* Password Input */}
                <div className="relative">
                  <FormField
                    type={showPassword ? "text" : "password"}
                    label="Password"
                    placeholder="Enter your password"
                    errorMessage={errors.password?.message}
                    name="password"
                    register={register}
                  >
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-800"
                    >
                      {showPassword ? (
                        <FaEyeSlash size={18} />
                      ) : (
                        <FaEye size={18} />
                      )}
                    </button>
                  </FormField>
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                  <button
                    type="button"
                    onClick={toggleForgotPassword}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  shape="secondary"
                  pending={pending}
                  className="w-full"
                >
                  Sign In
                </Button>
              </form>

              {/* Footer */}
              <p className="text-center text-sm text-gray-500 mt-8">
                © {new Date().getFullYear()} E-Bridge School Management System
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Reset Password
              </h2>
              <p className="text-gray-500 mb-8">
                Enter your email address and we'll send you a link to reset your
                password
              </p>

              <form
                onSubmit={handleForgotPasswordSubmit(onForgotPasswordSubmit)}
                className="space-y-6 bg-base-200 p-4 rounded-lg shadow-md"
                noValidate
              >
                {/* Email Input */}
                <div className="relative">
                  <FormField
                    type="email"
                    label="Email Address"
                    placeholder="Enter your email"
                    errorMessage={forgotPasswordErrors.email?.message}
                    name="email"
                    register={registerForgotPassword}
                  ></FormField>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  {/* Reset Password Button */}
                  <Button
                    type="submit"
                    shape="info"
                    pending={forgotPasswordPending}
                    className="w-full sm:w-1/2"
                  >
                    Send Reset Link
                  </Button>

                  {/* Back to Login Button */}
                  <Button
                    type="button"
                    shape="info"
                    onClick={toggleForgotPassword}
                    className="w-full sm:w-1/2"
                  >
                    Back to Login
                  </Button>
                </div>
              </form>

              {/* Footer */}
              <p className="text-center text-sm text-gray-500 mt-8">
                © {new Date().getFullYear()} E-Bridge School Management System
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
