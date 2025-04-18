import { useState, useEffect } from "react";
import { NavLink, useParams } from "react-router";
import { notify } from "@/lib/notify";
import { FormField, SelectField } from "@/common/components/ui/form/FormField";
import { useForm } from "react-hook-form";
import { Button } from "@/common/components/ui/Button";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { handleErrorNotification } from "@/utils/exceptions";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";

// Define schema for subject data
const subjectSchema = z.object({
  subjectName: z.string().min(1, "Subject name is required"),
  subjectType: z.string().min(1, "Subject type is required"),
  subjectDetails: z.string().min(1, "Subject details are required"),
});

// Type definition based on schema
type SubjectData = z.infer<typeof subjectSchema>;

function EditSubjectPage(): React.JSX.Element {
  const { subjectID } = useParams<{ subjectID: string }>();
  const [loading, setLoading] = useState(false);

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    setValue,
  } = useForm({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      subjectName: "",
      subjectType: "",
      subjectDetails: "",
    },
  });

  // Fetch subject details on component mount
  useEffect(() => {
    const fetchSubjectDetails = async (): Promise<void> => {
      if (!subjectID) return;

      setLoading(true);
      try {
        const response = await axios.post(
          "http://192.168.100.14/EBridge/api/TssEBridge/ViewSingleSubject",
          {
            userName: localStorage.getItem("username"),
            sessionKey: localStorage.getItem("sessionKey"),
            subjectID: parseInt(subjectID),
          },
        );

        const result = response.data;

        if (result.valid && result.subject) {
          setValue("subjectName", result.subject.subjectName);
          setValue("subjectType", result.subject.subjectType);
          setValue("subjectDetails", result.subject.subjectDetails);
        } else {
          notify.error(result.message ?? "Failed to fetch subject details.");
        }
      } catch (error: unknown) {
        logger.error(error);
        handleErrorNotification(error, "Subject");
      } finally {
        setLoading(false);
      }
    };

    void fetchSubjectDetails();
  }, [subjectID, setValue]);

  const updateSubject = async (data: SubjectData): Promise<void> => {
    if (!subjectID) return;

    setLoading(true);
    try {
      const response = await axios.post(
        "http://192.168.100.14/EBridge/api/TssEBridge/UpdateSubject",
        {
          userName: localStorage.getItem("username"),
          sessionKey: localStorage.getItem("sessionKey"),
          subjectID: parseInt(subjectID),
          ...data,
        },
      );

      const result = response.data;

      if (result.valid) {
        notify.success("Subject updated successfully.");
      } else {
        notify.error(result.message ?? "Failed to update subject.");
      }
    } catch (error: unknown) {
      logger.error(error);
      handleErrorNotification(error, "Subject");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">Edit Subject</h1>
        <NavLink
          to="/subject"
          className="p-2 w-32 text-center bg-[#0f243f] text-white rounded font-bold px-4"
        >
          Back
        </NavLink>
      </div>

      <div className="bg-base-200 p-4 rounded-lg shadow-md">
        <form onSubmit={handleSubmit(updateSubject)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              placeholder="Enter subject name"
              name="subjectName"
              label="Subject Name"
              register={register}
              errorMessage={errors.subjectName?.message}
            />

            <SelectField
              name="subjectType"
              label="Subject Type"
              register={register}
              errorMessage={errors.subjectType?.message}
              options={[
                { value: "", label: "Select Type" },
                { value: "Core", label: "Core" },
                { value: "Optional", label: "Optional" },
              ]}
            />
          </div>

          <FormField
            placeholder="Enter subject details"
            name="subjectDetails"
            label="Subject Details"
            register={register}
            errorMessage={errors.subjectDetails?.message}
          />

          <div className="flex justify-end">
            <Button
              onClick={handleSubmit(updateSubject)}
              shape="info"
              pending={isSubmitting || loading}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditSubjectPage;
