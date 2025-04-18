import { useState } from 'react';

const GroupedExamList = ({ exams, setExams, onUpdateExam }) => {
    // Group exams by ExamName
    const groupedExams = exams.reduce((acc, exam) => {
        if (!acc[exam.ExamName]) {
            acc[exam.ExamName] = [];
        }
        acc[exam.ExamName].push(exam);
        return acc;
    }, {});

    const handleFieldChange = (examID, field, value) => {
        const updatedExams = exams.map((exam) => {
            if (exam.ExamID === examID) {
                return { ...exam, [field]: value };
            }
            return exam;
        });
        setExams(updatedExams);
    };

    // Render the grouped exams
    return (
        <div className="exam-list bg-white py-3 rounded-lg shadow-md mb-12">
            {Object.keys(groupedExams).length > 0 ? (
                <div className="space-y-6">
                    {Object.entries(groupedExams).map(([examName, exams]) => (
                        <div key={examName} className="p-4 border border-gray-200 rounded-md shadow-sm">
                            <div>
                                <div className="font-semibold text-center text-gray-700 mb-4 flex justify-between">
                                    <span className="text-base ps-4 datesheet-title">{
                                        examName.split(" ").map((w,i)=>{
                                           return w[0].toUpperCase()+w.slice(1,w.length) 
                                        }).join(" ")
                                        // examName[0].toUpperCase()+examName.slice(1,examName.length)
                                    } Datesheet</span>
                                </div>
                                {/* Render table of exam details */}
                                <table className="w-full border-collapse overflow-hidden">
                                    <thead className="bg-[#0f243f] text-white rounded-x">
                                        <tr>
                                            <th className="text-left py-3 px-4 rounded-tl">Class</th>
                                            <th className="text-left py-3 px-4">Section</th>
                                            <th className="text-left py-3 px-4">Subject</th>
                                            <th className="text-left py-3 px-4">Start Date</th>
                                            <th className="text-left py-3 px-4">Duration (mins)</th>
                                            <th className="text-left py-3 px-4">Total Marks</th>
                                            <th className="text-left py-3 px-4">Passing Marks</th>
                                            <th className="text-left py-3 px-4">Syllabus</th>
                                            <th className="text-left py-3 px-4 rounded-tr">Action</th>

                                        </tr>
                                    </thead>
                                    <tbody className='bg-gray-200 rounded-x'>
                                        {exams.map((exam, index) => (
                                            <tr
                                                key={exam.ExamID}
                                                className={ 'border-b border-gray-300'}
                                            >
                                                <td
                                                    // contentEditable="true"
                                                    className={`py-3 px-4 outline-none rounded`}
                                                    onBlur={(e) => handleFieldChange(exam.ExamID, 'ClassName', e.target.innerText)}
                                                >
                                                    {exam.ClassName}
                                                </td>
                                                <td
                                                    // contentEditable="true"
                                                    className="py-3 px-4 outline-none"
                                                    onBlur={(e) => handleFieldChange(exam.ExamID, 'Section', e.target.innerText)}
                                                >
                                                    {exam.Section}
                                                </td>
                                                <td
                                                    // contentEditable="true"
                                                    className="py-3 px-4 outline-none"
                                                    onBlur={(e) => handleFieldChange(exam.ExamID, 'SubjectName', e.target.innerText)}
                                                >
                                                    {exam.SubjectName}
                                                </td>
                                                <td
                                                    contentEditable="true"
                                                    className="py-3 px-4 outline-none"
                                                    onBlur={(e) => handleFieldChange(exam.ExamID, 'StartDate', e.target.innerText)}
                                                >
                                                    {new Date(exam?.StartDate+"z")?.toISOString().replaceAll("T"," ").replaceAll("Z","").split(".")[0]}
                                                </td>
                                                <td
                                                    contentEditable="true"
                                                    className="py-3 px-4 outline-none"
                                                    onBlur={(e) => handleFieldChange(exam.ExamID, 'DurationMinutes', e.target.innerText)}
                                                >
                                                    {exam.DurationMinutes}
                                                </td>
                                                <td
                                                    contentEditable="true"
                                                    className="py-3 px-4 outline-none"
                                                    onBlur={(e) => handleFieldChange(exam.ExamID, 'TotalMarks', e.target.innerText)}
                                                >
                                                    {exam.TotalMarks}
                                                </td>
                                                <td
                                                    contentEditable="true"
                                                    className="py-3 px-4 outline-none"
                                                    onBlur={(e) => handleFieldChange(exam.ExamID, 'PassingMarks', e.target.innerText)}
                                                >
                                                    {exam.PassingMarks}
                                                </td>
                                                <td
                                                    contentEditable="true"
                                                    className="py-3 px-4 outline-none"
                                                    onBlur={(e) => handleFieldChange(exam.ExamID, 'Syllabus', e.target.innerText)}
                                                >
                                                    {exam.Syllabus || 'N/A'}
                                                </td>
                                                <td
                                                    className="py-3 px-4 h-fit"
                                                >
                                                    {/* Button to update exam */}
                                                    <button
                                                        className="bg-[#0f243f]/70 text-white px-4 py-2 text-xs rounded-md shadow hover:bg-[#0f243f]/75 transition"
                                                        onClick={() => {
                                                            // Prepare the schedule data for the update
                                                            const schedules = [
                                                                {
                                                                scheduleID: exam.ScheduleID,  // Assuming each exam has a unique ScheduleID
                                                                classID: exam.ClassID,
                                                                subjectID: exam.SubjectID,
                                                                subjectName: exam.SubjectName,
                                                                startDate: exam.StartDate,
                                                                durationMinutes: exam.DurationMinutes,
                                                                totalMarks: exam.TotalMarks,
                                                                passingMarks: exam.PassingMarks,
                                                                syllabus: exam.Syllabus,
                                                            }];

                                                            // Call the onUpdateExam handler from the parent component
                                                            onUpdateExam(exams[index].ExamID, examName, schedules);  // Assuming all exams have the same ExamID within a group
                                                        }}
                                                    >
                                                        Update
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-600">No exams available.</p>
            )}
        </div>
    );
};

export default GroupedExamList;