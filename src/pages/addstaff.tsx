import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { notify } from "@/lib/notify";
import { FormField } from "@/common/components/ui/form/FormField";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/common/components/ui/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { handleErrorNotification } from "@/utils/exceptions";
import axios from "axios";

// Define schema for education details
const educationSchema = z.object({
  degree: z.string().optional(),
  institution: z.string().optional(),
  passingYear: z.string().optional(),
  grade: z.string().optional(),
});

// Define schema for staff data
const staffSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  fatherName: z.string().min(1, "Father's name is required"),
  pictureURL: z.string().url("Invalid URL").optional().or(z.literal("")),
  cnic: z.string().min(1, "CNIC is required"),
  dob: z.string().min(1, "Date of birth is required"),
  address: z.string().min(1, "Address is required"),
  email: z.string().email("Invalid email address"),
  whatsapp: z.string().optional(),
  contact: z.string().min(1, "Contact number is required"),
  designation: z.string().min(1, "Designation is required"),
  salary: z.string().min(1, "Salary is required"),
  employmentType: z.enum(["Monthly", "Hourly"]),
  joinDate: z.string().min(1, "Join date is required"),
  educationDetails: z.array(educationSchema),
  rfid: z.string().min(1, "RFID is required"),
});

// Type definition based on schema
type StaffData = z.infer<typeof staffSchema>;

const AddStaffPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    control,
  } = useForm({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: "",
      fatherName: "",
      pictureURL: "",
      cnic: "",
      dob: "",
      address: "",
      email: "",
      whatsapp: "",
      contact: "",
      designation: "",
      salary: "",
      employmentType: "Monthly",
      joinDate: "",
      educationDetails: [
        { degree: "", institution: "", passingYear: "", grade: "" },
      ],
      rfid: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "educationDetails",
  });

  const insertStaff = async (staffData: StaffData) => {
    try {
      setLoading(true);

      const requestData = {
        userName: localStorage.getItem("username"),
        sessionKey: localStorage.getItem("sessionKey"),
        branchID: localStorage.getItem("branchID"),
        organizationID: localStorage.getItem("organizationID"),
        ...staffData,
      };

      const response = await axios.post(
        "http://192.168.100.14/EBridge/api/TssEBridge/InsertStaffInfo",
        requestData,
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      const result = response.data;

      if (result.valid) {
        notify.success(result.message ?? "Staff successfully added.");
        void navigate(-1);
      } else {
        notify.error(result.message ?? "Failed to add staff.");
      }
    } catch (error: unknown) {
      logger.error(error);
      handleErrorNotification(error, "Staff");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex mb-8">
        <NavLink
          to="/staff"
          className="p-2 w-32 text-center bg-[#0f243f] text-white rounded font-bold px-4"
        >
          Back
        </NavLink>
      </div>

      <div className="p-6">
        <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
          <form>
            {/* Personal Info Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-[#0f243f] mb-4">
                Personal Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  placeholder="John Doe"
                  name="name"
                  label="Full Name"
                  register={register}
                  errorMessage={errors.name?.message}
                />
                <FormField
                  placeholder="David Doe"
                  name="fatherName"
                  label="Father's Name"
                  register={register}
                  errorMessage={errors.fatherName?.message}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  placeholder="http://example.com/picture.jpg"
                  name="pictureURL"
                  label="Picture URL"
                  register={register}
                  errorMessage={errors.pictureURL?.message}
                  type="url"
                />
                <FormField
                  placeholder="12345-6789012-3"
                  name="cnic"
                  label="CNIC"
                  register={register}
                  errorMessage={errors.cnic?.message}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  name="dob"
                  label="Date of Birth"
                  register={register}
                  errorMessage={errors.dob?.message}
                  type="date"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <textarea
                    {...register("address")}
                    className="mt-1 p-3 w-full border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="123 Main St, City"
                  />
                  {errors.address && (
                    <span className="text-sm text-red-500">
                      {errors.address.message}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Info Section */}
            <div className="space-y-6 mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  placeholder="johndoe@example.com"
                  name="email"
                  label="Email"
                  register={register}
                  errorMessage={errors.email?.message}
                  type="email"
                />
                <FormField
                  placeholder="1234567890"
                  name="whatsapp"
                  label="WhatsApp Number"
                  register={register}
                  errorMessage={errors.whatsapp?.message}
                  type="tel"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  placeholder="0987654321"
                  name="contact"
                  label="Contact Number"
                  register={register}
                  errorMessage={errors.contact?.message}
                  type="tel"
                />
                <FormField
                  placeholder="Manager"
                  name="designation"
                  label="Designation"
                  register={register}
                  errorMessage={errors.designation?.message}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  placeholder="50000"
                  name="salary"
                  label="Salary"
                  register={register}
                  errorMessage={errors.salary?.message}
                  type="number"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Employment Type
                  </label>
                  <select
                    {...register("employmentType")}
                    className="mt-1 p-3 w-full border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Hourly">Hourly</option>
                  </select>
                  {errors.employmentType && (
                    <span className="text-sm text-red-500">
                      {errors.employmentType.message}
                    </span>
                  )}
                </div>
              </div>

              <FormField
                name="joinDate"
                label="Join Date"
                register={register}
                errorMessage={errors.joinDate?.message}
                type="date"
              />
            </div>

            {/* Education Section */}
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-[#0f243f] mb-4">
                Education Details
              </h3>

              {fields.map((field, index) => (
                <div key={field.id} className="space-y-4 mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <FormField
                      placeholder="MBA"
                      name={`educationDetails.${index}.degree`}
                      label="Degree"
                      register={register}
                      errorMessage={
                        errors.educationDetails?.[index]?.degree?.message
                      }
                    />
                    <FormField
                      placeholder="University of City"
                      name={`educationDetails.${index}.institution`}
                      label="Institution"
                      register={register}
                      errorMessage={
                        errors.educationDetails?.[index]?.institution?.message
                      }
                    />
                    <FormField
                      placeholder="2015"
                      name={`educationDetails.${index}.passingYear`}
                      label="Passing Year"
                      register={register}
                      errorMessage={
                        errors.educationDetails?.[index]?.passingYear?.message
                      }
                      type="number"
                    />
                    <FormField
                      placeholder="A"
                      name={`educationDetails.${index}.grade`}
                      label="Grade"
                      register={register}
                      errorMessage={
                        errors.educationDetails?.[index]?.grade?.message
                      }
                    />
                  </div>

                  {/* Buttons to add or remove education entry */}
                  <div className="flex justify-end mt-4">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          remove(index);
                        }}
                        className="px-4 py-2 text-sm text-red-700 bg-red-100 rounded-md hover:bg-red-200"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  append({
                    degree: "",
                    institution: "",
                    passingYear: "",
                    grade: "",
                  });
                }}
                className="px-4 py-2 text-sm text-green-700 bg-green-100 rounded-md hover:bg-green-200"
              >
                Add Education
              </button>
            </div>

            <FormField
              placeholder="RFID"
              name="rfid"
              label="RFID"
              register={register}
              errorMessage={errors.rfid?.message}
              className="mt-4"
            />

            <div className="mt-6 text-center">
              <Button
                onClick={handleSubmit(insertStaff)}
                shape="info"
                pending={isSubmitting ?? loading}
                className="px-6 py-3 bg-[#0f243f] text-white font-semibold rounded-md shadow-lg hover:bg-[#0f243f]"
              >
                Submit
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStaffPage;
