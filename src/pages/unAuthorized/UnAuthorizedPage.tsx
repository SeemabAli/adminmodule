import { Button } from "@/common/components/ui/Button";
import { useNavigate } from "react-router";
import { FiLock, FiArrowLeft } from "react-icons/fi";

export const UnauthorizedPage = () => {
  const navigate = useNavigate();

  async function goBack() {
    console.log("Go back");
    await navigate(-1);
  }

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-5">
      <div className="max-w-md w-full bg-base-200 shadow-lg rounded-lg overflow-hidden">
        <div className="bg-error text-white p-6 flex flex-col items-center">
          <div className="h-24 w-24 rounded-full bg-black bg-opacity-20 flex items-center justify-center mb-4">
            <FiLock size={50} />
          </div>
          <h1 className="text-3xl font-bold">Access Denied</h1>
        </div>

        <div className="p-8 text-center">
          <p className="text-lg mb-6">
            You do not have the necessary permissions to access the requested
            page.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              shape="primary"
              onClick={goBack}
              type="button"
              className="flex items-center justify-center gap-2"
            >
              <FiArrowLeft size={18} />
              Go Back
            </Button>
          </div>
        </div>

        <div className="bg-base-300 p-4 text-center text-sm text-base-content/60">
          If you believe this is an error, please contact your administrator
        </div>
      </div>
    </div>
  );
};
