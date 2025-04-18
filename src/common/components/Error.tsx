import { useNavigate } from "react-router";
import {
  ExclamationTriangleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

type ErrorModalProps = {
  message?: string;
};

export const ErrorModal = ({ message }: ErrorModalProps) => {
  const navigate = useNavigate();

  // Extract error information if passed via state
  const errorMessage =
    message ??
    "Something went wrong. We couldn't find what you were looking for.";

  const handleGoBack = () => {
    void navigate(-1); // Navigate back one step in history
  };

  return (
    <div className="min-h-screen bg-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-700 shadow-2xl border border-gray-600 rounded-lg">
        <div className="items-center text-center p-8">
          <div className="text-red-400 animate-pulse">
            <ExclamationTriangleIcon className="h-32 w-32 mx-auto" />
          </div>
          <h1 className="text-5xl font-bold text-white mt-4">Oops!</h1>
          <div className="my-4 border-t border-gray-600"></div>
          <p className="text-gray-300 text-lg mb-6">{errorMessage}</p>
          <div className="flex justify-center">
            <button
              onClick={handleGoBack}
              className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <ArrowLeftIcon className="h-6 w-6 mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
