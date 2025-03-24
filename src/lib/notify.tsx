import { toast } from "react-hot-toast";

export const notify = {
  success: (message = "Operation successful") =>
    toast.success(message, {
      id: "success-toast",
      duration: 3000, // 4 seconds duration
    }),

  error: (message = "Something went wrong") =>
    toast.error(message, {
      id: "error-toast",
      duration: 3000, // 4 seconds duration
    }),

  confirmDelete: (callback: () => void) => {
    toast(
      (t) => (
        <div className="text-center">
          <p className="font-semibold">Are you sure you want to delete?</p>
          <div className="flex justify-center gap-2 mt-2">
            <button
              className="btn btn-xs btn-error"
              onClick={() => {
                callback(); // Execute delete function
                toast.dismiss(t.id);
              }}
            >
              Delete
            </button>
            <button
              className="btn btn-xs btn-secondary"
              onClick={() => {
                toast.dismiss(t.id);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 3000 }, // Changed from 6000 to 4000 (4 seconds)
    );
  },
};
