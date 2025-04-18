import { useState } from "react";
import { NavLink } from "react-router";
import { notify } from "@/lib/notify";
import { FormField } from "@/common/components/ui/form/FormField";
import { useForm } from "react-hook-form";
import { Button } from "@/common/components/ui/Button";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { handleErrorNotification } from "@/utils/exceptions";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";

// Define schema for class data
const classSchema = z.object({
  className: z.string().min(1, "Class name is required"),
  section: z.string().min(1, "Section is required"),
  thresholdStudents: z.string().min(1, "Maximum students is required"),
  fee: z.string().min(1, "Fee is required"),
});

// Type definition based on schema
type ClassData = z.infer<typeof classSchema>;

const InsertClassPage = () => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
  } = useForm({
    resolver: zodResolver(classSchema),
    defaultValues: {
      className: "",
      section: "",
      thresholdStudents: "",
      fee: "",
    },
  });

  const insertClass = async (classData: ClassData) => {
    let attempts = 0;

    const tryInsert = async () => {
      attempts++;
      setLoading(true);

      const requestData = {
        userName: localStorage.getItem("username"),
        sessionKey: localStorage.getItem("sessionKey"),
        organizationID: localStorage.getItem("organizationID") ?? "4",
        branchID: localStorage.getItem("branchID") ?? 3,
        ...classData,
      };

      try {
        const response = await axios.post(
          "http://192.168.100.14/EBridge/api/TssEBridge/InsertClassByBranchAdmin",
          requestData,
          {
            headers: { "Content-Type": "application/json" },
          },
        );

        const result = response.data;

        if (result.valid) {
          notify.success("Class successfully added.");
          reset();
        } else {
          notify.error(result.message ?? "Failed to add class.");
        }

        setLoading(false);
      } catch (error: unknown) {
        logger.error(error);
        handleErrorNotification(error, `Retrying... (Attempt ${attempts})`);
        // Retry after 5 seconds
        setTimeout(tryInsert, 5000);
      }
    };

    await tryInsert();
  };

  return (
    <div>
      <div className="flex mb-8">
        <NavLink to="/class" className="btn btn-primary w-32">
          Back
        </NavLink>
      </div>

      <div className="p-6">
        <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <FormField
              placeholder="e.g., Grade 1"
              name="className"
              label="Class Name"
              register={register}
              errorMessage={errors.className?.message}
            />
            <FormField
              placeholder="e.g., A or B"
              name="section"
              label="Section"
              register={register}
              errorMessage={errors.section?.message}
            />
            <FormField
              placeholder="e.g., 30"
              name="thresholdStudents"
              label="Maximum Students"
              register={register}
              errorMessage={errors.thresholdStudents?.message}
              type="number"
            />
            <FormField
              placeholder="e.g., 5000.00"
              name="fee"
              label="Fee (in PKR)"
              register={register}
              errorMessage={errors.fee?.message}
              type="number"
              step="0.01"
            />
          </div>

          <div className="mt-6">
            <Button
              onClick={handleSubmit(insertClass)}
              shape="info"
              pending={isSubmitting || loading}
              className="w-full"
            >
              Add Class
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsertClassPage;
