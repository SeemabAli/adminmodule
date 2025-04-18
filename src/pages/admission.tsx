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

const studentSchema = z.object({
  bForm: z.string().min(1, "B-Form is required"),
  name: z.string().min(1, "Name is required"),
  fatherName: z.string().min(1, "Father Name is required"),
  gender: z.string().min(1, "Gender is required"),
  dob: z.string().min(1, "Date of Birth is required"),
  religion: z.string().min(1, "Religion is required"),
  relationship: z.string().min(1, "Relationship is required"),
  guardianName: z.string().min(1, "Guardian Name is required"),
  guardianId: z.string().min(1, "Guardian ID is required"),
  guardianEmail: z.string().email("Invalid email format"),
  guardianPhone: z.string().min(1, "Guardian Phone is required"),
  motherPhone: z.string(),
  whatsappNumber: z.string(),
  address: z.string().min(1, "Address is required"),
  feeMonthly: z.string().min(1, "Fee Monthly is required"),
  discountType: z.string(),
  currentMonthly: z.string(),
  transportRoute: z.string(),
  welcomeSMS: z.string(),
  createParentAccount: z.string(),
  generateAdmissionFee: z.string(),
  studentCode: z.string().min(1, "Student Code is required"),
  uidCode: z.string(),
  campus: z.string(),
  class: z.string().min(1, "Class is required"),
  section: z.string().min(1, "Section is required"),
  previousSchool: z.string(),
  admissionDate: z.string().min(1, "Admission Date is required"),
});

type StudentData = z.infer<typeof studentSchema>;

