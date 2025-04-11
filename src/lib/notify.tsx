import { toast } from "react-hot-toast";

export const notify = {
  success: (message = "Operation successful") =>
    toast.success(message, {
      id: `success-toast-${Date.now()}`, // Unique ID to prevent conflicts
      duration: 4000, // Increased visibility time
      className: "bg-base-200 text-base-content border-l-4 border-success",
      style: {
        padding: "16px",
        paddingLeft: "12px",
      },
      iconTheme: {
        primary: "hsl(var(--su))",
        secondary: "hsl(var(--b2))",
      },
      icon: "✓",
    }),

  error: (message = "Something went wrong") =>
    toast.error(message, {
      id: `error-toast-${Date.now()}`, // Unique ID to prevent conflicts
      duration: 4000, // Increased visibility time
      className: "bg-base-200 text-base-content border-l-4 border-error",
      style: {
        padding: "16px",
        paddingLeft: "12px",
      },
      iconTheme: {
        primary: "hsl(var(--er))",
        secondary: "hsl(var(--b2))",
      },
      icon: "✕",
    }),

  confirmDelete: (callback: () => void) => {
    const toastId = toast(
      (t) => (
        <div className="bg-base-200 text-base-content p-4 rounded-lg shadow-md">
          <p className="font-semibold text-center">
            Are you sure you want to delete?
          </p>
          <div className="flex justify-center gap-3 mt-3">
            <button
              className="btn btn-sm btn-error"
              onClick={() => {
                // Dismiss toast first to prevent race conditions
                toast.dismiss(t.id);

                // Small timeout to ensure UI updates before callback
                setTimeout(() => {
                  callback(); // Execute delete function
                }, 100);
              }}
            >
              Delete
            </button>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => {
                toast.dismiss(t.id);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        id: `confirm-delete-${Date.now()}`, // Unique ID to prevent conflicts
        duration: 8000, // Longer duration for decision-making
        className: "p-0",
        style: {
          background: "transparent",
          boxShadow: "none",
        },
      },
    );

    // Backup dismissal to prevent stuck toasts
    return toastId;
  },
};

// Add a cleanup function to handle any potentially stuck toasts
export const cleanupToasts = () => {
  toast.dismiss();
};
