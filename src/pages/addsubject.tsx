import { useState, useEffect } from "react";
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

interface ClassSection {
  classID: number;
  className: string;
  section: string;
}

const subjectSchema = z.object({
  subjectName: z.string().min(1, "Subject name is required"),
  subjectType: z.string().min(1, "Subject type is required"),
  subjectDetails: z.string().min(1, "Subject details are required"),
});

type SubjectData = z.infer<typeof subjectSchema>;

const AddSubjectPage = () => {
  const [loading, setLoading] = useState(false);
  const [classSections, setClassSections] = useState<ClassSection[]>([]);
  const [selectedSections, setSelectedSections] = useState<ClassSection[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
  } = useForm<SubjectData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      subjectName: "",
      subjectType: "",
      subjectDetails: "",
    },
  });

  useEffect(() => {
    const fetchClassSections = async () => {
      try {
        const requestData = {
          userName: localStorage.getItem("username"),
          sessionKey: localStorage.getItem("sessionKey"),
          organizationID: localStorage.getItem("organizationID"),
          branchID: parseInt(localStorage.getItem("branchID") ?? "0"),
        };

        const response = await axios.post(
          "http://192.168.100.14/EBridge/api/TssEBridge/GetClassListingByBranchAdmin",
          requestData,
        );

        if (response.data.valid) {
          setClassSections(response.data.data);
        } else {
          notify.error(
            response.data.message ?? "Failed to fetch class sections.",
          );
        }
      } catch (error) {
        logger.error(error);
        handleErrorNotification(error, "Class Sections");
      } finally {
        setLoadingClasses(false);
      }
    };

    void fetchClassSections();
  }, []);

  const handleSectionToggle = (classID: number) => {
    if (selectedSections.some((section) => section.classID === classID)) {
      setSelectedSections(
        selectedSections.filter((section) => section.classID !== classID),
      );
    } else {
      const selectedClass = classSections.find(
        (classItem) => classItem.classID === classID,
      );
      if (selectedClass) {
        setSelectedSections([...selectedSections, selectedClass]);
      }
    }
  };

  const insertSubject = async (data: SubjectData) => {
    try {
      setLoading(true);
      const requestData = {
        userName: localStorage.getItem("username"),
        sessionKey: localStorage.getItem("sessionKey"),
        branchID: parseInt(localStorage.getItem("branchID") ?? "0"),
        ...data,
        classSections: selectedSections.map((section) => ({
          className: section.className,
          section: section.section,
        })),
      };

      const response = await axios.post(
        "http://192.168.100.14/EBridge/api/TssEBridge/InsertSubjects",
        requestData,
      );

      if (response.data.valid) {
        notify.success("Subject added successfully.");
        reset();
        setSelectedSections([]);
      } else {
        notify.error(response.data.message ?? "Failed to add subject.");
      }
    } catch (error) {
      logger.error(error);
      handleErrorNotification(error, "Subject");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <div className="flex mb-8">
        <NavLink
          to={"/subject"}
          className="p-2 w-32 text-center bg-[#0f243f] text-white rounded font-bold px-4"
        >
          Back
        </NavLink>
      </div>

      <form onSubmit={handleSubmit(insertSubject)} className="">
        <FormField
          placeholder="Enter subject name"
          name="subjectName"
          label="Subject Name"
          register={register}
          errorMessage={errors.subjectName?.message}
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject Type
          </label>
          <select
            {...register("subjectType")}
            className="w-full p-2 border rounded-md shadow-sm"
          >
            <option value="">Select Type</option>
            <option value="Core">Core</option>
            <option value="Optional">Optional</option>
          </select>
          {errors.subjectType && (
            <p className="text-red-500 text-sm">{errors.subjectType.message}</p>
          )}
        </div>

        <FormField
          placeholder="Enter subject details"
          name="subjectDetails"
          label="Subject Details"
          register={register}
          errorMessage={errors.subjectDetails?.message}
        />

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Assign to Class Sections
          </h2>
          {loadingClasses ? (
            <p>Loading class sections...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classSections.map((section) => (
                <label
                  key={section.classID}
                  className="flex items-center space-x-3"
                >
                  <input
                    type="checkbox"
                    checked={selectedSections.some(
                      (s) => s.classID === section.classID,
                    )}
                    onChange={() => {
                      handleSectionToggle(section.classID);
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span>
                    {section.className} - {section.section}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            shape="info"
            pending={isSubmitting ?? loading}
            className="px-6 py-2 bg-[#0f243f] text-white rounded-md shadow"
          >
            {loading ? "Adding..." : "Add Subject"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddSubjectPage;
