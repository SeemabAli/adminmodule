import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { notify } from "@/lib/notify";
import { logger } from "@/lib/logger";
import { handleErrorNotification } from "@/utils/exceptions";
import Creatable from "react-select/creatable";
import GroupedExamList from "@/common/components/examsList.jsx";
import { Button } from "@/common/components/ui/Button";

// Type definitions
interface ClassData {
  classID: string;
  className: string;
}

interface SectionData {
  section: string;
  classID: string;
}

interface SubjectData {
  subjectID: string;
  subjectName: string;
}

interface ExamOption {
  value: string;
  label: string;
}

interface Schedule {
  classID: string;
  subjectID: string;
  startDate: string;
  durationMinutes: string;
}

interface ExamRecord {
  ExamID: string;
  ExamName: string;
  schedules: Schedule[];
}

// Define schema for exam data
const examSchema = z.object({
  examName: z
    .object({
      value: z.string().min(1, "Exam name is required"),
      label: z.string().min(1),
    })
    .nullable(),
  examClass: z.string().min(1, "Class is required"),
  examSection: z.string().min(1, "Section is required"),
  subjectName: z.string().min(1, "Subject is required"),
  subjectDate: z.string().min(1, "Date is required"),
  subjectDuration: z.string().min(1, "Duration is required"),
  examNotes: z.string().optional(),
});

type ExamData = z.infer<typeof examSchema>;

