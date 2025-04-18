/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { notify } from "@/lib/notify";
import { logger } from "@/lib/logger";
import { handleErrorNotification } from "@/utils/exceptions";
import { Button } from "@/common/components/ui/Button";
import axios from "axios";

// Interfaces
interface AuthData {
  userName: string | null;
  sessionKey: string | null;
  organizationID: string | null;
  branchID: number;
}

interface DiaryEntry {
  diaryDate: string;
  teacherName: string;
}

interface DiaryDetail {
  diaryId: number;
  subjectID: number;
  subjectName: string;
  teacherName: string;
  diaryText: string;
  remarkText: string;
  isAdditionalremarks: boolean;
}

interface AdditionalRemark {
  studentName: string;
  remarks: string;
}

// API URLs as constants
const DIARY_DATES_API_URL =
  "http://192.168.100.14/EBridge/api/TssEBridge/GetDiaryDatesAndClassTeacher";
const DIARY_DETAILS_API_URL =
  "http://192.168.100.14/EBridge/api/TssEBridge/GetDiaryDetailsAndRemarks";
const CLASSES_API_URL =
  "http://192.168.100.14/EBridge/api/TssEBridge/GetClassesBasic";
const SECTIONS_API_URL =
  "http://192.168.100.14/EBridge/api/TssEBridge/GetSectionViaClass";
const ADDITIONAL_REMARKS_API_URL =
  "http://192.168.100.14/EBridge/api/TssEBridge/GetAdditionalRemarks";

