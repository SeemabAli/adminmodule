/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useState, useEffect } from "react";
import { logger } from "@/lib/logger";
import {
  createCustomer,
  fetchAllCustomers,
  updateCustomer,
  deleteCustomer,
} from "./customer.service";
import { notify } from "../../../lib/notify";
import { useForm } from "react-hook-form";
import { Button } from "@/common/components/ui/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorModal } from "@/common/components/Error";
import { useService } from "@/common/hooks/custom/useService";
import {
  customerSchema,
  type ICustomer,
  type Phone,
  type Address,
  type PostDatedCheque,
} from "./customer.schema";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
import { fetchAllRoutes } from "../DeliveryRoutes/route.service";
import type { DeliveryRoute } from "../DeliveryRoutes/deliveryRoute.schema";
import ImageUploader from "@/common/components/ImageUploader";
import { uploadImage } from "@/common/services/image.service";

// // Define proper types based on the schema
// interface Phone {
//   number: string;
//   status: "Ptcl" | "Mobile" | "Whatsapp";
// }

// interface PostDatedCheque {
//   dueDate: string;
//   details: string;
//   image: string;
// }

// interface Signature {
//   image: string;
// }

// interface CustomerFormData {
//   id?: string;
//   customerName: string;
//   acTitle: string;
//   dealingPerson: string;
//   reference: string;
//   cnicFront: string;
//   cnicBack: string;
//   ntn: string;
//   phones: Phone[];
//   addresses: { text: string; map: string }[];
//   route: string;
//   creditLimit: number;
//   postDatedCheques: PostDatedCheque[];
//   ledgerDetails: string;
//   ledgerNumber: number;
//   signatures: Signature[];
//   otherImages: string[];
//   smsPattern?: {
//     enabled: boolean;
//     frequency: "Daily" | "Weekly" | "Monthly" | "Yearly";
//     via: string;
//   };
// }

// SMS Via options
const smsViaOptions = ["SMS", "WhatsApp", "Email", "Push Notification"];
const smsFrequencyOptions = ["Daily", "Weekly", "Monthly", "Yearly"];