const ExamManagement = () => {
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [classID, setClassID] = useState("");
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [examOptions, setExamOptions] = useState<ExamOption[]>([
    { value: "MidTerm", label: "MidTerm" },
    { value: "Final", label: "Final" },
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<ExamData>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      examName: null,
      examClass: "",
      examSection: "",
      subjectName: "",
      subjectDate: "",
      subjectDuration: "",
      examNotes: "",
    },
  });

  // Watch form values
  const watchedExamClass = watch("examClass");
  const watchedExamSection = watch("examSection");

  // Fetch classes from the API
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.post(
          "http://192.168.100.14/EBridge/api/TssEBridge/GetClassesBasic",
          {
            userName: localStorage.getItem("username"),
            sessionKey: localStorage.getItem("sessionKey"),
            organizationID: localStorage.getItem("organizationID"),
            branchID: localStorage.getItem("branchID"),
          },
        );

        if (response.data.valid) {
          setClasses(response.data.data);
        }
      } catch (error) {
        logger.error(error);
        handleErrorNotification(error, "Classes");
      }
    };
    void fetchClasses();
  }, []);

  // Fetch sections based on the selected class
  useEffect(() => {
    if (watchedExamClass) {
      const fetchSections = async () => {
        try {
          const response = await axios.post(
            "http://192.168.100.14/EBridge/api/TssEBridge/GetSectionViaClass",
            {
              userName: localStorage.getItem("username"),
              sessionKey: localStorage.getItem("sessionKey"),
              organizationID: localStorage.getItem("organizationID"),
              branchID: localStorage.getItem("branchID"),
              className: watchedExamClass,
            },
          );

          if (response.data.valid) {
            setSections(response.data.data);
          }
        } catch (error) {
          logger.error(error);
          handleErrorNotification(error, "Sections");
        }
      };
      void fetchSections();
    }
  }, [watchedExamClass]);

  // Fetch subjects based on class and section
  useEffect(() => {
    if (watchedExamClass && watchedExamSection) {
      const fetchSubjects = async () => {
        try {
          const response = await axios.post(
            "http://192.168.100.14/EBridge/api/TssEBridge/SubjectsListing",
            {
              userName: localStorage.getItem("username"),
              sessionKey: localStorage.getItem("sessionKey"),
              branchID: localStorage.getItem("branchID"),
              className: watchedExamClass,
              section: watchedExamSection,
            },
          );

          if (response.data.valid) {
            setSubjects(response.data.data);
            const selectedSection = sections.find(
              (s) => s.section === watchedExamSection,
            );
            if (selectedSection) {
              setClassID(selectedSection.classID);
            }
          }
        } catch (error) {
          logger.error(error);
          handleErrorNotification(error, "Subjects");
        }
      };
      void fetchSubjects();
    }
  }, [watchedExamClass, watchedExamSection, sections]);

  // Fetch exam list
  const fetchExamList = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        "http://192.168.100.14/EBridge/api/TssEBridge/ExamList",
        {
          userName: localStorage.getItem("username"),
          sessionKey: localStorage.getItem("sessionKey"),
        },
      );

      if (response.data.valid) {
        setExams(response.data.exams);
        const options: ExamOption[] = [
          ...new Set(response.data.exams.map((e: ExamRecord) => e?.ExamName)),
        ]
          .filter(Boolean)
          .map((examName) => ({
            value: examName as string,
            label: examName as string,
          }));
        setExamOptions(options);
      }
    } catch (error) {
      logger.error(error);
      handleErrorNotification(error, "Exams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchExamList();
  }, []);

  const handleCreateExamGroup = async (data: ExamData) => {
    try {
      setLoading(true);

      if (!data.examName) {
        notify.error("Please select or create an exam name");
        return;
      }

      // Convert local date to GMT
      const gmtDate = new Date(data.subjectDate).toISOString();

      const examData = {
        userName: localStorage.getItem("username"),
        sessionKey: localStorage.getItem("sessionKey"),
        examName: data.examName.label,
        schedules: [
          {
            classID: classID,
            subjectID: data.subjectName,
            startDate: gmtDate,
            durationMinutes: data.subjectDuration,
          },
        ],
      };

      const response = await axios.post(
        "http://192.168.100.14/EBridge/api/TssEBridge/CreateExam",
        examData,
      );

      if (response.data.valid) {
        notify.success("Exam created successfully!");
        void fetchExamList();
        reset();
      } else {
        notify.error(response.data.message ?? "Failed to create exam");
      }
    } catch (error) {
      logger.error(error);
      handleErrorNotification(error, "Exam creation");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateExam = async (
    examID: string,
    examName: string,
    schedules: Schedule[],
  ) => {
    try {
      setLoading(true);
      const response = await axios.post(
        "http://192.168.100.14/EBridge/api/TssEBridge/UpdateExam",
        {
          userName: localStorage.getItem("username"),
          sessionKey: localStorage.getItem("sessionKey"),
          examID,
          examName,
          examSchedules: schedules,
        },
      );

      if (response.data.valid) {
        notify.success("Exam updated successfully!");
        void fetchExamList();
      } else {
        notify.error(response.data.message ?? "Failed to update exam");
      }
    } catch (error) {
      logger.error(error);
      handleErrorNotification(error, "Exam update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-[#0f243f]">
      <h2 className="text-3xl text-[#0f243f]/90 text-center mb-6 font-bold">
        Student Exam Management
      </h2>

      <div className="bg-white px-4 py-6 rounded-lg border mb-8">
        <form onSubmit={handleSubmit(handleCreateExamGroup)}>
          {/* Exam Name Selection with Creatable */}
          <div className="mb-4">
            <label
              htmlFor="examName"
              className="block text-sm font-medium text-gray-700"
            >
              Exam Name
            </label>
            <Creatable
              id="examName"
              options={examOptions}
              value={watch("examName")}
              onChange={(selected) => {
                setValue("examName", selected);
              }}
              placeholder="Select or Create Exam"
              className="mt-1"
              classNamePrefix="select"
            />
            {errors.examName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.examName.message}
              </p>
            )}
          </div>

          {/* Class Selection */}
          <div className="mb-4">
            <label
              htmlFor="examClass"
              className="block text-sm font-medium text-gray-700"
            >
              Class
            </label>
            <select
              id="examClass"
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("examClass")}
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls.classID} value={cls.className}>
                  {cls.className}
                </option>
              ))}
            </select>
            {errors.examClass && (
              <p className="mt-1 text-sm text-red-600">
                {errors.examClass.message}
              </p>
            )}
          </div>

          {/* Section Selection */}
          <div className="mb-4">
            <label
              htmlFor="examSection"
              className="block text-sm font-medium text-gray-700"
            >
              Section
            </label>
            <select
              id="examSection"
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("examSection")}
            >
              <option value="">Select Section</option>
              {sections.map((section) => (
                <option key={section.section} value={section.section}>
                  {section.section}
                </option>
              ))}
            </select>
            {errors.examSection && (
              <p className="mt-1 text-sm text-red-600">
                {errors.examSection.message}
              </p>
            )}
          </div>

          {/* Subject Selection */}
          <div className="mb-4">
            <label
              htmlFor="subjectName"
              className="block text-sm font-medium text-gray-700"
            >
              Subject
            </label>
            <select
              id="subjectName"
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("subjectName")}
            >
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
                <option key={subject.subjectID} value={subject.subjectID}>
                  {subject.subjectName}
                </option>
              ))}
            </select>
            {errors.subjectName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.subjectName.message}
              </p>
            )}
          </div>

          {/* Date/Time */}
          <div className="mb-4">
            <label
              htmlFor="subjectDate"
              className="block text-sm font-medium text-gray-700"
            >
              Date/Time
            </label>
            <input
              type="datetime-local"
              id="subjectDate"
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("subjectDate")}
            />
            {errors.subjectDate && (
              <p className="mt-1 text-sm text-red-600">
                {errors.subjectDate.message}
              </p>
            )}
          </div>

          {/* Duration */}
          <div className="mb-4">
            <label
              htmlFor="subjectDuration"
              className="block text-sm font-medium text-gray-700"
            >
              Duration (minutes)
            </label>
            <input
              type="number"
              id="subjectDuration"
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("subjectDuration")}
            />
            {errors.subjectDuration && (
              <p className="mt-1 text-sm text-red-600">
                {errors.subjectDuration.message}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label
              htmlFor="examNotes"
              className="block text-sm font-medium text-gray-700"
            >
              Notes
            </label>
            <textarea
              id="examNotes"
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("examNotes")}
            />
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <Button
              type="submit"
              shape="info"
              pending={isSubmitting || loading}
              className="w-full"
            >
              Create Exam
            </Button>
          </div>
        </form>
      </div>

      <GroupedExamList
        exams={exams}
        setExams={setExams}
        onUpdateExam={handleUpdateExam}
      />
    </div>
  );
};

export default ExamManagement;
