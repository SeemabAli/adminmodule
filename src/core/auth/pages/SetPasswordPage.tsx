import { notify } from "@/lib/notify";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { setPasswordSchema, type setPasswordData } from "../schema/auth.schema";
import { useState } from "react";
import { setPassword as setPassword } from "../services/auth.service";
import { FormField } from "@/common/components/ui/form/FormField";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Button } from "@/common/components/ui/Button";

import logo from "@/assets/logo.png";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store/store";

export const SetPasswordPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: pending },
  } = useForm<setPasswordData>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const navigate = useNavigate();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = (field: "new" | "confirm") => {
    if (field === "new") {
      setShowNewPassword((prev) => !prev);
    } else {
      setShowConfirmPassword((prev) => !prev);
    }
  };

  const onSubmit: SubmitHandler<setPasswordData> = async (data) => {
    try {
      console.log("AccessToken", accessToken);
      await setPassword(data.newPassword, accessToken);
      notify.success("Password changed successfully");

      // Update auth state if needed or just redirect
      void navigate("/");
    } catch (error) {
      if (error instanceof Error) {
        notify.error(error.message);
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[rgba(0,0,0,0.1)]">
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

        <h2 className="text-xl font-semibold text-center">Change Password</h2>
        <p className="text-sm text-base-content text-center mb-4">
          Please set your permanent password
        </p>

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {/* New Password Input */}
          <div className="form-control">
            <FormField
              type={showNewPassword ? "text" : "password"}
              label="New Password"
              placeholder="Create a strong password"
              errorMessage={errors.newPassword?.message}
              name="newPassword"
              register={register}
            >
              <button
                type="button"
                onClick={() => {
                  togglePasswordVisibility("new");
                }}
                className="absolute inset-y-0 right-1 flex items-center text-gray-500 hover:text-gray-800"
              >
                {showNewPassword ? (
                  <FaEyeSlash size={20} />
                ) : (
                  <FaEye size={20} />
                )}
              </button>
            </FormField>
          </div>

          {/* Confirm New Password Input */}
          <div className="form-control">
            <FormField
              type={showConfirmPassword ? "text" : "password"}
              label="Confirm Password"
              placeholder="Confirm your new password"
              errorMessage={errors.confirmPassword?.message}
              name="confirmPassword"
              register={register}
            >
              <button
                type="button"
                onClick={() => {
                  togglePasswordVisibility("confirm");
                }}
                className="absolute inset-y-0 right-1 flex items-center text-gray-500 hover:text-gray-800"
              >
                {showConfirmPassword ? (
                  <FaEyeSlash size={20} />
                ) : (
                  <FaEye size={20} />
                )}
              </button>
            </FormField>
          </div>

          {/* Password Requirements */}
          <div className="text-xs text-gray-500">
            <p>Password must contain:</p>
            <ul className="list-disc pl-4 mt-1">
              <li>At least 8 characters</li>
              <li>At least one uppercase letter</li>
              <li>At least one lowercase letter</li>
              <li>At least one number</li>
              <li>At least one special character</li>
            </ul>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            shape="primary"
            pending={pending}
            className="w-full py-2 relative right-2 text-lg font-semibold"
          >
            Set Password
          </Button>
        </form>
      </div>
    </div>
  );
};
