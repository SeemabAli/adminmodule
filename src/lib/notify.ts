import { toast } from "react-hot-toast";

export const notify = {
    success: (message = "Operation successful") =>
        toast.success(message, { id: "success-toast" }),

    error: (message = "Something went wrong") =>
        toast.error(message, { id: "error-toast" }),
};