export const Customer: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [phoneType, setPhoneType] = useState<"MOBILE" | "PTCL" | "WHATSAPP">(
    "MOBILE",
  );
  const [currentAddress, setCurrentAddress] = useState("");
  const [chequeDate, setChequeDate] = useState("");
  const [chequeAmount, setChequeAmount] = useState<number>(0);
  const [chequeNumber, setChequeNumber] = useState<string>("");
  const [chequeDetails, setChequeDetails] = useState("");

  // Image files
  const [cnicFrontFile, setCnicFrontFile] = useState<File | null>(null);
  const [cnicBackFile, setCnicBackFile] = useState<File | null>(null);
  const [chequeFile, setChequeFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [otherImageFile, setOtherImageFile] = useState<File | null>(null);

  // Image previews
  const [cnicFrontPreview, setCnicFrontPreview] = useState("");
  const [cnicBackPreview, setCnicBackPreview] = useState("");
  const [chequePreview, setChequePreview] = useState("");
  const [signaturePreview, setSignaturePreview] = useState("");
  const [otherImagePreview, setOtherImagePreview] = useState("");

  // Notification preference state
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [notificationFrequency, setNotificationFrequency] = useState<
    "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
  >("MONTHLY");
  const [notificationChannel, setNotificationChannel] = useState<
    "SMS" | "WHATSAPP" | "EMAIL" | "PUSH"
  >("WHATSAPP");

  // Handle image file selections
  const handleCnicFrontSelected = (file: File) => {
    if (cnicFrontPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(cnicFrontPreview);
    }
    setCnicFrontFile(file);
    setCnicFrontPreview(URL.createObjectURL(file));
  };

  const handleCnicBackSelected = (file: File) => {
    if (cnicBackPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(cnicBackPreview);
    }
    setCnicBackFile(file);
    setCnicBackPreview(URL.createObjectURL(file));
  };

  const handleChequeSelected = (file: File) => {
    if (chequePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(chequePreview);
    }
    setChequeFile(file);
    setChequePreview(URL.createObjectURL(file));
  };

  const handleSignatureSelected = (file: File) => {
    if (signaturePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(signaturePreview);
    }
    setSignatureFile(file);
    setSignaturePreview(URL.createObjectURL(file));
  };

  const handleOtherImageSelected = (file: File) => {
    if (otherImagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(otherImagePreview);
    }
    setOtherImageFile(file);
    setOtherImagePreview(URL.createObjectURL(file));
  };

  // Use the API service
  const { error, data, isLoading } = useService(fetchAllCustomers);

  // Initialize React Hook Form
  const { register, setValue, setFocus, getValues, reset, watch } =
    useForm<ICustomer>({
      resolver: zodResolver(customerSchema),
      defaultValues: {
        fullName: "",
        accountTitle: "",
        dealingPerson: "",
        reference: "",
        ntnNumber: "",
        creditLimit: 0,
        creditDetail: "",
        ledgerDetails: "",
        ledgerNumber: 0,
        phoneNumbers: [],
        cnicBackImage: "",
        cnicFrontImage: "",
        addresses: [],
        notificationPreference: undefined,
        postDatedCheques: [],
      },
    });

  // Watch values from the form
  const watchedValues = watch();

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validate only required fields for step 1
      if (!watchedValues.fullName || !watchedValues.accountTitle) {
        notify.error(
          "Please complete all required fields: Full Name and Account Title",
        );
        return;
      }
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleAddPhone = () => {
    if (!phoneNumber) {
      notify.error("Please enter a phone number");
      return;
    }
    const currentPhones = watchedValues.phoneNumbers || [];
    setValue("phoneNumbers", [
      ...currentPhones,
      { number: phoneNumber, type: phoneType },
    ]);
    setPhoneNumber("");
    setPhoneType("MOBILE");
  };

  const handleRemovePhone = (index: number) => {
    const currentPhones = [...(watchedValues.phoneNumbers || [])];
    currentPhones.splice(index, 1);
    setValue("phoneNumbers", currentPhones);
  };

  const handleAddAddress = () => {
    if (!currentAddress) {
      notify.error("Please enter an address");
      return;
    }
    const currentAddresses = watchedValues.addresses || [];
    setValue("addresses", [...currentAddresses, { currentAddress }]);
    setCurrentAddress("");
  };

  const handleRemoveAddress = (index: number) => {
    const currentAddresses = [...(watchedValues.addresses || [])];
    currentAddresses.splice(index, 1);
    setValue("addresses", currentAddresses);
  };

  const handleAddCheque = async () => {
    if (!chequeDate || !chequeDetails) return;

    try {
      // Upload cheque image if exists
      let imagePath = "";
      if (chequeFile) {
        const uploadResponse = await uploadImage(chequeFile);
        imagePath = uploadResponse.path;
      }

      // Add cheque to the form
      const currentCheques = watchedValues.postDatedCheques ?? [];
      setValue("postDatedCheques", [
        ...currentCheques,
        {
          status: "PENDING",
          date: chequeDate,
          amount: chequeAmount,
          number: chequeNumber ? parseInt(chequeNumber, 10) : undefined,
          details: chequeDetails,
          image: imagePath,
        },
      ]);

      // Reset state
      setChequeDate("");
      setChequeAmount(0);
      setChequeNumber("");
      setChequeDetails("");
      setChequeFile(null);
      if (chequePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(chequePreview);
      }
      setChequePreview("");

      notify.success("Cheque added successfully");
    } catch (error) {
      notify.error("Failed to add cheque");
      logger.error(error);
    }
  };

  const handleRemoveCheque = (index: number) => {
    const currentCheques = [...(watchedValues.postDatedCheques ?? [])];
    currentCheques.splice(index, 1);
    setValue("postDatedCheques", currentCheques);
  };

  const handleAddSignature = async () => {
    if (!signatureFile) return;

    try {
      // Upload the file first
      const uploadResponse = await uploadImage(signatureFile);

      // Add signature to the form
      const currentSignatures = watchedValues.signatures ?? [];
      setValue("signatures", [
        ...currentSignatures,
        { image: uploadResponse.path },
      ]);

      // Reset state
      setSignatureFile(null);
      if (signaturePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(signaturePreview);
      }
      setSignaturePreview("");

      notify.success("Signature added successfully");
    } catch (error) {
      notify.error("Failed to add signature");
      logger.error(error);
    }
  };

  const handleRemoveSignature = (index: number) => {
    const currentSignatures = [...(watchedValues.signatures ?? [])];
    currentSignatures.splice(index, 1);
    setValue("signatures", currentSignatures);
  };

  const handleSignatureImageUpload = (file: File) => {
    if (signaturePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(signaturePreview);
    }
    setSignatureFile(file);
    setSignaturePreview(URL.createObjectURL(file));
  };

  const handleOtherImageUpload = (file: File) => {
    if (otherImagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(otherImagePreview);
    }
    setOtherImageFile(file);
    setOtherImagePreview(URL.createObjectURL(file));
  };

  const handleAddOtherImage = async () => {
    if (!otherImageFile) {
      notify.error("Please select an image first.");
      return;
    }

    try {
      // Upload the file first
      const uploadResponse = await uploadImage(otherImageFile);

      // Add image to the form
      const currentImages = watchedValues.otherImages || [];
      setValue("otherImages", [...currentImages, uploadResponse.path]);

      // Reset state
      setOtherImageFile(null);
      if (otherImagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(otherImagePreview);
      }
      setOtherImagePreview("");

      notify.success("Image added successfully!");
    } catch (error) {
      notify.error("Failed to add image");
      logger.error(error);
    }
  };

  const handleRemoveOtherImage = (index: number) => {
    const currentImages = [...(watchedValues.otherImages || [])];
    currentImages.splice(index, 1);
    setValue("otherImages", currentImages);
    notify.success("Image removed successfully!");
  };

  const handleSave = async (formData: ICustomer) => {
    try {
      // Upload CNIC images first if they exist
      if (cnicFrontFile) {
        const uploadResponse = await uploadImage(cnicFrontFile);
        formData.cnicFrontImage = uploadResponse.path;
      }

      if (cnicBackFile) {
        const uploadResponse = await uploadImage(cnicBackFile);
        formData.cnicBackImage = uploadResponse.path;
      }

      // Add notification preference if enabled
      const customerData = {
        ...formData,
        notificationPreference: notificationEnabled
          ? {
              frequency: notificationFrequency,
              channel: notificationChannel,
            }
          : undefined,
      };

      if (editingIndex !== null && customers[editingIndex]?.id) {
        // Update existing customer
        const updatedCustomer = await updateCustomer(
          customers[editingIndex].id!,
          customerData,
        );

        const updatedCustomers = [...customers];
        updatedCustomers[editingIndex] = {
          ...customers[editingIndex],
          ...updatedCustomer,
        };
        setCustomers(updatedCustomers);
        notify.success("Customer updated successfully!");
      } else {
        // Create new customer
        const newCustomer = await createCustomer(customerData);
        setCustomers([...customers, newCustomer]);
        notify.success("Customer saved successfully!");
      }

      // Reset form and state
      resetForm();
    } catch (error) {
      notify.error("Failed to save customer.");
      logger.error(error);
    }
  };

  const resetForm = () => {
    reset();
    setPhoneNumber("");
    setPhoneType("MOBILE");
    setCurrentAddress("");
    setChequeDate("");
    setChequeAmount(0);
    setChequeNumber("");
    setChequeDetails("");

    // Reset image files
    setCnicFrontFile(null);
    setCnicBackFile(null);
    setChequeFile(null);
    setSignatureFile(null);
    setOtherImageFile(null);

    // Clean up preview URLs
    if (cnicFrontPreview?.startsWith("blob:"))
      URL.revokeObjectURL(cnicFrontPreview);
    if (cnicBackPreview?.startsWith("blob:"))
      URL.revokeObjectURL(cnicBackPreview);
    if (chequePreview?.startsWith("blob:")) URL.revokeObjectURL(chequePreview);
    if (signaturePreview?.startsWith("blob:"))
      URL.revokeObjectURL(signaturePreview);
    if (otherImagePreview?.startsWith("blob:"))
      URL.revokeObjectURL(otherImagePreview);

    // Reset preview states
    setCnicFrontPreview("");
    setCnicBackPreview("");
    setChequePreview("");
    setSignaturePreview("");
    setOtherImagePreview("");

    setNotificationEnabled(false);
    setNotificationFrequency("MONTHLY");
    setNotificationChannel("WHATSAPP");
    setEditingIndex(null);
    setCurrentStep(1);
  };

  const handleEdit = (index: number) => {
    const customer = customers[index];
    if (!customer) return;

    // Reset form first
    reset();

    // Set all form fields
    setValue("fullName", customer.fullName);
    setValue("accountTitle", customer.accountTitle);
    setValue("dealingPerson", customer.dealingPerson || "");
    setValue("reference", customer.reference || "");
    setValue("ntnNumber", customer.ntnNumber || "");
    setValue("creditLimit", customer.creditLimit || 0);
    setValue("creditDetail", customer.creditDetail || "");
    setValue("ledgerDetails", customer.ledgerDetails || "");
    setValue("ledgerNumber", customer.ledgerNumber || 0);
    setValue("phoneNumbers", customer.phoneNumbers || []);
    setValue("cnicFrontImage", customer.cnicFrontImage || "");
    setValue("cnicBackImage", customer.cnicBackImage || "");
    setValue("addresses", customer.addresses || []);
    setValue("postDatedCheques", customer.postDatedCheques || []);

    // Set notification preference if it exists
    if (customer.notificationPreference) {
      setNotificationEnabled(true);
      setNotificationFrequency(customer.notificationPreference.frequency);
      setNotificationChannel(customer.notificationPreference.channel);
    } else {
      setNotificationEnabled(false);
      setNotificationFrequency("MONTHLY");
      setNotificationChannel("WHATSAPP");
    }

    setEditingIndex(index);
    setCurrentStep(1);
    setFocus("fullName");
    notify.success("Customer loaded for editing.");
  };

  const handleDelete = (index: number) => {
    const customer = customers[index];
    if (!customer?.id) {
      notify.error("Customer ID is missing.");
      return;
    }

    notify.confirmDelete(async () => {
      try {
        await deleteCustomer(customer.id!);
        setCustomers(customers.filter((_, i) => i !== index));
        notify.success("Customer deleted successfully!");
      } catch (error) {
        notify.error("Failed to delete customer.");
        logger.error(error);
      }
    });
  };

  // New method to handle cleanup of object URLs
  useEffect(() => {
    return () => {
      // Clean up all object URLs on component unmount
      if (cnicFrontPreview?.startsWith("blob:"))
        URL.revokeObjectURL(cnicFrontPreview);
      if (cnicBackPreview?.startsWith("blob:"))
        URL.revokeObjectURL(cnicBackPreview);
      if (chequePreview?.startsWith("blob:"))
        URL.revokeObjectURL(chequePreview);
      if (signaturePreview?.startsWith("blob:"))
        URL.revokeObjectURL(signaturePreview);
      if (otherImagePreview?.startsWith("blob:"))
        URL.revokeObjectURL(otherImagePreview);
    };
  }, [
    cnicFrontPreview,
    cnicBackPreview,
    chequePreview,
    signaturePreview,
    otherImagePreview,
  ]);

  // Load data from API
  useEffect(() => {
    if (data) {
      setCustomers(data);
    }
  }, [data]);

  // Fetch routes when component mounts
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const routesData = await fetchAllRoutes();
        setRoutes(routesData);
      } catch (error) {
        logger.error("Failed to fetch routes:", error);
        notify.error("Failed to load routes");
      }
    };
    void loadRoutes();
  }, []);

  if (error) {
    return (
      <ErrorModal
        message={
          error instanceof Error
            ? error.message
            : "Failed to fetch customer data"
        }
      />
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        {editingIndex !== null ? "Edit Customer" : "Customer Management"} - Step{" "}
        {currentStep} of 2
      </h2>

      <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
        {currentStep === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Required Fields - highlighted */}
            <div className="border-l-4 border-accent p-2">
              <label className="block font-medium mb-1">
                Full Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Full Name"
                {...register("fullName")}
                className="input input-bordered w-full"
              />
            </div>
            <div className="border-l-4 border-accent p-2">
              <label className="block font-medium mb-1">
                Account Title <span className="text-error">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Account Title"
                {...register("accountTitle")}
                className="input input-bordered w-full"
              />
            </div>

            {/* Route Selection */}
            <div className="border-l-4 border-accent p-2">
              <label className="block font-medium mb-1">
                Route <span className="text-error">*</span>
              </label>
              <select
                {...register("routeId")}
                className="select select-bordered w-full"
                required
              >
                <option value="">Select Route</option>
                {routes.map((route: DeliveryRoute) => (
                  <option key={route.id} value={route.id}>
                    {route.code}
                  </option>
                ))}
              </select>
            </div>

            {/* Optional Fields */}
            <div className="pt-2">
              <label className="block font-medium mb-1">Dealing Person</label>
              <input
                type="text"
                placeholder="Enter Name"
                {...register("dealingPerson")}
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">NTN#</label>
              <input
                type="text"
                placeholder="Enter Number"
                {...register("ntnNumber")}
                className="input input-bordered w-full"
              />
            </div>

            {/* CNIC Images */}
            <div>
              <label className="block font-medium mb-1">CNIC Front Side</label>
              <ImageUploader
                buttonText="Upload CNIC Front"
                onImageSelected={handleCnicFrontSelected}
                initialPreview={cnicFrontPreview}
                previewSize="small"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">CNIC Back Side</label>
              <ImageUploader
                buttonText="Upload CNIC Back"
                onImageSelected={handleCnicBackSelected}
                initialPreview={cnicBackPreview}
                previewSize="small"
              />
            </div>

            {/* Credit Limit */}
            <div>
              <label className="block font-medium mb-1">Credit Limit</label>
              <input
                type="number"
                placeholder="Enter Credit Limit"
                {...register("creditLimit", { valueAsNumber: true })}
                className="input input-bordered w-full"
              />
            </div>

            {/* Credit Detail */}
            <div>
              <label className="block font-medium mb-1">Credit Detail</label>
              <input
                type="text"
                placeholder="Enter Credit Detail"
                {...register("creditDetail")}
                className="input input-bordered w-full"
              />
            </div>

            {/* Ledger Number */}
            <div>
              <label className="block font-medium mb-1">Ledger Number</label>
              <input
                type="number"
                placeholder="Enter Ledger Number"
                {...register("ledgerNumber", { valueAsNumber: true })}
                className="input input-bordered w-full"
              />
            </div>

            {/* Ledger Details */}
            <div className="md:col-span-2">
              <label className="block font-medium mb-1">Ledger Details</label>
              <textarea
                {...register("ledgerDetails")}
                placeholder="Enter Ledger Details"
                className="textarea textarea-bordered w-full"
                rows={3}
              />
            </div>

            {/* Signature Section */}
            <div className="md:col-span-2">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold mb-2">Signature</h3>
                <div className="flex-1 flex flex-col">
                  <ImageUploader
                    buttonText="Select Signature"
                    onImageSelected={handleSignatureSelected}
                    initialPreview={signaturePreview}
                    previewSize="medium"
                  />
                  <Button
                    onClick={handleAddSignature}
                    className="mt-4 md:w-1/8"
                    shape="info"
                    disabled={!signatureFile}
                  >
                    Add Signature
                  </Button>
                </div>

                {(watchedValues.signatures ?? []).length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="table w-1/4">
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(watchedValues.signatures ?? []).map(
                          (signature, index) => (
                            <tr key={index}>
                              <td>
                                {signature.image && (
                                  <img
                                    src={signature.image}
                                    alt="Signature"
                                    className="w-16 h-12 object-cover rounded"
                                  />
                                )}
                              </td>
                              <td>
                                <button
                                  onClick={() => {
                                    handleRemoveSignature(index);
                                  }}
                                  className="justify-center"
                                >
                                  <TrashIcon className="w-5 h-5 text-red-500" />
                                </button>
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="w-full">
            {/* Phone Numbers Section */}
            <div className="mb-8 border-l-4 border-accent p-4 bg-base-100 rounded-md shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Phone Numbers</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                  }}
                  className="input input-bordered w-full"
                />
                <select
                  value={phoneType}
                  onChange={(e) => {
                    setPhoneType(
                      e.target.value as "MOBILE" | "PTCL" | "WHATSAPP",
                    );
                  }}
                  className="select select-bordered w-full"
                >
                  <option value="MOBILE">Mobile</option>
                  <option value="PTCL">PTCL</option>
                  <option value="WHATSAPP">WhatsApp</option>
                </select>
                <button
                  onClick={handleAddPhone}
                  className="btn btn-info w-full"
                  disabled={!phoneNumber}
                >
                  Add
                </button>
              </div>
              {(watchedValues.phoneNumbers ?? []).length > 0 && (
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Phone Number</th>
                        <th>Type</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(watchedValues.phoneNumbers ?? []).map(
                        (phone, index) => (
                          <tr key={index}>
                            <td>{phone.number}</td>
                            <td>{phone.type}</td>
                            <td>
                              <button
                                onClick={() => {
                                  handleRemovePhone(index);
                                }}
                                className="justify-center"
                              >
                                <TrashIcon className="w-5 h-5 text-red-500" />
                              </button>
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Addresses Section */}
            <div className="mb-8 border-l-4 border-accent p-4 bg-base-100 rounded-md shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    placeholder="Current Address"
                    value={currentAddress}
                    onChange={(e) => {
                      setCurrentAddress(e.target.value);
                    }}
                    className="input input-bordered w-full"
                  />
                </div>
                <button
                  onClick={handleAddAddress}
                  className="btn btn-info w-full"
                  disabled={!currentAddress}
                >
                  Add
                </button>
              </div>
              {(watchedValues.addresses ?? []).length > 0 && (
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Address</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(watchedValues.addresses ?? []).map((address, index) => (
                        <tr key={index}>
                          <td>{address.currentAddress}</td>
                          <td>
                            <button
                              onClick={() => {
                                handleRemoveAddress(index);
                              }}
                              className="justify-center"
                            >
                              <TrashIcon className="w-5 h-5 text-red-500" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Notification Preference */}
            <div className="mb-8 p-4 bg-base-100 rounded-md shadow-sm">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  checked={notificationEnabled}
                  onChange={() => {
                    setNotificationEnabled(!notificationEnabled);
                  }}
                  className="checkbox mr-2"
                />
                <h3 className="text-xl font-semibold">
                  Notification Preference
                </h3>
              </div>

              {notificationEnabled && (
                <div className="pl-6 mt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium mb-2">
                        Frequency
                      </label>
                      <select
                        value={notificationFrequency}
                        onChange={(e) => {
                          setNotificationFrequency(
                            e.target.value as
                              | "DAILY"
                              | "WEEKLY"
                              | "MONTHLY"
                              | "YEARLY",
                          );
                        }}
                        className="select select-bordered w-full"
                      >
                        <option value="DAILY">Daily</option>
                        <option value="WEEKLY">Weekly</option>
                        <option value="MONTHLY">Monthly</option>
                        <option value="YEARLY">Yearly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium mb-2">Channel</label>
                      <select
                        value={notificationChannel}
                        onChange={(e) => {
                          setNotificationChannel(
                            e.target.value as
                              | "SMS"
                              | "WHATSAPP"
                              | "EMAIL"
                              | "PUSH",
                          );
                        }}
                        className="select select-bordered w-full"
                      >
                        <option value="SMS">SMS</option>
                        <option value="WHATSAPP">WhatsApp</option>
                        <option value="EMAIL">Email</option>
                        <option value="PUSH">Push Notification</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Other Images */}
            <div className="mb-8 p-4 bg-base-100 rounded-md shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Other Images</h3>
              <div className="mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <ImageUploader
                      buttonText="Select Image"
                      onImageSelected={handleOtherImageSelected}
                      initialPreview={otherImagePreview}
                      previewSize="medium"
                    />
                  </div>
                  <button
                    onClick={handleAddOtherImage}
                    className="btn btn-info w-full"
                    disabled={!otherImageFile}
                  >
                    Add Image
                  </button>
                </div>
              </div>
              {(watchedValues.otherImages ?? []).length > 0 && (
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(watchedValues.otherImages ?? []).map((image, index) => (
                        <tr key={index}>
                          <td>
                            <img
                              src={image}
                              alt="Other"
                              className="w-16 h-12 object-cover rounded"
                            />
                          </td>
                          <td>
                            <button
                              onClick={() => {
                                handleRemoveOtherImage(index);
                              }}
                              className="justify-center"
                            >
                              <TrashIcon className="w-5 h-5 text-red-500" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Post-dated Cheques Section */}
            <div className="mb-8 p-4 bg-base-100 rounded-md shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Post-dated Cheques</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Date</label>
                  <input
                    type="date"
                    placeholder="Date"
                    value={chequeDate}
                    onChange={(e) => {
                      setChequeDate(e.target.value);
                    }}
                    className="input input-bordered w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Amount
                  </label>
                  <input
                    type="number"
                    placeholder="Amount"
                    value={chequeAmount}
                    onChange={(e) => {
                      setChequeAmount(Number(e.target.value));
                    }}
                    className="input input-bordered w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Cheque Number
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Cheque Number"
                    value={chequeNumber}
                    onChange={(e) => {
                      setChequeNumber(e.target.value);
                    }}
                    className="input input-bordered w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Details
                  </label>
                  <input
                    type="text"
                    placeholder="Details"
                    value={chequeDetails}
                    onChange={(e) => {
                      setChequeDetails(e.target.value);
                    }}
                    className="input input-bordered w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Upload Cheque
                  </label>
                  <ImageUploader
                    buttonText="Select Cheque"
                    onImageSelected={handleChequeSelected}
                    initialPreview={chequePreview}
                    previewSize="small"
                  />
                </div>

                <div className="md:col-span-3 flex justify-start mt-2">
                  {chequePreview && (
                    <div className="flex-shrink-0 mr-4">
                      <img
                        src={chequePreview}
                        alt="Cheque"
                        className="w-24 h-16 object-cover rounded"
                      />
                    </div>
                  )}
                  <button
                    onClick={handleAddCheque}
                    className="btn btn-info"
                    disabled={!chequeDate || !chequeDetails}
                  >
                    Add Cheque
                  </button>
                </div>
              </div>

              {(watchedValues.postDatedCheques ?? []).length > 0 && (
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Cheque Number</th>
                        <th>Details</th>
                        <th>Image</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(watchedValues.postDatedCheques ?? []).map(
                        (cheque, index) => (
                          <tr key={index}>
                            <td>{cheque.date}</td>
                            <td>{cheque.amount}</td>
                            <td>{cheque.number}</td>
                            <td>{cheque.details}</td>
                            <td>
                              {cheque.image && (
                                <img
                                  src={cheque.image}
                                  alt="Cheque"
                                  className="w-16 h-12 object-cover rounded"
                                />
                              )}
                            </td>
                            <td>
                              <button
                                onClick={() => {
                                  handleRemoveCheque(index);
                                }}
                                className="justify-center"
                              >
                                <TrashIcon className="w-5 h-5 text-red-500" />
                              </button>
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          {currentStep === 2 ? (
            <button
              className="btn btn-outline btn-primary"
              onClick={handlePrevStep}
            >
              Previous
            </button>
          ) : (
            <div></div>
          )}
          {currentStep === 1 ? (
            <button className="btn btn-primary" onClick={handleNextStep}>
              Next
            </button>
          ) : (
            <button
              className="btn btn-success"
              onClick={() => handleSave(getValues())}
            >
              {editingIndex !== null ? "Update" : "Save"}
            </button>
          )}
        </div>
      </div>

      {/* Customers List */}
      {isLoading && <div className="skeleton h-28 w-full"></div>}
      {customers.length > 0 && (
        <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
          <div className="flex justify-between mb-4">
            <h3 className="text-xl font-semibold">Customers List</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Account Title</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, index) => (
                  <tr key={index}>
                    <td>{customer.fullName}</td>
                    <td>{customer.accountTitle}</td>
                    <td>
                      {(customer.phoneNumbers ?? []).length > 0
                        ? (customer.phoneNumbers ?? [])[0]?.number
                        : "-"}
                    </td>
                    <td>
                      {customer.addresses && customer.addresses.length > 0
                        ? customer.addresses[0]?.currentAddress
                        : "-"}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            handleEdit(index);
                          }}
                          className="w-5 h-5 text-info"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            handleDelete(index);
                          }}
                          className="w-5 h-5 text-red-500"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