const StudentForm = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [sections, setSections] = useState<ClassSection[]>([]);
  const [photo, setPhoto] = useState<File | null>(null);
  const [slcDoc, setSlcDoc] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>(
    "https://via.placeholder.com/100",
  );

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    setValue,
    watch,
    reset,
  } = useForm<StudentData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      bForm: "",
      name: "",
      fatherName: "",
      gender: "",
      dob: "",
      religion: "",
      relationship: "Father",
      guardianName: "",
      guardianId: "",
      guardianEmail: "",
      guardianPhone: "",
      motherPhone: "",
      whatsappNumber: "",
      address: "",
      feeMonthly: "",
      discountType: "None",
      currentMonthly: "",
      transportRoute: "No",
      welcomeSMS: "No",
      createParentAccount: "No",
      generateAdmissionFee: "No",
      studentCode: "",
      uidCode: "",
      campus: "Main Campus",
      class: "",
      section: "",
      previousSchool: "",
      admissionDate: "",
    },
  });

  const selectedClass = watch("class");

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const requestData = {
          userName: localStorage.getItem("username"),
          sessionKey: localStorage.getItem("sessionKey"),
          organizationID: localStorage.getItem("organizationID"),
          branchID: localStorage.getItem("branchID"),
        };

        const response = await axios.post(
          "http://192.168.100.14/EBridge/api/TssEBridge/GetClassesBasic",
          requestData,
        );

        if (response.data.valid) {
          setClasses(response.data.data);
        } else {
          notify.error(response.data.message ?? "Failed to fetch classes");
        }
      } catch (error) {
        logger.error(error);
        handleErrorNotification(error, "Classes");
      }
    };

    void fetchClasses();
  }, []);

  useEffect(() => {
    if (!selectedClass) return;

    const fetchSections = async () => {
      try {
        const requestData = {
          userName: localStorage.getItem("username"),
          sessionKey: localStorage.getItem("sessionKey"),
          organizationID: localStorage.getItem("organizationID"),
          branchID: localStorage.getItem("branchID"),
          className: selectedClass,
        };

        const response = await axios.post(
          "http://192.168.100.14/EBridge/api/TssEBridge/GetSectionViaClass",
          requestData,
        );

        if (response.data.valid) {
          setSections(response.data.data);
        } else {
          notify.error(response.data.message ?? "Failed to fetch sections");
        }
      } catch (error) {
        logger.error(error);
        handleErrorNotification(error, "Sections");
      }
    };

    void fetchSections();
  }, [selectedClass]);

  const formatCNIC = (input: string): string => {
    return input
      .replace(/\D/g, "")
      .replace(
        /(\d{5})(\d{7})?(\d{1})?/,
        (_: string, p1: string, p2?: string, p3?: string) =>
          p1 + (p2 ? `-${p2}` : "") + (p3 ? `-${p3}` : ""),
      );
  };

  const handleCNICBlur = async (cnic: string) => {
    const cnicPattern = /^\d{5}-\d{7}-\d{1}$/;
    if (!cnicPattern.test(cnic)) {
      setErrorMessage("CNIC must be in the format XXXXX-XXXXXXX-X");
    } else {
      setErrorMessage("");
      await getGuardianByCNIC(cnic);
    }
  };

  const getGuardianByCNIC = async (cnic: string) => {
    try {
      const requestData = {
        userName: localStorage.getItem("username"),
        sessionKey: localStorage.getItem("sessionKey"),
        guardianIDCard: cnic,
      };

      const response = await axios.post(
        "http://192.168.100.14/EBridge/api/TssEBridge/GetGuardianByCNIC",
        requestData,
      );

      if (response.data.valid && response.data.guardianDetails) {
        const details = response.data.guardianDetails;
        setValue("relationship", details.Relationship);
        setValue("guardianName", details.GuardianName);
        setValue("guardianEmail", details.GuardianEmail);
        setValue("guardianPhone", details.GuardianPhone);
        setValue("motherPhone", details.MotherPhone);
        setValue("whatsappNumber", details.WhatsAppNumber);
        setValue("address", details.HomeAddress);
      }
    } catch (error) {
      logger.error(error);
      handleErrorNotification(error, "Guardian CNIC");
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files?.[0]) {
      setPhoto(files[0]);
      setPhotoPreview(URL.createObjectURL(files[0]));
    }
  };

  const handleSlcDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files?.[0]) {
      setSlcDoc(files[0]);
    }
  };

  const addStudent = async (data: StudentData) => {
    try {
      setLoading(true);
      const requestData = {
        userName: localStorage.getItem("username"),
        sessionKey: localStorage.getItem("sessionKey"),
        branchID: localStorage.getItem("branchID"),
        ...data,
        photo: photo?.name ?? "",
        slcDoc: slcDoc?.name ?? "",
      };

      const response = await axios.post(
        "http://192.168.100.14/EBridge/api/TssEBridge/AddStudent",
        requestData,
      );

      if (response.data.valid) {
        notify.success(response.data.message ?? "Student added successfully");
        reset();
        setPhoto(null);
        setSlcDoc(null);
        setPhotoPreview("https://via.placeholder.com/100");
      } else {
        notify.error(response.data.message ?? "Failed to add student");
      }
    } catch (error) {
      logger.error(error);
      handleErrorNotification(error, "Student Addition");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <div className="flex mb-8">
        <NavLink
          to={"/students"}
          className="p-2 w-32 text-center bg-[#0f243f] text-white rounded font-bold px-4"
        >
          Back
        </NavLink>
      </div>

      <h1 className="text-2xl font-semibold text-[#0f243f] text-center mb-5">
        Student Admission
      </h1>

      <form onSubmit={handleSubmit(addStudent)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Student Information */}
          <div className="bg-white rounded-lg border">
            <h2 className="text-white bg-[#0f243f] font-bold px-4 p-2 rounded-t-lg">
              Student Information
            </h2>
            <div className="p-4">
              <FormField
                placeholder="Enter B-Form Number"
                name="bForm"
                label="B-Form"
                register={register}
                errorMessage={errors.bForm?.message}
              />

              <FormField
                placeholder="Enter Name"
                name="name"
                label="Name"
                register={register}
                errorMessage={errors.name?.message}
              />

              <FormField
                placeholder="Enter Father Name"
                name="fatherName"
                label="Father Name"
                register={register}
                errorMessage={errors.fatherName?.message}
              />

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  {...register("gender")}
                  className="w-full p-2 border rounded-md shadow-sm"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                {errors.gender && (
                  <p className="text-red-500 text-sm">
                    {errors.gender.message}
                  </p>
                )}
              </div>

              <FormField
                type="date"
                placeholder="mm/dd/yyyy"
                name="dob"
                label="Date of Birth"
                register={register}
                errorMessage={errors.dob?.message}
              />

              <FormField
                placeholder="Enter Religion"
                name="religion"
                label="Religion"
                register={register}
                errorMessage={errors.religion?.message}
              />

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Photo
                </label>
                <img
                  alt="Student Photo"
                  className="w-24 h-24 object-cover mb-2"
                  src={photoPreview}
                />
                <input
                  className="text-blue-500"
                  type="file"
                  onChange={handlePhotoChange}
                />
              </div>
            </div>
          </div>

          {/* Guardian Information */}
          <div className="bg-white rounded-lg border">
            <h2 className="text-white bg-[#0f243f] font-bold px-4 p-2 rounded-t-lg">
              Guardian Information
            </h2>
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship
                </label>
                <select
                  {...register("relationship")}
                  className="w-full p-2 border rounded-md shadow-sm"
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                </select>
                {errors.relationship && (
                  <p className="text-red-500 text-sm">
                    {errors.relationship.message}
                  </p>
                )}
              </div>

              <FormField
                placeholder="Enter Guardian Name"
                name="guardianName"
                label="Guardian Name"
                register={register}
                errorMessage={errors.guardianName?.message}
              />

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guardian ID Card
                </label>
                <input
                  {...register("guardianId")}
                  className="w-full p-2 border rounded-md shadow-sm"
                  placeholder="XXXXX-XXXXXXX-X"
                  type="text"
                  onInput={(e: React.FormEvent<HTMLInputElement>) => {
                    const target = e.target as HTMLInputElement;
                    const formattedValue = formatCNIC(target.value);
                    if (formattedValue.length <= 15) {
                      setValue("guardianId", formattedValue);
                    }
                  }}
                  onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                    void handleCNICBlur(e.target.value);
                  }}
                />
                {errors.guardianId && (
                  <p className="text-red-500 text-sm">
                    {errors.guardianId.message}
                  </p>
                )}
                {errorMessage && (
                  <p className="text-red-500 text-sm">{errorMessage}</p>
                )}
              </div>

              <FormField
                type="email"
                placeholder="Enter Guardian Email"
                name="guardianEmail"
                label="Guardian Email"
                register={register}
                errorMessage={errors.guardianEmail?.message}
              />

              <FormField
                placeholder="Enter Guardian Phone"
                name="guardianPhone"
                label="Guardian Phone"
                register={register}
                errorMessage={errors.guardianPhone?.message}
              />

              <FormField
                placeholder="Enter Mother Phone"
                name="motherPhone"
                label="Mother Phone"
                register={register}
                errorMessage={errors.motherPhone?.message}
              />

              <FormField
                placeholder="Enter WhatsApp Number"
                name="whatsappNumber"
                label="WhatsApp Number"
                register={register}
                errorMessage={errors.whatsappNumber?.message}
              />

              <FormField
                placeholder="Enter Home Address"
                name="address"
                label="Home Address"
                register={register}
                errorMessage={errors.address?.message}
              />
            </div>
          </div>

          {/* Other Information */}
          <div className="bg-white rounded-lg border">
            <h2 className="text-white bg-[#0f243f] font-bold px-4 p-2 rounded-t-lg">
              Other Information
            </h2>
            <div className="p-4">
              <FormField
                placeholder="1000PKR"
                name="feeMonthly"
                label="Fee Monthly"
                register={register}
                errorMessage={errors.feeMonthly?.message}
              />

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type of Discount
                </label>
                <select
                  {...register("discountType")}
                  className="w-full p-2 border rounded-md shadow-sm"
                >
                  <option value="None">None</option>
                  <option value="Scholarship Discount">
                    Scholarship Discount
                  </option>
                </select>
                {errors.discountType && (
                  <p className="text-red-500 text-sm">
                    {errors.discountType.message}
                  </p>
                )}
              </div>

              <FormField
                placeholder="1100PKR"
                name="currentMonthly"
                label="Current Monthly"
                register={register}
                errorMessage={errors.currentMonthly?.message}
              />

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transport Route
                </label>
                <select
                  {...register("transportRoute")}
                  className="w-full p-2 border rounded-md shadow-sm"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
                {errors.transportRoute && (
                  <p className="text-red-500 text-sm">
                    {errors.transportRoute.message}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Welcome SMS Alert
                </label>
                <select
                  {...register("welcomeSMS")}
                  className="w-full p-2 border rounded-md shadow-sm"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
                {errors.welcomeSMS && (
                  <p className="text-red-500 text-sm">
                    {errors.welcomeSMS.message}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Create Parent Account
                </label>
                <select
                  {...register("createParentAccount")}
                  className="w-full p-2 border rounded-md shadow-sm"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
                {errors.createParentAccount && (
                  <p className="text-red-500 text-sm">
                    {errors.createParentAccount.message}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Generate Admission Fee
                </label>
                <select
                  {...register("generateAdmissionFee")}
                  className="w-full p-2 border rounded-md shadow-sm"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
                {errors.generateAdmissionFee && (
                  <p className="text-red-500 text-sm">
                    {errors.generateAdmissionFee.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white rounded-lg border">
            <h2 className="text-white bg-[#0f243f] font-bold px-4 p-2 rounded-t-lg">
              Academic Information
            </h2>
            <div className="p-4">
              <FormField
                placeholder="ST03772"
                name="studentCode"
                label="Student Code"
                register={register}
                errorMessage={errors.studentCode?.message}
              />

              <FormField
                placeholder="8490 3824 90832942"
                name="uidCode"
                label="UID Code"
                register={register}
                errorMessage={errors.uidCode?.message}
              />

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campus
                </label>
                <select
                  {...register("campus")}
                  className="w-full p-2 border rounded-md shadow-sm"
                >
                  <option value="Main Campus">Main Campus</option>
                  <option value="Branch Campus">Branch Campus</option>
                </select>
                {errors.campus && (
                  <p className="text-red-500 text-sm">
                    {errors.campus.message}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class
                </label>
                <select
                  {...register("class")}
                  className="w-full p-2 border rounded-md shadow-sm"
                >
                  <option value="">Select</option>
                  {classes.map((classItem) => (
                    <option key={classItem.classID} value={classItem.className}>
                      {classItem.className}
                    </option>
                  ))}
                </select>
                {errors.class && (
                  <p className="text-red-500 text-sm">{errors.class.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section
                </label>
                <select
                  {...register("section")}
                  className="w-full p-2 border rounded-md shadow-sm"
                >
                  <option value="">Select Section</option>
                  {sections.map((sec) => (
                    <option key={sec.classID} value={sec.section}>
                      {sec.section}
                    </option>
                  ))}
                </select>
                {errors.section && (
                  <p className="text-red-500 text-sm">
                    {errors.section.message}
                  </p>
                )}
              </div>

              <FormField
                placeholder="Name of Previous School"
                name="previousSchool"
                label="Previous School"
                register={register}
                errorMessage={errors.previousSchool?.message}
              />

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SLC Doc
                </label>
                <input
                  className="w-full p-2 border rounded-md"
                  type="file"
                  onChange={handleSlcDocChange}
                />
              </div>

              <FormField
                type="date"
                placeholder="mm/dd/yyyy"
                name="admissionDate"
                label="Admission Date"
                register={register}
                errorMessage={errors.admissionDate?.message}
              />

              <div className="mb-4">
                <Button
                  type="submit"
                  shape="info"
                  pending={isSubmitting || loading}
                  className="w-full bg-[#0f243f] font-bold px-4 text-white p-2 rounded"
                >
                  {loading ? "Adding..." : "Add Student"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;
