import React, { useState, useEffect, useCallback } from "react";
import { NavLink } from "react-router";
import {
  Dialog,
  Transition,
  TransitionChild,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { Fragment } from "react";
import axios from "axios";
import { notify } from "@/lib/notify";
import { logger } from "@/lib/logger";
import { handleErrorNotification } from "@/utils/exceptions";
import { Button } from "@/common/components/ui/Button";

interface Staff {
  staffID: number;
  name: string;
}

interface Class {
  classID: number;
  className: string;
  section: string;
}

interface Subject {
  subjectID: number;
  subjectName: string;
  subjectType: string;
  staffID: number;
}

interface SubjectDetails {
  subjectID: number;
  subjectName: string;
  subjectType: string;
  subjectDetails: string;
  className: string;
  section: string;
  branchName: string;
}

function SubjectListingPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSubjectDetails, setSelectedSubjectDetails] =
    useState<SubjectDetails | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Helper function to get common request data
  const getRequestData = useCallback(
    () => ({
      userName: localStorage.getItem("username"),
      sessionKey: localStorage.getItem("sessionKey"),
      organizationID: localStorage.getItem("organizationID") ?? "4",
      branchID: localStorage.getItem("branchID") ?? 3,
    }),
    [],
  );

  // Fetch Staff
  const fetchStaff = useCallback(async () => {
    try {
      const response = await axios.post(
        "http://192.168.100.14/EBridge/api/TssEBridge/GetStaffByBranchAdmin",
        getRequestData(),
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      const result = response.data;
      if (result.valid) {
        setStaff(result.data);
      } else {
        notify.error(result.message ?? "Failed to retrieve staff data.");
      }
    } catch (error) {
      logger.error(error);
      handleErrorNotification(error, "Staff");
    }
  }, [getRequestData]);

  // Fetch Classes
  const fetchClasses = useCallback(async () => {
    try {
      const response = await axios.post(
        "http://192.168.100.14/EBridge/api/TssEBridge/GetClassListingByBranchAdmin",
        getRequestData(),
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      const result = response.data;
      if (result.valid) {
        setClasses(result.data);
        if (result.data.length > 0) setSelectedClass(result.data[0]);
      } else {
        notify.error(result.message ?? "Failed to retrieve classes.");
      }
    } catch (error) {
      logger.error(error);
      handleErrorNotification(error, "Classes");
    }
  }, [getRequestData]);

  // Fetch Subjects
  const fetchSubjects = useCallback(async () => {
    if (!selectedClass) return;
    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://192.168.100.14/EBridge/api/TssEBridge/SubjectsListing",
        {
          ...getRequestData(),
          className: selectedClass.className,
          section: selectedClass.section,
        },
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      const result = response.data;
      if (result.valid) {
        setSubjects(result.data);
      } else {
        notify.error(result.message ?? "Failed to retrieve subjects.");
      }
    } catch (error) {
      logger.error(error);
      handleErrorNotification(error, "Subjects");
    } finally {
      setIsLoading(false);
    }
  }, [getRequestData, selectedClass]);

  // Fetch Single Subject Details
  const fetchSingleSubject = async (subjectID: number) => {
    setModalLoading(true);

    try {
      const response = await axios.post(
        "http://192.168.100.14/EBridge/api/TssEBridge/ViewSingleSubject",
        {
          userName: localStorage.getItem("username"),
          sessionKey: localStorage.getItem("sessionKey"),
          subjectID,
        },
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      const result = response.data;
      if (result.valid) {
        setSelectedSubjectDetails(result.subject);
      } else {
        notify.error(result.message ?? "Failed to retrieve subject details.");
      }
    } catch (error) {
      logger.error(error);
      handleErrorNotification(error, "Subject Details");
    } finally {
      setModalLoading(false);
    }
  };

  // Update Subject Teacher
  const updateSubjectTeacher = async (subjectID: number, staffID: number) => {
    try {
      const response = await axios.post(
        "http://192.168.100.14/EBridge/api/TssEBridge/UpdateSubjectTeacher",
        {
          userName: localStorage.getItem("username"),
          sessionKey: localStorage.getItem("sessionKey"),
          subjectID,
          staffID,
        },
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      const result = response.data;
      if (result.valid) {
        notify.success("Subject Teacher updated successfully.");
        void fetchSubjects();
      } else {
        notify.error(result.message ?? "Failed to update subject teacher.");
      }
    } catch (error) {
      logger.error(error);
      handleErrorNotification(error, "Subject Teacher Update");
    }
  };

  useEffect(() => {
    void fetchStaff();
    void fetchClasses();
  }, [fetchStaff, fetchClasses]);

  useEffect(() => {
    if (selectedClass) {
      void fetchSubjects();
    }
  }, [selectedClass, fetchSubjects]);

  const openModal = (subjectID: number) => {
    setIsOpen(true);
    void fetchSingleSubject(subjectID);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedSubjectDetails(null);
  };

  return (
    <div className="p-6">
      <div className="flex mb-8">
        <NavLink to="/add-subject" className="btn btn-primary w-32">
          Add Subject
        </NavLink>
      </div>

      {/* Class Selection */}
      <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Select Class</label>
          {classes.length > 0 ? (
            <select
              value={selectedClass?.classID ?? ""}
              onChange={(e) => {
                const foundClass = classes.find(
                  (cls) => cls.classID === parseInt(e.target.value),
                );
                if (foundClass) {
                  setSelectedClass(foundClass);
                }
              }}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              {classes.map((cls) => (
                <option key={cls.classID} value={cls.classID}>
                  {cls.className} - Section {cls.section}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-gray-500">No classes available.</p>
          )}
        </div>

        {/* Subject Listing */}
        <div className="relative overflow-x-auto">
          {isLoading ? (
            <p className="text-center text-gray-500 py-4">
              Loading subjects...
            </p>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-base-300 text-base-content">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    #
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Label
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Teacher
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject, index) => (
                  <tr
                    key={subject.subjectID}
                    className={`border-b ${
                      index % 2 === 0 ? "bg-base-100" : "bg-base-50"
                    }`}
                  >
                    <td className="px-6 py-4 font-medium whitespace-nowrap">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">{subject.subjectName}</td>
                    <td className="px-6 py-4">{subject.subjectType}</td>
                    <td className="px-6 py-4">
                      <select
                        className="p-2 border rounded-lg"
                        value={
                          staff.find((s) => s.staffID === subject.staffID)
                            ?.staffID ?? -1
                        }
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (value > 0) {
                            void updateSubjectTeacher(subject.subjectID, value);
                          }
                        }}
                      >
                        <option value={-1}>Select Teacher</option>
                        {staff.map((s) => (
                          <option key={s.staffID} value={s.staffID}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <NavLink
                        to={`/update-subject/${subject?.subjectID}`}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </NavLink>
                      <button
                        onClick={() => {
                          openModal(subject.subjectID);
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {subjects.length === 0 && !isLoading && (
            <p className="text-center text-gray-500 py-4">No subjects found.</p>
          )}
        </div>
      </div>

      {/* Modal */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <DialogTitle
                    as="h2"
                    className="text-xl font-bold text-center leading-6 mb-4"
                  >
                    Subject Details
                  </DialogTitle>

                  {modalLoading ? (
                    <p className="text-center py-4">Loading...</p>
                  ) : selectedSubjectDetails ? (
                    <div className="space-y-3">
                      <p>
                        <strong>Name:</strong>{" "}
                        {selectedSubjectDetails.subjectName}
                      </p>
                      <p>
                        <strong>Type:</strong>{" "}
                        {selectedSubjectDetails.subjectType}
                      </p>
                      <p>
                        <strong>Details:</strong>{" "}
                        {selectedSubjectDetails.subjectDetails}
                      </p>
                      <p>
                        <strong>Class:</strong>{" "}
                        {selectedSubjectDetails.className}
                      </p>
                      <p>
                        <strong>Section:</strong>{" "}
                        {selectedSubjectDetails.section}
                      </p>
                      <p>
                        <strong>Branch:</strong>{" "}
                        {selectedSubjectDetails.branchName}
                      </p>
                    </div>
                  ) : (
                    <p className="text-red-500 text-center py-4">
                      Failed to load subject details.
                    </p>
                  )}

                  <div className="mt-6 flex justify-between">
                    <NavLink
                      to={`/update-subject/${selectedSubjectDetails?.subjectID}`}
                      className="btn btn-info"
                    >
                      Edit
                    </NavLink>
                    <Button onClick={closeModal} shape="neutral">
                      Close
                    </Button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

export default SubjectListingPage;