const DiaryPage = () => {
  // Authentication data
  const getAuthData = (): AuthData => ({
    userName: localStorage.getItem("username"),
    sessionKey: localStorage.getItem("sessionKey"),
    organizationID: localStorage.getItem("organizationID"),
    branchID: parseInt(localStorage.getItem("branchID") ?? "0"),
  });

  // State declarations
  const [classes, setClasses] = useState<{ className: string }[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [diaryDates, setDiaryDates] = useState<DiaryEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [diaryDetails, setDiaryDetails] = useState<DiaryDetail[]>([]);
  const [diaryNote, setDiaryNote] = useState("");
  const [additionalRemarks, setAdditionalRemarks] = useState<
    AdditionalRemark[]
  >([]);
  const [teacherName, setTeacherName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState({
    classes: true,
    sections: false,
    diaryDates: false,
    diaryDetails: false,
    additionalRemarks: false,
  });

  // Fetch classes on component mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading((prev) => ({ ...prev, classes: true }));
        const response = await axios.post(CLASSES_API_URL, getAuthData());

        if (response.data.valid) {
          setClasses(response.data.data);
        } else {
          notify.error(response.data.message ?? "Failed to fetch classes");
        }
      } catch (error) {
        logger.error(error);
        handleErrorNotification(error, "Classes");
      } finally {
        setLoading((prev) => ({ ...prev, classes: false }));
      }
    };

    void fetchClasses();
  }, []);

  // Fetch sections when class filter changes
  useEffect(() => {
    const fetchSections = async () => {
      if (!classFilter) {
        setSections([]);
        return;
      }

      try {
        setLoading((prev) => ({ ...prev, sections: true }));
        const response = await axios.post(SECTIONS_API_URL, {
          ...getAuthData(),
          className: classFilter,
        });

        if (response.data.valid) {
          setSections(response.data.data.map((item: any) => item.section));
        } else {
          notify.error(response.data.message ?? "Failed to fetch sections");
        }
      } catch (error) {
        logger.error(error);
        handleErrorNotification(error, "Sections");
      } finally {
        setLoading((prev) => ({ ...prev, sections: false }));
      }
    };

    void fetchSections();
  }, [classFilter]);

  // Fetch diary dates when class or section filter changes
  useEffect(() => {
    const fetchDiaryDates = async () => {
      try {
        setLoading((prev) => ({ ...prev, diaryDates: true }));
        const response = await axios.post(DIARY_DATES_API_URL, {
          ...getAuthData(),
          className: classFilter,
          section: sectionFilter,
        });

        if (response.data.valid) {
          if (response.data.diaryEntries.length <= 0) {
            setDiaryDates([]);
            setSelectedDate(null);
          } else {
            setDiaryDates(response.data.diaryEntries);
            setTeacherName(response.data.diaryEntries[0].teacherName);
          }
        } else {
          setDiaryDates([]);
          setSelectedDate(null);
          notify.error(response.data.message ?? "Failed to fetch diary dates");
        }
      } catch (error) {
        logger.error(error);
        handleErrorNotification(error, "Diary Dates");
      } finally {
        setLoading((prev) => ({ ...prev, diaryDates: false }));
      }
    };

    if (classFilter && sectionFilter) {
      void fetchDiaryDates();
    }
  }, [classFilter, sectionFilter]);

  // Fetch diary details when selected date changes
  useEffect(() => {
    if (!selectedDate) return;

    const fetchDiaryDetails = async () => {
      try {
        setLoading((prev) => ({ ...prev, diaryDetails: true }));
        const response = await axios.post(DIARY_DETAILS_API_URL, {
          ...getAuthData(),
          className: classFilter,
          section: sectionFilter,
          diaryDate: selectedDate.toLocaleDateString(),
        });

        if (response.data.valid) {
          setDiaryDetails(response.data.diaryDetails);
          setDiaryNote(response.data.diaryAdditionalMarks);
          setAdditionalRemarks(response.data.additionalRemarks ?? []);
        } else {
          notify.error(
            response.data.message ?? "Failed to fetch diary details",
          );
          setSelectedDate(null);
        }
      } catch (error) {
        logger.error(error);
        handleErrorNotification(error, "Diary Details");
      } finally {
        setLoading((prev) => ({ ...prev, diaryDetails: false }));
      }
    };

    void fetchDiaryDetails();
  }, [selectedDate, classFilter, sectionFilter]);

  // Handle opening the modal with additional remarks
  const openModal = async (subjectID: any, diaryID: any) => {
    try {
      setLoading((prev) => ({ ...prev, additionalRemarks: true }));
      const response = await axios.post(ADDITIONAL_REMARKS_API_URL, {
        userName: localStorage.getItem("username"),
        sessionKey: localStorage.getItem("sessionKey"),
        subjectID,
        diaryID,
      });

      if (response.data.valid) {
        setAdditionalRemarks(response.data.data);
      } else {
        notify.error(
          response.data.message ?? "Failed to fetch additional remarks",
        );
        setAdditionalRemarks([]);
      }
    } catch (error) {
      logger.error(error);
      handleErrorNotification(error, "Additional Remarks");
    } finally {
      setLoading((prev) => ({ ...prev, additionalRemarks: false }));
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Loading state for the initial classes fetch
  if (loading.classes) {
    return <p>Loading classes...</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Class
          </label>
          <select
            id="classFilter"
            value={classFilter}
            onChange={(e) => {
              setClassFilter(e.target.value);
            }}
            className="mt-1 p-2 w-full border rounded-md shadow-sm"
          >
            <option value="">Select Class</option>
            {classes.map((cls, index) => (
              <option key={index} value={cls.className}>
                {cls.className}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Section
          </label>
          <select
            id="sectionFilter"
            value={sectionFilter}
            onChange={(e) => {
              setSectionFilter(e.target.value);
            }}
            className="mt-1 p-2 w-full border rounded-md shadow-sm"
            disabled={loading.sections ?? sections.length === 0}
          >
            <option value="">Select Section</option>
            {sections.map((section, index) => (
              <option key={index} value={section}>
                {section}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Select a Date
          </label>
          <select
            id="dateFilter"
            value={selectedDate ? selectedDate.toISOString() : ""}
            onChange={(e) => {
              if (e.target.value) {
                const selected = diaryDates.find(
                  (entry) =>
                    new Date(entry.diaryDate).toISOString() === e.target.value,
                );
                setSelectedDate(selected ? new Date(selected.diaryDate) : null);
              } else {
                setSelectedDate(null);
              }
            }}
            className="mt-1 p-2 w-full border rounded-md shadow-sm"
            disabled={loading.diaryDates ?? diaryDates.length === 0}
          >
            <option value="">Select a Date</option>
            {diaryDates?.map((entry, index) => (
              <option
                key={index}
                value={new Date(entry.diaryDate).toISOString()}
              >
                {new Date(entry.diaryDate).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading.diaryDetails && <p>Loading diary details...</p>}

      <div
        className={
          selectedDate
            ? `px-6 py-4 shadow-md rounded-lg border bg-white mt-4`
            : ""
        }
      >
        {selectedDate && !loading.diaryDetails && (
          <div>
            <div className="flex justify-between items-center border-b pb-3 mb-1">
              <div>
                <span className="block text-xs text-gray-500 uppercase font-medium">
                  Class Teacher
                </span>
                <h3 className="text-2xl font-semibold text-gray-800">
                  {teacherName}
                </h3>
              </div>
              <span className="text-gray-600 text-sm">
                {selectedDate.toDateString()}
              </span>
            </div>
            <div className="divide-y divide-gray-300">
              {diaryDetails.map((detail) => (
                <div key={detail.diaryId} className="py-3">
                  <div>
                    <span className="font-semibold">Subject:</span>{" "}
                    {detail.subjectName}
                  </div>
                  <div>
                    <span className="font-semibold">Subject Teacher:</span>{" "}
                    {detail.teacherName}
                  </div>
                  <div>{detail.diaryText ?? <i>No diary entry</i>}</div>
                  {detail.remarkText && (
                    <div className="text-gray-600 italic text-sm pt-1">
                      <strong>Remarks:</strong>{" "}
                      {detail.remarkText ?? <i>No remark</i>}
                    </div>
                  )}
                  <div className="flex w-full justify-end">
                    {detail.isAdditionalremarks && (
                      <Button
                        className="text-sky-400 border-none text-xs"
                        onClick={() =>
                          openModal(detail.subjectID, detail.diaryId)
                        }
                        shape="primary"
                      >
                        Show Additional Remarks
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        {selectedDate && !loading.diaryDetails && (
          <div className="flex justify-between items-center border-t pt-3 mb-1">
            <div>
              <h3 className="text-sm italic text-gray-600">
                <span className="font-semibold">Diary Notes:</span>
                {diaryNote ? (
                  <span className="ps-1 italic text-gray-400">{diaryNote}</span>
                ) : (
                  <span className="ps-1 italic text-gray-400 text-sm">
                    {" "}
                    (N/A){" "}
                  </span>
                )}
              </h3>
            </div>
          </div>
        )}
      </div>

      {/* Modal for displaying additional remarks */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Additional Remarks</h3>
              <button onClick={closeModal} className="text-gray-500">
                &times;
              </button>
            </div>

            <div className="mb-4">
              {loading.additionalRemarks ? (
                <p>Loading remarks...</p>
              ) : additionalRemarks.length === 0 ? (
                <p>No remarks available.</p>
              ) : (
                <div className="divide-y divide-gray-200">
                  {additionalRemarks.map((remark, index) => (
                    <div key={index} className="py-3">
                      <p>
                        <strong className="text-gray-600">Student Name:</strong>{" "}
                        {remark.studentName}
                      </p>
                      <strong className="text-gray-600 text-xs italic">
                        Remarks:
                      </strong>{" "}
                      <p className="text-xs italic">{remark.remarks}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button onClick={closeModal} shape="secondary">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiaryPage;
