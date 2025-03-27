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
import { customerSchema, type ICustomer } from "./customer.schema";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
import { type Phone } from "./customer.schema";

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
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [phoneStatus, setPhoneStatus] = useState<
    "Ptcl" | "Mobile" | "Whatsapp"
  >("Mobile");
  const [addressText, setAddressText] = useState("");
  const [addressMap, setAddressMap] = useState("");
  const [chequeDueDate, setChequeDueDate] = useState("");
  const [signatureImage, setSignatureImage] = useState("");
  const [chequeDetails, setChequeDetails] = useState("");
  const [chequeImage, setChequeImage] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [otherImage, setOtherImage] = useState("");

  // Map state
  const [showMap, setShowMap] = useState(false);
  const [mapSearchQuery, setMapSearchQuery] = useState("");

  // For sending SMS to existing customers
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [selectedCustomerIndexes, setSelectedCustomerIndexes] = useState<
    number[]
  >([]);

  // Use the API service
  const { error, data, isLoading } = useService(fetchAllCustomers);

  // Initialize React Hook Form
  const { register, setValue, setFocus, getValues, reset, watch } =
    useForm<ICustomer>({
      resolver: zodResolver(customerSchema),
      defaultValues: {
        customerName: "",
        acTitle: "",
        dealingPerson: "",
        reference: "",
        cnicFront: "",
        cnicBack: "",
        ntn: "",
        phones: [],
        addresses: [],
        route: "",
        creditLimit: 0,
        postDatedCheques: [],
        ledgerDetails: "",
        ledgerNumber: 0,
        signatures: [],
        otherImages: [],
      },
    });

  // Watch values from the form
  const watchedValues = watch();

  // SMS Pattern state - kept separate from the form
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [smsFrequency, setSmsFrequency] = useState<
    "Daily" | "Weekly" | "Monthly" | "Yearly"
  >("Monthly");
  const [smsVia, setSmsVia] = useState("SMS");

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validate only required fields for step 1
      if (
        !watchedValues.customerName ||
        !watchedValues.acTitle ||
        !watchedValues.route
      ) {
        notify.error(
          "Please complete all required fields: Customer Name, A/C Title, and Route",
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
    const currentPhones = watchedValues.phones || [];
    setValue("phones", [
      ...currentPhones,
      { number: phoneNumber, status: phoneStatus } as Phone,
    ]);
    setPhoneNumber("");
    setPhoneStatus("Mobile");
  };

  const handleRemovePhone = (index: number) => {
    const currentPhones = [...watchedValues.phones];
    currentPhones.splice(index, 1);
    //TODO: Fix this
    // setValue("phones", currentPhones);
  };

  const handleAddAddress = () => {
    if (!addressText) {
      notify.error("Please enter an address");
      return;
    }
    const currentAddresses = watchedValues.addresses || [];
    setValue("addresses", [
      ...currentAddresses,
      { text: addressText, map: addressMap },
    ]);
    setAddressText("");
    setAddressMap("");
  };

  const handleRemoveAddress = (index: number) => {
    const currentAddresses = [...watchedValues.addresses];
    currentAddresses.splice(index, 1);
    //TODO: Fix this
    // setValue("addresses", currentAddresses.length > 0 ? currentAddresses : [{ text: "", map: "" }]);
  };

  const handleAddCheque = () => {
    if (!chequeDueDate || !chequeDetails) return;
    const currentCheques = watchedValues.postDatedCheques ?? [];
    setValue("postDatedCheques", [
      ...currentCheques,
      { dueDate: chequeDueDate, details: chequeDetails, image: chequeImage },
    ]);
    setChequeDueDate("");
    setChequeDetails("");
    setChequeImage("");
  };

  const handleAddSignature = () => {
    if (!signatureImage) return;
    const currentSignatures = watchedValues.signatures ?? [];
    setValue("signatures", [...currentSignatures, { image: signatureImage }]);
    setSignatureImage("");
  };

  const handleRemoveSignature = (index: number) => {
    const currentSignatures = [...(watchedValues.signatures ?? [])];
    currentSignatures.splice(index, 1);
    setValue("signatures", currentSignatures);
  };

  const handleRemoveCheque = (index: number) => {
    const currentCheques = [...(watchedValues.postDatedCheques ?? [])];
    currentCheques.splice(index, 1);
    setValue("postDatedCheques", currentCheques);
  };

  const handleSave = async (formData: ICustomer) => {
    try {
      // Add SMS pattern if enabled
      const customerData = {
        ...formData,
        name: formData.customerName,
        address:
          formData.addresses && formData.addresses.length > 0
            ? (formData.addresses[0]?.text ?? "")
            : "",
        phone:
          formData.phones.length > 0 ? (formData.phones[0]?.number ?? "") : "",
        email: "", // Add logic to get email if available
        smsPattern: smsEnabled
          ? {
              enabled: smsEnabled,
              frequency: smsFrequency,
              via: smsVia,
            }
          : undefined,
      };

      if (editingIndex !== null && customers[editingIndex]?.id) {
        // Update existing customer
        const updatedCustomer = await updateCustomer(
          customers[editingIndex].id,
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
        setCustomers([...customers, { ...newCustomer, ...formData }]);
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
    setPhoneStatus("Mobile");
    setAddressText("");
    setAddressMap("");
    setChequeDueDate("");
    setSignatureImage("");
    setChequeDetails("");
    setChequeImage("");
    setOtherImage("");
    setSmsEnabled(false);
    setSmsFrequency("Monthly");
    setSmsVia("SMS");
    setEditingIndex(null);
    setCurrentStep(1);
  };

  const handleEdit = (index: number) => {
    const customer = customers[index];
    if (!customer) return;

    // Reset form first
    reset();

    // Set all form fields
    setValue("customerName", customer.customerName);
    setValue("acTitle", customer.acTitle);
    setValue("dealingPerson", customer.dealingPerson || "");
    setValue("reference", customer.reference || "");
    setValue("cnicFront", customer.cnicFront || "");
    setValue("cnicBack", customer.cnicBack || "");
    setValue("ntn", customer.ntn || "");
    setValue("phones", customer.phones || []);
    setValue("addresses", customer.addresses || []);
    setValue("route", customer.route);
    setValue("creditLimit", customer.creditLimit || 0);
    setValue("postDatedCheques", customer.postDatedCheques || []);
    setValue("ledgerDetails", customer.ledgerDetails || "");
    setValue("ledgerNumber", customer.ledgerNumber || 0);
    setValue("signatures", customer.signatures || []);
    setValue("otherImages", customer.otherImages || []);

    // Set SMS pattern if it exists
    if (customer.smsPattern) {
      setSmsEnabled(customer.smsPattern.enabled);
      setSmsFrequency(customer.smsPattern.frequency);
      setSmsVia(customer.smsPattern.via);
    } else {
      setSmsEnabled(false);
      setSmsFrequency("Monthly");
      setSmsVia("SMS");
    }

    setEditingIndex(index);
    setCurrentStep(1);
    setFocus("customerName");
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

  const handleCnicFrontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue("cnicFront", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCnicBackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue("cnicBack", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChequeImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setChequeImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignatureImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOtherImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setOtherImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddOtherImage = () => {
    if (!otherImage) {
      notify.error("Please select an image first.");
      return;
    }
    const currentImages = watchedValues.otherImages || [];
    setValue("otherImages", [...currentImages, otherImage]);
    setOtherImage("");
    notify.success("Image added successfully!");
  };

  const handleRemoveOtherImage = (index: number) => {
    const currentImages = [...(watchedValues.otherImages || [])];
    currentImages.splice(index, 1);
    setValue("otherImages", currentImages);
    notify.success("Image removed successfully!");
  };

  // Map related functions
  const openMapSelector = () => {
    setShowMap(true);
  };

  const closeMapSelector = () => {
    setShowMap(false);
  };

  const handleMapSearch = () => {
    if (mapSearchQuery) {
      setAddressMap(
        `https://maps.google.com/?q=${encodeURIComponent(mapSearchQuery)}`,
      );
      setAddressText(mapSearchQuery);
      closeMapSelector();
      notify.success("Location selected!");
    }
  };

  // SMS Modal related functions
  const openSmsModal = () => {
    setShowSmsModal(true);
    setSelectedCustomerIndexes([]);
  };

  const closeSmsModal = () => {
    setShowSmsModal(false);
  };

  const toggleCustomerSelection = (index: number) => {
    if (selectedCustomerIndexes.includes(index)) {
      setSelectedCustomerIndexes(
        selectedCustomerIndexes.filter((i) => i !== index),
      );
    } else {
      setSelectedCustomerIndexes([...selectedCustomerIndexes, index]);
    }
  };

  const handleSendSms = () => {
    if (selectedCustomerIndexes.length === 0) {
      notify.error("Please select customers to send messages to");
      return;
    }

    // Get customer names for display in success message
    const customerNames = selectedCustomerIndexes
      .map((index) => customers[index]?.customerName)
      .filter(Boolean);

    // In a real app, you would send SMS here
    notify.success(
      `Messages sent to ${customerNames.join(", ")} via ${smsVia}`,
    );
    closeSmsModal();
  };

  // Load data from API
  useEffect(() => {
    if (data) {
      setCustomers(data);
    }
  }, [data]);

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
                Customer Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Full Name"
                {...register("customerName")}
                className="input input-bordered w-full"
              />
            </div>
            <div className="border-l-4 border-accent p-2">
              <label className="block font-medium mb-1">
                A/C Title <span className="text-error">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Account Title"
                {...register("acTitle")}
                className="input input-bordered w-full"
              />
            </div>
            <div className="border-l-4 border-accent p-2">
              <label className="block font-medium mb-1">
                Route <span className="text-error">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Route"
                {...register("route")}
                className="input input-bordered w-full"
              />
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
              <label className="block font-medium mb-1">Reference</label>
              <input
                type="text"
                placeholder="Enter Name"
                {...register("reference")}
                className="input input-bordered w-full"
              />
            </div>

            {/* CNIC Images */}
            <div>
              <label className="block font-medium mb-1">CNIC Front Side</label>
              <input
                type="file"
                onChange={handleCnicFrontUpload}
                className="file-input file-input-bordered w-full"
                accept="image/*"
              />
              {watchedValues.cnicFront && (
                <div className="mt-2">
                  <img
                    src={watchedValues.cnicFront}
                    alt="CNIC Front"
                    className="w-32 h-20 object-cover rounded"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block font-medium mb-1">CNIC Back Side</label>
              <input
                type="file"
                onChange={handleCnicBackUpload}
                className="file-input file-input-bordered w-full"
                accept="image/*"
              />
              {watchedValues.cnicBack && (
                <div className="mt-2">
                  <img
                    src={watchedValues.cnicBack}
                    alt="CNIC Back"
                    className="w-32 h-20 object-cover rounded"
                  />
                </div>
              )}
            </div>

            {/* NTN */}
            <div>
              <label className="block font-medium mb-1">NTN#</label>
              <input
                type="text"
                placeholder="Enter Number"
                {...register("ntn")}
                className="input input-bordered w-full"
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
                  <input
                    type="file"
                    onChange={handleSignatureImageUpload}
                    className="file-input file-input-bordered w-full md:w-1/2"
                    accept="image/*"
                  />
                  <Button
                    onClick={handleAddSignature}
                    className="mt-4 md:w-1/8"
                    shape="info"
                    disabled={!signatureImage}
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
            {/* Phone Numbers Section - required */}
            <div className="mb-8 border-l-4 border-accent p-4 bg-base-100 rounded-md shadow-sm">
              <h3 className="text-xl font-semibold mb-4">
                Phone Numbers <span className="text-error">*</span>
              </h3>
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
                  value={phoneStatus}
                  onChange={(e) => {
                    setPhoneStatus(
                      e.target.value as "Ptcl" | "Mobile" | "Whatsapp",
                    );
                  }}
                  className="select select-bordered w-full"
                >
                  <option value="Ptcl">Ptcl</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Whatsapp">Whatsapp</option>
                </select>
                <button
                  onClick={handleAddPhone}
                  className="btn btn-info w-full"
                  disabled={!phoneNumber}
                >
                  Add
                </button>
              </div>
              {watchedValues.phones.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Phone Number</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {watchedValues.phones.map((phone, index) => (
                        <tr key={index}>
                          <td>{phone.number}</td>
                          <td>{phone.status}</td>
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
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Addresses Section - required */}
            <div className="mb-8 border-l-4 border-accent p-4 bg-base-100 rounded-md shadow-sm">
              <h3 className="text-xl font-semibold mb-4">
                Address <span className="text-error">*</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    placeholder="Address Text"
                    value={addressText}
                    onChange={(e) => {
                      setAddressText(e.target.value);
                    }}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={openMapSelector}
                    className="btn btn-secondary w-full"
                  >
                    Select on Map
                  </button>
                  <button
                    onClick={handleAddAddress}
                    className="btn btn-info w-full"
                    disabled={!addressText}
                  >
                    Add
                  </button>
                </div>
              </div>
              {watchedValues.addresses.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Address</th>
                        <th>Map</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {watchedValues.addresses.map((address, index) => (
                        <tr key={index}>
                          <td>{address.text}</td>
                          <td>
                            {address.map && (
                              <a
                                href={address.map}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link link-primary"
                              >
                                View on Map
                              </a>
                            )}
                          </td>
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

            {/* SMS Send Pattern */}
            <div className="mb-8 p-4 bg-base-100 rounded-md shadow-sm">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  checked={smsEnabled}
                  onChange={() => {
                    setSmsEnabled(!smsEnabled);
                  }}
                  className="checkbox mr-2"
                />
                <h3 className="text-xl font-semibold">SMS Send Pattern</h3>
              </div>

              {smsEnabled && (
                <div className="pl-6 mt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium mb-2">
                        Frequency
                      </label>
                      <select
                        value={smsFrequency}
                        onChange={(e) => {
                          setSmsFrequency(
                            e.target.value as
                              | "Daily"
                              | "Weekly"
                              | "Monthly"
                              | "Yearly",
                          );
                        }}
                        className="select select-bordered w-full"
                      >
                        {smsFrequencyOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium mb-2">Send Via</label>
                      <select
                        value={smsVia}
                        onChange={(e) => {
                          setSmsVia(e.target.value);
                        }}
                        className="select select-bordered w-full"
                      >
                        {smsViaOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Other Images */}
            <div className="mb-8 p-4 bg-base-100 rounded-md shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Other Images</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="md:col-span-2">
                  <input
                    type="file"
                    onChange={handleOtherImageUpload}
                    className="file-input file-input-bordered w-full"
                    accept="image/*"
                  />
                </div>
                <button
                  onClick={handleAddOtherImage}
                  className="btn btn-info w-full"
                  disabled={!otherImage}
                >
                  Add Image
                </button>
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
                  <label className="text-sm font-medium mb-1 block">
                    Due Date
                  </label>
                  <input
                    type="date"
                    placeholder="Due Date"
                    value={chequeDueDate}
                    onChange={(e) => {
                      setChequeDueDate(e.target.value);
                    }}
                    className="input input-bordered w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Cheque Details
                  </label>
                  <input
                    type="text"
                    placeholder="Cheque Details"
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
                  <input
                    type="file"
                    onChange={handleChequeImageUpload}
                    className="file-input file-input-bordered w-full"
                    accept="image/*"
                  />
                </div>

                <div className="md:col-span-3 flex justify-start mt-2">
                  {chequeImage && (
                    <div className="flex-shrink-0 mr-4">
                      <img
                        src={chequeImage}
                        alt="Cheque"
                        className="w-24 h-16 object-cover rounded"
                      />
                    </div>
                  )}
                  <button
                    onClick={handleAddCheque}
                    className="btn btn-info"
                    disabled={!chequeDueDate || !chequeDetails}
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
                        <th>Due Date</th>
                        <th>Details</th>
                        <th>Image</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(watchedValues.postDatedCheques ?? []).map(
                        (cheque, index) => (
                          <tr key={index}>
                            <td>{cheque.dueDate}</td>
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
            {customers.length > 0 && (
              <button onClick={openSmsModal} className="btn btn-primary">
                Send SMS to Selected
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>A/C Title</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Route</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, index) => (
                  <tr key={index}>
                    <td>{customer.customerName}</td>
                    <td>{customer.acTitle}</td>
                    <td>
                      {customer.phones.length > 0
                        ? customer.phones[0]?.number
                        : "-"}
                    </td>
                    <td>
                      {customer.addresses.length > 0
                        ? customer.addresses[0]?.text
                        : "-"}
                    </td>
                    <td>{customer.route}</td>
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

      {/* Map Modal */}
      {showMap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg w-full max-w-3xl">
            <h3 className="text-xl font-bold mb-4">Select Location</h3>

            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search for a location"
                  value={mapSearchQuery}
                  onChange={(e) => {
                    setMapSearchQuery(e.target.value);
                  }}
                  className="input input-bordered flex-grow"
                />
                <button onClick={handleMapSearch} className="btn btn-primary">
                  Search
                </button>
              </div>
            </div>

            {/* Embedded Google Map */}
            <div className="h-96 w-full mb-4 bg-gray-200 flex items-center justify-center">
              <iframe
                title="Google Maps"
                width="100%"
                height="100%"
                src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(mapSearchQuery || "Pakistan")}`}
                allowFullScreen
              ></iframe>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={closeMapSelector} className="btn btn-outline">
                Cancel
              </button>
              <button
                onClick={handleMapSearch}
                className="btn btn-primary"
                disabled={!mapSearchQuery}
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SMS Modal */}
      {showSmsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg w-full max-w-2xl">
            <h3 className="text-xl font-bold mb-4">Send SMS to Customers</h3>

            <div className="mb-4">
              <label className="block font-medium mb-1">Select Customers</label>
              <div className="max-h-60 overflow-y-auto border rounded p-2">
                {customers.map((customer, index) => (
                  <div key={index} className="form-control">
                    <label className="label cursor-pointer justify-start gap-2">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={selectedCustomerIndexes.includes(index)}
                        onChange={() => {
                          toggleCustomerSelection(index);
                        }}
                      />
                      <span className="label-text">
                        {customer.customerName} (
                        {customer.phones?.length > 0
                          ? customer.phones[0]?.number
                          : "No phone"}
                        )
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block font-medium mb-1">Send Via</label>
              <select
                value={smsVia}
                onChange={(e) => {
                  setSmsVia(e.target.value);
                }}
                className="select select-bordered w-full"
              >
                {smsViaOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={closeSmsModal} className="btn btn-outline">
                Cancel
              </button>
              <button
                onClick={handleSendSms}
                className="btn btn-primary"
                disabled={selectedCustomerIndexes.length === 0}
              >
                Send SMS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
