import { toast } from "react-hot-toast";

export const notify = {
    success: (message = "Operation successful") =>
        toast.success(message, { id: "success-toast" }),

    error: (message = "Something went wrong") =>
        toast.error(message, { id: "error-toast" }),

    confirmDelete: (callback: () => void) => {
        toast((t) => (
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
                        onClick={() => toast.dismiss(t.id)}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), { duration: 6000 });
    }
};
