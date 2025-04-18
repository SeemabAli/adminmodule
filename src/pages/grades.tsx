/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { useNavigate } from "react-router";

type Exam = {
  id: number;
  exam: string;
  class: string;
  subject: string;
  conductedAt: string;
};

const GradesPage = () => {
  const navigate = useNavigate();

  const [exams, setExams] = useState<Exam[]>([
    {
      id: 1,
      exam: "MidTerm 1",
      class: "5th",
      subject: "111",
      conductedAt: "12/30/2025",
    },
    {
      id: 2,
      exam: "MidTerm 2",
      class: "6th",
      subject: "222",
      conductedAt: "12/30/2025",
    },
    {
      id: 3,
      exam: "MidTerm 3",
      class: "7th",
      subject: "333",
      conductedAt: "12/30/2025",
    },
    {
      id: 4,
      exam: "MidTerm 4",
      class: "8th",
      subject: "444",
      conductedAt: "12/30/2025",
    },
  ]);

  return (
    <div className="overflow-x-auto p-4">
      <table className="w-full text-sm text-left text-gray-600 border border-gray-200">
        <thead className="text-xs text-white uppercase text-center bg-[#0f243f]">
          <tr>
            <th scope="col" className="px-6 py-3">
              #
            </th>
            <th scope="col" className="px-6 py-3">
              Exam Name
            </th>
            <th scope="col" className="px-6 py-3">
              Class
            </th>
            <th scope="col" className="px-6 py-3">
              Subject
            </th>
            <th scope="col" className="px-6 py-3">
              Conducted At
            </th>
          </tr>
        </thead>
        <tbody>
          {exams.map((exam) => (
            <tr
              key={exam.id}
              onClick={() => navigate(`/exams-detail/${exam.id}`)}
              className="bg-white border-b hover:bg-gray-100 cursor-pointer text-center"
            >
              <td className="px-6 py-4">{exam.id}</td>
              <td className="px-6 py-4">{exam.exam}</td>
              <td className="px-6 py-4">{exam.class}</td>
              <td className="px-6 py-4">{exam.subject}</td>
              <td className="px-6 py-4">{exam.conductedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GradesPage;
