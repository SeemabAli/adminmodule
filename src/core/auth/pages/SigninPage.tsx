import { notify } from "@/lib/notify";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInUserSchema, type SignInUserData } from "../schema/auth.schema";
import { useState } from "react";
import { signInUser } from "../services/auth.service";
import { useDispatch } from "react-redux";
import { authActions } from "../auth.slice";
import { FormField } from "@/common/components/ui/form/FormField";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Button } from "@/common/components/ui/Button";

import logo from "@/assets/logo.png";

export const SigninPage = () => {
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

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const onSubmit: SubmitHandler<SignInUserData> = async function (data) {
    try {
      const userAuthData = await signInUser(data);
      dispatch(authActions.setAuth(userAuthData));
      notify.success("Sign in successful");
      await navigate("/");
    } catch (error) {
      if (error instanceof Error) {
        notify.error(error.message);
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[rgba(0,0,0,0.5)]">
      <div className="card w-full max-w-md bg-base-200 shadow-2xl rounded-xl p-8 mx-4">
        {/* Logo & Branding */}
        <div className="flex flex-col items-center mb-4">
          <img
            src={logo}
            alt="MB&CO Logo"
            className="h-16 w-16 rounded-full shadow-xl"
          />
          <h1 className="text-2xl font-bold mt-3">MB&CO</h1>
        </div>

        <h2 className="text-xl font-semibold text-center">Welcome Back</h2>
        <p className="text-sm text-base-content text-center mb-4">
          Sign in to continue
        </p>

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {/* Email Input */}
          <div className="form-control">
            <FormField
              type="email"
              label="Email"
              placeholder="Enter your email"
              errorMessage={errors.email?.message}
              name="email"
              register={register}
            />
          </div>

          {/* Password Input with Toggle (Inside FormField) */}
          <div className="form-control">
            <FormField
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              register={register}
              label="Password"
              name="password"
              errorMessage={errors.password?.message}
            >
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-1 flex items-center text-gray-500 hover:text-gray-800"
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </FormField>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            shape="primary"
            pending={pending}
            className="w-full py-2 relative right-2 text-lg font-semibold"
          >
            Login
          </Button>
        </form>
      </div>
    </div>
  );
};
