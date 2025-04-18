import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { NavLink, useParams } from "react-router";
import { notify } from "@/lib/notify";
import { Button } from "@/common/components/ui/Button";
import { logger } from "@/lib/logger";
import { handleErrorNotification } from "@/utils/exceptions";
import axios from "axios";

const UpdateClassPage = () => {
  const { classID } = useParams();
  const [formData, setFormData] = useState({
    className: "",
    section: "",
    thresholdStudents: "",
    fee: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const requestData = {
          userName: localStorage.getItem("username"),
          sessionKey: localStorage.getItem("sessionKey"),
          classID: classID,
        };

        const response = await axios.post(
          "http://192.168.100.14/EBridge/api/TssEBridge/GetClassByID",
          requestData,
        );

        if (response.data.valid) {
          setFormData({
            className: response.data.data.className,
            section: response.data.data.section,
            thresholdStudents: response.data.data.thresholdStudents,
            fee: response.data.data.fee,
          });
        } else {
          notify.error(response.data.message ?? "Failed to load class data.");
        }
      } catch (error) {
        logger.error(error);
        handleErrorNotification(error, "Class Data");
      } finally {
        setLoading(false);
      }
    };

    void fetchClassData();
  }, [classID]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const requestData = {
        userName: localStorage.getItem("username"),
        sessionKey: localStorage.getItem("sessionKey"),
        organizationID: localStorage.getItem("organizationID"),
        branchID: parseInt(localStorage.getItem("branchID") ?? "0"),
        classID: classID,
        ...formData,
      };

      const response = await axios.post(
        "http://192.168.100.14/EBridge/api/TssEBridge/UpdateClassByBranchAdmin",
        requestData,
      );

      if (response.data.valid) {
        notify.success("Class successfully updated.");
      } else {
        notify.error(response.data.message ?? "Failed to update class.");
      }
    } catch (error) {
      logger.error(error);
      handleErrorNotification(error, "Class Update");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p>Loading class data...</p>;
  }

  return (
    <div>
      <div className="flex mb-8">
        <NavLink
          to="/class"
          className="p-2 w-32 text-center bg-[#0f243f] text-white rounded font-bold px-4"
        >
          Back
        </NavLink>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Class Name</label>
            <input
              type="text"
              name="className"
              value={formData.className}
              onChange={handleChange}
              required
              placeholder="e.g., Grade 1"
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Section</label>
            <input
              type="text"
              name="section"
              value={formData.section}
              onChange={handleChange}
              required
              placeholder="e.g., A or B"
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Maximum Students
            </label>
            <input
              type="number"
              name="thresholdStudents"
              value={formData.thresholdStudents}
              onChange={handleChange}
              required
              min="1"
              placeholder="e.g., 30"
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Fee (in PKR)
            </label>
            <input
              type="number"
              name="fee"
              value={formData.fee}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="e.g., 5000.00"
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mt-6">
            <Button
              type="submit"
              shape="info"
              pending={submitting}
              className="w-full bg-[#0f243f] text-white py-3 px-6 rounded-md"
            >
              {submitting ? "Updating Class..." : "Update Class"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateClassPage;
