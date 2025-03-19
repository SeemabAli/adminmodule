import { useLocation, useNavigate } from "react-router";

export const ErrorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract error information if passed via state
  const errorMessage =
    location.state?.errorMessage ??
    "Something went wrong. We couldn't find what you were looking for.";

  const handleGoBack = () => {
    void navigate(-1); // Navigate back one step in history
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-300 to-base-100 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl border border-base-200">
        <div className="card-body items-center text-center p-8">
          <div className="text-error animate-pulse">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-32 w-32"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-5xl font-bold text-base-content">Oops!</h1>
          <div className="divider"></div>
          <p className="text-base-content/80 text-lg">{errorMessage}</p>
          <div className="card-actions">
            <button
              onClick={handleGoBack}
              className="btn btn-info btn-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
