import { useState } from "react";
import { useNavigate } from "react-router";
import { notify } from "@/lib/notify";
import { logger } from "@/lib/logger";
import { handleErrorNotification } from "@/utils/exceptions";

// Type definitions
type Subject = {
  name: string;
  totalMarks: number;
  passingMarks: number;
};

type Student = {
  id: number;
  name: string;
  grades: Record<string, number>;
};

type GradeData = {
  subjects: Subject[];
  students: Student[];
  conductedDate: string;
};

const GradeSheet = () => {
  const navigate = useNavigate();

  const [gradeData, setGradeData] = useState<GradeData>({
    subjects: [
      { name: "Math", totalMarks: 100, passingMarks: 40 },
      { name: "Science", totalMarks: 100, passingMarks: 45 },
      { name: "English", totalMarks: 100, passingMarks: 50 },
    ],
    students: [
      {
        id: 1,
        name: "John Doe",
        grades: { Math: 85, Science: 90, English: 88 },
      },
      {
        id: 2,
        name: "Jane Smith",
        grades: { Math: 92, Science: 89, English: 94 },
      },
      {
        id: 3,
        name: "Michael Brown",
        grades: { Math: 78, Science: 85, English: 80 },
      },
      {
        id: 4,
        name: "John Doe 2",
        grades: { Math: 85, Science: 90, English: 88 },
      },
      {
        id: 5,
        name: "Jane Smith 2",
        grades: { Math: 92, Science: 89, English: 94 },
      },
      {
        id: 6,
        name: "Michael Brown 2",
        grades: { Math: 78, Science: 85, English: 80 },
      },
    ],
    conductedDate: "2024-12-26",
  });

  const calculateTotals = (grades: Record<string, number>) => {
    let total = 0;
    let totalMaxMarks = 0;
    let passed = true;

    gradeData.subjects.forEach((subject) => {
      const marks = grades[subject.name];
      total += marks ?? 0;
      totalMaxMarks += subject.totalMarks;
      if ((marks ?? 0) < subject.passingMarks) {
        passed = false;
      }
    });

    const percentage = (total / totalMaxMarks) * 100;
    return { total, percentage: percentage.toFixed(2), passed };
  };

  const calculateOverview = () => {
    let passedCount = 0;
    let failedCount = 0;
    let totalPercentage = 0;

    gradeData.students.forEach((student) => {
      const { percentage, passed } = calculateTotals(student.grades);
      if (passed) passedCount++;
      else failedCount++;
      totalPercentage += parseFloat(percentage);
    });

    const averagePercentage = (
      totalPercentage / gradeData.students.length
    ).toFixed(2);
    const overallResult = failedCount > 0 ? "Fail" : "Pass";

    return {
      totalStudents: gradeData.students.length,
      passedCount,
      failedCount,
      averagePercentage,
      overallResult,
    };
  };

  const handleGradeChange = (
    studentId: number,
    subjectName: string,
    value: string,
  ) => {
    const updatedStudents = gradeData.students.map((student) =>
      student.id === studentId
        ? {
            ...student,
            grades: { ...student.grades, [subjectName]: Number(value) },
          }
        : student,
    );
    setGradeData((prev) => ({ ...prev, students: updatedStudents }));
  };

  const handleUpdateClick = () => {
    try {
      notify.success("Grades Updated Successfully!");
    } catch (error: unknown) {
      logger.error(error);
      handleErrorNotification(error, "GradeSheet Update");
    }
  };

  const {
    totalStudents,
    passedCount,
    failedCount,
    averagePercentage,
    overallResult,
  } = calculateOverview();

  return (
    <div className="bg-white border rounded-lg p-6">
      {/* Header Section */}
      <div className="mb-4 flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <svg
            onClick={() => navigate(-1)}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="size-5 text-gray-600 cursor-pointer"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
            />
          </svg>
          <p className="text-gray-600">
            <strong>Conducted Date:</strong> {gradeData.conductedDate}
          </p>
        </div>

        <button
          className="bg-[#0f243f] text-white px-4 py-2 rounded-lg hover:bg-[#0f243f]/80"
          onClick={handleUpdateClick}
        >
          Update
        </button>
      </div>

      {/* Class Overview */}
      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
        <h2 className="text-lg font-bold mb-2">Class Overview</h2>
        <p>Total Students: {totalStudents}</p>
        <p>Passed: {passedCount}</p>
        <p>Failed: {failedCount}</p>
        <p>Average Percentage: {averagePercentage}%</p>
        <p>
          Overall Result:{" "}
          <span
            className={
              overallResult === "Pass" ? "text-green-600" : "text-red-600"
            }
          >
            {overallResult}
          </span>
        </p>
      </div>

      {/* Grade Sheet Table */}
      <table className="w-full text-sm text-left border text-gray-600">
        <thead className="text-gray-700 uppercase bg-gray-200">
          <tr>
            <th className="px-4 py-2">Student</th>
            {gradeData.subjects.map((subject) => (
              <th key={subject.name} className="px-4 py-2">
                <span>{subject.name}</span>
                <br />
                <small>
                  Total: {subject.totalMarks}, Pass: {subject.passingMarks}
                </small>
              </th>
            ))}
            <th className="px-4 py-2">Total</th>
            <th className="px-4 py-2">Percentage</th>
            <th className="px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {gradeData.students.map((student) => {
            const { total, percentage, passed } = calculateTotals(
              student.grades,
            );
            return (
              <tr
                key={student.id}
                className="bg-white border-b hover:bg-gray-50"
              >
                <td className="px-4 py-2 font-medium text-gray-900">
                  {student.name}
                </td>
                {gradeData.subjects.map((subject) => (
                  <td key={subject.name} className="px-4 py-2">
                    <input
                      type="number"
                      value={student.grades[subject.name]}
                      onChange={(e) => {
                        handleGradeChange(
                          student.id,
                          subject.name,
                          e.target.value,
                        );
                      }}
                      className="w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </td>
                ))}
                <td className="px-4 py-2 font-bold">{total}</td>
                <td className="px-4 py-2">{percentage}%</td>
                <td
                  className={`px-4 py-2 font-bold ${
                    passed ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {passed ? "Pass" : "Fail"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default GradeSheet;
