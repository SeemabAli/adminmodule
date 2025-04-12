/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
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
import { fetchAllRoutes } from "../DeliveryRoutes/route.service";
import type { DeliveryRoute } from "../DeliveryRoutes/deliveryRoute.schema";
import { uploadImage } from "@/common/services/upload.service";
import { X, Eye } from "lucide-react";
import { handleErrorNotification } from "@/utils/exceptions";

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
  const [signatureImageFile, setSignatureImageFile] = useState<File | null>(
    null,
  );
  const [otherImageFile, setOtherImageFile] = useState<File | null>(null);

  // Image previews
  const [cnicFrontPreview, setCnicFrontPreview] = useState("");
  const [cnicBackPreview, setCnicBackPreview] = useState("");
  const [chequePreview, setChequePreview] = useState("");
  const [signatureImagePreview, setSignatureImagePreview] = useState("");
  const [otherImagePreview, setOtherImagePreview] = useState("");

  // Notification preference state
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [notificationFrequency, setNotificationFrequency] = useState<
    "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
  >("MONTHLY");
  const [notificationChannel, setNotificationChannel] = useState<
    "SMS" | "WHATSAPP" | "EMAIL" | "PUSH"
  >("WHATSAPP");

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(
    null,
  );

  // Handle image file selections
  const handleCnicFrontSelected = (file: File) => {
    if (!file || !(file instanceof File) || file.size === 0) {
      notify.error("Invalid file selected");
      return;
    }

    // Clear previous preview if it exists
    if (cnicFrontPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(cnicFrontPreview);
    }

    try {
      const objectUrl = URL.createObjectURL(file);
      setCnicFrontFile(file);
      setCnicFrontPreview(objectUrl);
      logger.info(
        `CNIC front image selected: ${file.name}, size: ${file.size}, type: ${file.type}`,
      );
    } catch (error) {
      logger.error("Error creating URL for CNIC front image:", error);
      handleErrorNotification(error, "CNIC front image");
    }
  };

  const handleCnicBackSelected = (file: File) => {
    if (!file || !(file instanceof File) || file.size === 0) {
      notify.error("Invalid file selected");
      return;
    }

    // Clear previous preview if it exists
    if (cnicBackPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(cnicBackPreview);
    }

    try {
      const objectUrl = URL.createObjectURL(file);
      setCnicBackFile(file);
      setCnicBackPreview(objectUrl);
      logger.info(
        `CNIC back image selected: ${file.name}, size: ${file.size}, type: ${file.type}`,
      );
    } catch (error) {
      logger.error("Error creating URL for CNIC back image:", error);
      handleErrorNotification(error, "CNIC back image");
    }
  };

  const handleChequeSelected = (file: File) => {
    if (!file || !(file instanceof File) || file.size === 0) {
      notify.error("Invalid file selected");
      return;
    }

    // Clear previous preview if it exists
    if (chequePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(chequePreview);
    }

    try {
      const objectUrl = URL.createObjectURL(file);
      setChequeFile(file);
      setChequePreview(objectUrl);
      logger.info(
        `Cheque image selected: ${file.name}, size: ${file.size}, type: ${file.type}`,
      );
    } catch (error) {
      logger.error("Error creating URL for cheque image:", error);
      handleErrorNotification(error, "Cheque image");
    }
  };

  const handleSignatureImageSelected = (file: File) => {
    if (!file || !(file instanceof File) || file.size === 0) {
      notify.error("Invalid file selected");
      return;
    }

    // Clear previous preview if it exists
    if (signatureImagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(signatureImagePreview);
    }

    try {
      const objectUrl = URL.createObjectURL(file);
      setSignatureImageFile(file);
      setSignatureImagePreview(objectUrl);
      logger.info(
        `Signature image selected: ${file.name}, size: ${file.size}, type: ${file.type}`,
      );
    } catch (error) {
      logger.error("Error creating URL for signature image:", error);
      handleErrorNotification(error, "Signature image");
    }
  };

  const handleOtherImageSelected = (file: File) => {
    if (!file || !(file instanceof File) || file.size === 0) {
      notify.error("Invalid file selected");
      return;
    }

    // Clear previous preview if it exists
    if (otherImagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(otherImagePreview);
    }

    try {
      const objectUrl = URL.createObjectURL(file);
      setOtherImageFile(file);
      setOtherImagePreview(objectUrl);
      logger.info(
        `Other image selected: ${file.name}, size: ${file.size}, type: ${file.type}`,
      );
    } catch (error) {
      logger.error("Error creating URL for other image:", error);
      handleErrorNotification(error, "Other image");
    }
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
        reference: "",
        ntnNumber: "",
        creditLimit: 1,
        ledgerDetails: "",
        ledgerNumber: "",
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
    if (!chequeDate || !chequeDetails) {
      notify.error("Please provide cheque date and details");
      return;
    }

    try {
      // Upload cheque image if exists
      let imagePath = "";
      if (chequeFile && chequeFile instanceof File && chequeFile.size > 0) {
        logger.info(
          `Uploading cheque image: ${chequeFile.name}, size: ${chequeFile.size}, type: ${chequeFile.type}`,
        );

        const uploadResponse = await uploadImage(chequeFile);

        // Validate response
        if (!uploadResponse?.path) {
          notify.error("Failed to get image path from upload");
          return;
        }

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
          image: imagePath || undefined,
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
      handleErrorNotification(error, "Cheque");
      logger.error("Cheque upload error:", error);
    }
  };

  const handleRemoveCheque = (index: number) => {
    const currentCheques = [...(watchedValues.postDatedCheques ?? [])];
    currentCheques.splice(index, 1);
    setValue("postDatedCheques", currentCheques);
  };

  const handleAddSignature = async () => {
    if (
      !signatureImageFile ||
      !(signatureImageFile instanceof File) ||
      signatureImageFile.size === 0
    ) {
      notify.error("Please select a valid signature image first");
      return;
    }

    try {
      logger.info(
        `Uploading signature: ${signatureImageFile.name}, size: ${signatureImageFile.size}, type: ${signatureImageFile.type}`,
      );

      // Upload the file first
      const uploadResponse = await uploadImage(signatureImageFile);

      // Validate response
      if (!uploadResponse?.path) {
        notify.error("Failed to get image path from upload");
        return;
      }

      // Add signature to the form
      setValue("signatureImage", uploadResponse.path);

      // Reset state
      setSignatureImageFile(null);
      if (signatureImagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(signatureImagePreview);
      }
      setSignatureImagePreview("");

      notify.success("Signature added successfully");
    } catch (error) {
      handleErrorNotification(error, "Signature");
      logger.error("Signature upload error:", error);
    }
  };

  const handleAddOtherImage = async () => {
    if (
      !otherImageFile ||
      !(otherImageFile instanceof File) ||
      otherImageFile.size === 0
    ) {
      notify.error("Please select a valid image first");
      return;
    }

    try {
      logger.info(
        `Uploading other image: ${otherImageFile.name}, size: ${otherImageFile.size}, type: ${otherImageFile.type}`,
      );

      // Upload the file first
      const uploadResponse = await uploadImage(otherImageFile);

      // Validate response
      if (!uploadResponse?.path) {
        notify.error("Failed to get image path from upload");
        return;
      }

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
      handleErrorNotification(error, "Image");
      logger.error("Image upload error:", error);
    }
  };

  const handleSave = async (formData: ICustomer) => {
    try {
      // Create a copy of formData to modify
      const customerData = { ...formData };

      // The CNIC images should now be already uploaded before saving
      // No need to upload them again here, just use the values from the form

      // Add notification preference if enabled
      if (notificationEnabled) {
        customerData.notificationPreference = {
          frequency: notificationFrequency,
          channel: notificationChannel,
        };
      } else {
        customerData.notificationPreference = undefined;
      }

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
      handleErrorNotification(error, "Customer");
      logger.error("Customer save error:", error);
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
    setSignatureImageFile(null);
    setOtherImageFile(null);

    // Clean up preview URLs
    if (cnicFrontPreview?.startsWith("blob:"))
      URL.revokeObjectURL(cnicFrontPreview);
    if (cnicBackPreview?.startsWith("blob:"))
      URL.revokeObjectURL(cnicBackPreview);
    if (chequePreview?.startsWith("blob:")) URL.revokeObjectURL(chequePreview);
    if (signatureImagePreview?.startsWith("blob:"))
      URL.revokeObjectURL(signatureImagePreview);
    if (otherImagePreview?.startsWith("blob:"))
      URL.revokeObjectURL(otherImagePreview);

    // Reset preview states
    setCnicFrontPreview("");
    setCnicBackPreview("");
    setChequePreview("");
    setSignatureImagePreview("");
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
    setValue("reference", customer.reference || "");
    setValue("ntnNumber", customer.ntnNumber || "");
    setValue("creditLimit", customer.creditLimit || 0);
    setValue("ledgerDetails", customer.ledgerDetails || "");
    setValue("ledgerNumber", customer.ledgerNumber || "");
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

  const handleCancelEdit = () => {
    setEditingIndex(null);
    reset(); // Reset form fields
    if (currentStep !== 1) {
      setCurrentStep(1); // Optionally return to first step
    }
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
        handleErrorNotification(error, "Customer");
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
      if (signatureImagePreview?.startsWith("blob:"))
        URL.revokeObjectURL(signatureImagePreview);
      if (otherImagePreview?.startsWith("blob:"))
        URL.revokeObjectURL(otherImagePreview);
    };
  }, [
    cnicFrontPreview,
    cnicBackPreview,
    chequePreview,
    signatureImagePreview,
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
        handleErrorNotification(error, "Routes");
      }
    };
    void loadRoutes();
  }, []);

  const handleViewCustomer = (customer: ICustomer) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  };

  // Customer Detail Modal component
  const CustomerDetailModal = () => {
    if (!selectedCustomer) return null;

    return (
      <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] bg-opacity-60 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-base-100 p-4 border-b flex justify-between items-center z-10">
            <h2 className="text-2xl font-bold text-primary">
              {selectedCustomer.fullName}
            </h2>
            <button
              onClick={() => {
                setShowDetailModal(false);
              }}
              className="btn btn-sm btn-circle btn-ghost"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            {/* Customer ID Card Style Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <div className="card bg-base-200 shadow-sm">
                  <div className="card-body">
                    <h3 className="card-title border-b pb-2 mb-3 text-secondary">
                      Personal Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Full Name:</span>
                        <span>{selectedCustomer.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Account Title:</span>
                        <span>{selectedCustomer.accountTitle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Reference</span>
                        <span>{selectedCustomer.reference || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Reference:</span>
                        <span>{selectedCustomer.reference || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">NTN Number:</span>
                        <span>{selectedCustomer.ntnNumber || "-"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card bg-base-200 shadow-sm">
                  <div className="card-body">
                    <h3 className="card-title border-b pb-2 mb-3 text-secondary">
                      Financial Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Credit Limit:</span>
                        <span>{selectedCustomer.creditLimit || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Ledger Number:</span>
                        <span>{selectedCustomer.ledgerNumber || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Ledger Details:</span>
                        <span className="text-right">
                          {selectedCustomer.ledgerDetails || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phone Numbers */}
                <div className="card bg-base-200 shadow-sm">
                  <div className="card-body">
                    <h3 className="card-title border-b pb-2 mb-3 text-secondary">
                      Phone Numbers
                    </h3>
                    {selectedCustomer.phoneNumbers &&
                    selectedCustomer.phoneNumbers.length > 0 ? (
                      <div className="space-y-2">
                        {selectedCustomer.phoneNumbers.map((phone, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-2 bg-base-100 rounded"
                          >
                            <span>{phone.number}</span>
                            <span className="badge badge-success">
                              {phone.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No phone numbers</p>
                    )}
                  </div>
                </div>

                {/* Addresses */}
                <div className="card bg-base-200 shadow-sm">
                  <div className="card-body">
                    <h3 className="card-title border-b pb-2 mb-3 text-secondary">
                      Addresses
                    </h3>
                    {selectedCustomer.addresses &&
                    selectedCustomer.addresses.length > 0 ? (
                      <div className="space-y-2">
                        {selectedCustomer.addresses.map((address, index) => (
                          <div key={index} className="p-2 bg-base-100 rounded">
                            {address.currentAddress}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No addresses</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Images & Additional Info */}
              <div className="space-y-4">
                {/* CNIC Images */}
                <div className="card bg-base-200 shadow-sm">
                  <div className="card-body">
                    <h3 className="card-title border-b pb-2 mb-3 text-secondary">
                      CNIC Images
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-2 text-accent">
                          Front Side
                        </p>
                        {selectedCustomer.cnicFrontImage ? (
                          <img
                            src={selectedCustomer.cnicFrontImage}
                            alt="CNIC Front"
                            className="w-full h-40 object-contain border rounded-md bg-white"
                          />
                        ) : (
                          <div className="w-full h-40 bg-base-300 rounded-md flex items-center justify-center">
                            <p className="text-gray-500 italic">No image</p>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2 text-accent">
                          Back Side
                        </p>
                        {selectedCustomer.cnicBackImage ? (
                          <img
                            src={selectedCustomer.cnicBackImage}
                            alt="CNIC Back"
                            className="w-full h-40 object-contain border rounded-md bg-white"
                          />
                        ) : (
                          <div className="w-full h-40 bg-base-300 rounded-md flex items-center justify-center">
                            <p className="text-gray-500 italic">No image</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Signatures */}
                <div className="card bg-base-200 shadow-sm">
                  <div className="card-body">
                    <h3 className="card-title border-b pb-2 mb-3 text-secondary">
                      Signatures
                    </h3>
                    {selectedCustomer.signatureImage && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="border rounded-md p-2 bg-white">
                          <img
                            src={selectedCustomer.signatureImage}
                            alt="Signature"
                            className="w-full h-24 object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Other Images */}
                <div className="card bg-base-200 shadow-sm">
                  <div className="card-body">
                    <h3 className="card-title border-b pb-2 mb-3 text-secondary">
                      Other Images
                    </h3>
                    {selectedCustomer.otherImages &&
                    selectedCustomer.otherImages.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {selectedCustomer.otherImages.map((image, index) => (
                          <div
                            key={index}
                            className="border rounded-md p-2 bg-white"
                          >
                            <img
                              src={image}
                              alt={`Other Image ${index + 1}`}
                              className="w-full h-24 object-contain"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No other images</p>
                    )}
                  </div>
                </div>

                {/* Notification Preferences */}
                {selectedCustomer.notificationPreference && (
                  <div className="card bg-base-200 shadow-sm">
                    <div className="card-body">
                      <h3 className="card-title border-b pb-2 mb-3 text-secondary">
                        Notification Preferences
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Frequency:</span>
                          <span>
                            {selectedCustomer.notificationPreference.frequency}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Channel:</span>
                          <span>
                            {selectedCustomer.notificationPreference.channel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Post-Dated Cheques */}
                {selectedCustomer.postDatedCheques &&
                  selectedCustomer.postDatedCheques.length > 0 && (
                    <div className="card bg-base-200 shadow-sm">
                      <div className="card-body">
                        <h3 className="card-title border-b pb-2 mb-3 text-secondary">
                          Post-Dated Cheques
                        </h3>
                        <div className="space-y-4">
                          {selectedCustomer.postDatedCheques.map(
                            (cheque, index) => (
                              <div
                                key={index}
                                className="bg-base-100 p-3 rounded-md"
                              >
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                  <div>
                                    <span className="font-medium block text-sm">
                                      Date:
                                    </span>
                                    <span>{cheque.date}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium block text-sm">
                                      Amount:
                                    </span>
                                    <span>{cheque.amount}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium block text-sm">
                                      Status:
                                    </span>
                                    <span>{cheque.status}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium block text-sm">
                                      Details:
                                    </span>
                                    <span>{cheque.details}</span>
                                  </div>
                                </div>
                                {cheque.image && (
                                  <div className="mt-2 border rounded p-1 bg-white">
                                    <img
                                      src={cheque.image}
                                      alt={`Cheque ${index + 1}`}
                                      className="h-16 object-contain mx-auto"
                                    />
                                  </div>
                                )}
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
                {...register("deliveryRouteId")}
                className="select select-bordered w-full"
                required
              >
                <option value="">Select Route</option>
                {routes.map((route: DeliveryRoute) => (
                  <option key={route.id} value={route.id}>
                    {route.code} - {route.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Optional Fields */}
            <div className="pt-2">
              <label className="block font-medium mb-1">Reference</label>
              <input
                type="text"
                placeholder="Enter Name"
                {...register("reference")}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col">
                <label className="block font-medium mb-1">
                  CNIC Front Side
                </label>
                <div className="flex flex-col space-y-2">
                  {!watchedValues.cnicFrontImage ? (
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-grow">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleCnicFrontSelected(e.target.files[0]);
                              }
                            }}
                            className="file-input file-input-bordered w-full"
                          />
                        </div>
                      </div>
                      {cnicFrontPreview && (
                        <div className="relative inline-block mt-2">
                          <img
                            src={cnicFrontPreview}
                            alt="CNIC Front Preview"
                            className="w-24 h-16 object-cover rounded"
                          />
                          <button
                            className="absolute top-0 right-0 bg-gray-200 rounded-full w-5 h-5 flex items-center justify-center text-gray-700 hover:bg-gray-300"
                            onClick={() => {
                              if (cnicFrontPreview?.startsWith("blob:")) {
                                URL.revokeObjectURL(cnicFrontPreview);
                              }
                              setCnicFrontPreview("");
                              setCnicFrontFile(null);
                            }}
                          >
                            ×
                          </button>
                        </div>
                      )}
                      <div className="flex justify-end mt-1">
                        <Button
                          onClick={async () => {
                            if (
                              cnicFrontFile &&
                              cnicFrontFile instanceof File &&
                              cnicFrontFile.size > 0
                            ) {
                              try {
                                logger.info(
                                  `Uploading CNIC front: ${cnicFrontFile.name}, size: ${cnicFrontFile.size}, type: ${cnicFrontFile.type}`,
                                );
                                const uploadResponse =
                                  await uploadImage(cnicFrontFile);

                                if (uploadResponse?.path) {
                                  setValue(
                                    "cnicFrontImage",
                                    uploadResponse.path,
                                  );
                                  logger.info(
                                    "CNIC front uploaded successfully",
                                    { path: uploadResponse.path },
                                  );
                                  notify.success(
                                    "CNIC front image uploaded successfully",
                                  );

                                  // Clean up preview
                                  if (cnicFrontPreview?.startsWith("blob:")) {
                                    URL.revokeObjectURL(cnicFrontPreview);
                                  }
                                  setCnicFrontPreview("");
                                  setCnicFrontFile(null);
                                } else {
                                  logger.error("Upload response missing path", {
                                    response: uploadResponse,
                                  });
                                  notify.error(
                                    "CNIC front upload failed - no path returned",
                                  );
                                }
                              } catch (error) {
                                logger.error(
                                  "Failed to upload CNIC front image:",
                                  error,
                                );
                                handleErrorNotification(error, "CNIC Front");
                              }
                            } else {
                              notify.error(
                                "Please select a valid CNIC front image first",
                              );
                            }
                          }}
                          className="btn-sm"
                          shape="info"
                          disabled={!cnicFrontFile}
                        >
                          Upload
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 bg-gray-50 p-2 rounded-md">
                      <div className="flex items-center">
                        <img
                          src={watchedValues.cnicFrontImage}
                          alt="CNIC Front"
                          className="w-24 h-16 object-cover rounded"
                        />
                        <span className="text-xs text-gray-500 ml-2">
                          CNIC Front Uploaded
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col">
                <label className="block font-medium mb-1">CNIC Back Side</label>
                <div className="flex flex-col space-y-2">
                  {!watchedValues.cnicBackImage ? (
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-grow">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleCnicBackSelected(e.target.files[0]);
                              }
                            }}
                            className="file-input file-input-bordered w-full"
                          />
                        </div>
                      </div>
                      {cnicBackPreview && (
                        <div className="relative inline-block mt-2">
                          <img
                            src={cnicBackPreview}
                            alt="CNIC Back Preview"
                            className="w-24 h-16 object-cover rounded"
                          />
                          <button
                            className="absolute top-0 right-0 bg-gray-200 rounded-full w-5 h-5 flex items-center justify-center text-gray-700 hover:bg-gray-300"
                            onClick={() => {
                              if (cnicBackPreview?.startsWith("blob:")) {
                                URL.revokeObjectURL(cnicBackPreview);
                              }
                              setCnicBackPreview("");
                              setCnicBackFile(null);
                            }}
                          >
                            ×
                          </button>
                        </div>
                      )}
                      <div className="flex justify-end mt-1">
                        <Button
                          onClick={async () => {
                            if (
                              cnicBackFile &&
                              cnicBackFile instanceof File &&
                              cnicBackFile.size > 0
                            ) {
                              try {
                                logger.info(
                                  `Uploading CNIC back: ${cnicBackFile.name}, size: ${cnicBackFile.size}, type: ${cnicBackFile.type}`,
                                );
                                const uploadResponse =
                                  await uploadImage(cnicBackFile);

                                if (uploadResponse?.path) {
                                  setValue(
                                    "cnicBackImage",
                                    uploadResponse.path,
                                  );
                                  logger.info(
                                    "CNIC back uploaded successfully",
                                    { path: uploadResponse.path },
                                  );
                                  notify.success(
                                    "CNIC back image uploaded successfully",
                                  );

                                  // Clean up preview
                                  if (cnicBackPreview?.startsWith("blob:")) {
                                    URL.revokeObjectURL(cnicBackPreview);
                                  }
                                  setCnicBackPreview("");
                                  setCnicBackFile(null);
                                } else {
                                  logger.error("Upload response missing path", {
                                    response: uploadResponse,
                                  });
                                  notify.error(
                                    "CNIC back upload failed - no path returned",
                                  );
                                }
                              } catch (error) {
                                logger.error(
                                  "Failed to upload CNIC back image:",
                                  error,
                                );
                                handleErrorNotification(error, "CNIC Back");
                              }
                            } else {
                              notify.error(
                                "Please select a valid CNIC back image first",
                              );
                            }
                          }}
                          className="btn-sm"
                          shape="info"
                          disabled={!cnicBackFile}
                        >
                          Upload
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 bg-gray-50 p-2 rounded-md">
                      <div className="flex items-center">
                        <img
                          src={watchedValues.cnicBackImage}
                          alt="CNIC Back"
                          className="w-24 h-16 object-cover rounded"
                        />
                        <span className="text-xs text-gray-500 ml-2">
                          CNIC Back Uploaded
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
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
                {...register("ledgerNumber")}
                className="input input-bordered w-full"
              />
            </div>

            {/* Ledger Details */}
            <div>
              <label className="block font-medium mb-1">Ledger Details</label>
              <textarea
                {...register("ledgerDetails")}
                placeholder="Enter Ledger Details"
                className="textarea textarea-bordered w-full"
                rows={6}
              />
            </div>

            {/* Signatures */}
            <div className="mt-7 p-4 bg-base-100 rounded-md shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Signatures</h3>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-grow">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleSignatureImageSelected(e.target.files[0]);
                        }
                      }}
                      className="file-input file-input-bordered w-full"
                    />
                  </div>
                </div>

                {signatureImagePreview && (
                  <div className="mt-2 bg-gray-50 p-2 rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <img
                          src={signatureImagePreview}
                          alt="Signature Preview"
                          className="w-24 h-16 object-cover rounded"
                        />
                        <span className="text-xs text-gray-500 ml-2">
                          Selected signature
                        </span>
                      </div>
                      <button
                        className="btn btn-circle btn-xs btn-ghost text-error hover:bg-error hover:text-white transition-colors duration-200 flex items-center justify-center"
                        onClick={() => {
                          if (signatureImagePreview?.startsWith("blob:")) {
                            URL.revokeObjectURL(signatureImagePreview);
                          }
                          setSignatureImagePreview("");
                          setSignatureImageFile(null);
                        }}
                      >
                        <span className="text-lg font-bold leading-none pb-1">
                          ×
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {signatureImageFile && (
                  <div className="flex justify-end mt-1">
                    <Button
                      className="btn-sm"
                      shape="info"
                      onClick={handleAddSignature}
                      disabled={!signatureImageFile}
                    >
                      Add Signature
                    </Button>
                  </div>
                )}
              </div>

              {watchedValues.signatureImage && (
                <div className="mt-4">
                  <img
                    src={watchedValues.signatureImage}
                    className="w-32 h-32 object-contain border rounded-md"
                    alt="Signature"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="w-full">
            {/* Phone Numbers Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
              {/* Phone Numbers Section */}
              <div className="border-l-4 border-accent p-4 bg-base-100 rounded-md shadow-sm">
                <h3 className="text-xl font-semibold mb-4">Phone Numbers</h3>
                <div className="flex flex-col md:flex-row gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded text-sm flex-grow"
                  />
                  <select
                    value={phoneType}
                    onChange={(e) => {
                      setPhoneType(
                        e.target.value as "MOBILE" | "PTCL" | "WHATSAPP",
                      );
                    }}
                    className="px-3 py-2 border border-gray-300 rounded text-sm w-36"
                  >
                    <option value="MOBILE">Mobile</option>
                    <option value="PTCL">PTCL</option>
                    <option value="WHATSAPP">WhatsApp</option>
                  </select>
                  <button
                    onClick={handleAddPhone}
                    className="px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed whitespace-nowrap"
                    disabled={!phoneNumber}
                  >
                    Add
                  </button>
                </div>
                {(watchedValues.phoneNumbers ?? []).length > 0 && (
                  <div className="inline-block w-full rounded border border-gray-200 shadow-sm">
                    <table className="border-collapse text-sm w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">
                            Phone Number
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">
                            Type
                          </th>
                          <th className="px-2 py-2 text-center font-medium text-gray-700 border-b w-12">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(watchedValues.phoneNumbers ?? []).map(
                          (phone, index) => (
                            <tr
                              key={index}
                              className="border-b border-gray-100 last:border-b-0"
                            >
                              <td className="px-3 py-1.5 whitespace-nowrap">
                                {phone.number}
                              </td>
                              <td className="px-3 py-1.5 whitespace-nowrap">
                                {phone.type}
                              </td>
                              <td className="px-2 py-1.5 text-center">
                                <button
                                  onClick={() => {
                                    handleRemovePhone(index);
                                  }}
                                  className="inline-flex items-center justify-center p-1 rounded-full hover:bg-red-50"
                                >
                                  <TrashIcon className="w-4 h-4 text-red-500" />
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
              <div className="border-l-4 border-accent p-4 bg-base-100 rounded-md shadow-sm">
                <h3 className="text-xl font-semibold mb-4">Address</h3>
                <div className="flex flex-col md:flex-row gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Current Address"
                    value={currentAddress}
                    onChange={(e) => {
                      setCurrentAddress(e.target.value);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded text-sm flex-grow"
                  />
                  <button
                    onClick={handleAddAddress}
                    className="px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed whitespace-nowrap"
                    disabled={!currentAddress}
                  >
                    Add
                  </button>
                </div>
                {(watchedValues.addresses ?? []).length > 0 && (
                  <div className="inline-block w-full rounded border border-gray-200 shadow-sm">
                    <table className="border-collapse text-sm w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">
                            Address
                          </th>
                          <th className="px-2 py-2 text-center font-medium text-gray-700 border-b w-12">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(watchedValues.addresses ?? []).map(
                          (address, index) => (
                            <tr
                              key={index}
                              className="border-b border-gray-100 last:border-b-0"
                            >
                              <td className="px-3 py-1.5 whitespace-nowrap">
                                {address.currentAddress}
                              </td>
                              <td className="px-2 py-1.5 text-center">
                                <button
                                  onClick={() => {
                                    handleRemoveAddress(index);
                                  }}
                                  className="inline-flex items-center justify-center p-1 rounded-full hover:bg-red-50"
                                >
                                  <TrashIcon className="w-4 h-4 text-red-500" />
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
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-grow">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleOtherImageSelected(e.target.files[0]);
                        }
                      }}
                      className="file-input file-input-bordered lg:w-1/2"
                    />
                  </div>
                </div>

                {otherImagePreview && (
                  <div className="mt-2 bg-gray-50 p-2 rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <img
                          src={otherImagePreview}
                          alt="Image Preview"
                          className="w-24 h-16 object-cover rounded"
                        />
                        <span className="text-xs text-gray-500 ml-2">
                          Selected image
                        </span>
                      </div>
                      <button
                        className="btn btn-circle btn-xs btn-ghost text-error hover:bg-error hover:text-white transition-colors duration-200 flex items-center justify-center"
                        onClick={() => {
                          if (otherImagePreview?.startsWith("blob:")) {
                            URL.revokeObjectURL(otherImagePreview);
                          }
                          setOtherImagePreview("");
                          setOtherImageFile(null);
                        }}
                      >
                        <span className="text-lg font-bold leading-none pb-1">
                          ×
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {otherImageFile && (
                  <div className="flex justify-end mt-1">
                    <Button
                      className="btn-sm"
                      shape="info"
                      onClick={handleAddOtherImage}
                      disabled={!otherImageFile}
                    >
                      Add Image
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {(watchedValues.otherImages ?? []).map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Other Image ${index + 1}`}
                      className="w-full h-32 object-contain border rounded-md"
                    />
                  </div>
                ))}
              </div>
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
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleChequeSelected(e.target.files[0]);
                      }
                    }}
                    className="file-input file-input-bordered w-full"
                  />
                </div>

                <div className="md:col-span-3 flex justify-start mt-2">
                  {chequePreview && (
                    <div className="flex-shrink-0 mr-4 relative">
                      <img
                        src={chequePreview}
                        alt="Cheque"
                        className="w-24 h-16 object-cover rounded"
                      />
                      <button
                        className="btn btn-xs btn-ghost text-error hover:bg-error hover:text-white transition-colors duration-200 absolute -top-2 -right-2 rounded-full w-5 h-5 flex items-center justify-center p-0"
                        onClick={() => {
                          if (chequePreview?.startsWith("blob:")) {
                            URL.revokeObjectURL(chequePreview);
                          }
                          setChequePreview("");
                          setChequeFile(null);
                        }}
                      >
                        <span className="text-lg font-bold leading-none pb-1">
                          ×
                        </span>
                      </button>
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
          <div className="flex gap-2">
            {currentStep === 2 ? (
              <button className="btn btn-primary" onClick={handlePrevStep}>
                Previous
              </button>
            ) : (
              <div></div>
            )}
            {editingIndex !== null && (
              <button className="btn btn-neutral" onClick={handleCancelEdit}>
                Cancel
              </button>
            )}
          </div>
          <div>
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
      </div>

      {/* Customers List - Simplified */}
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
                  <th>Customer Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, index) => (
                  <tr key={index} className="hover cursor-pointer">
                    <td
                      onClick={() => {
                        handleViewCustomer(customer);
                      }}
                    >
                      {customer.fullName}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            handleViewCustomer(customer);
                          }}
                          className="btn-sm btn-ghost text-info"
                        >
                          <Eye size={21} />
                        </button>
                        <button
                          onClick={() => {
                            handleEdit(index);
                          }}
                          className="btn-sm btn-ghost text-success"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            handleDelete(index);
                          }}
                          className="btn-sm btn-ghost text-error"
                        >
                          <TrashIcon className="h-5 w-5" />
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

      {/* Customer Detail Modal */}
      {showDetailModal && <CustomerDetailModal />}
    </div>
  );
};
