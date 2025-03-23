import { useState } from "react";
import { notify } from "../../../lib/notify";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
import { Button } from "@/common/components/ui/Button";

interface Phone {
  number: string;
  status: "Ptcl" | "Mobile" | "Whatsapp";
}

interface PostDatedCheque {
  dueDate: string;
  details: string;
  image: string;
}

interface Signature {
  image: string;
}

interface Customer {
  customerName: string;
  acTitle: string;
  dealingPerson: string;
  reference: string;
  cnicFront: string;
  cnicBack: string;
  ntn: string;
  phones: Phone[];
  addresses: { text: string; map: string }[];
  route: string;
  creditLimit: number;
  postDatedCheques: PostDatedCheque[];
  ledgerDetails: string;
  ledgerNumber: number;
  signatures: Signature[];
  otherImages: string[];
  smsPattern?: {
    enabled: boolean;
    frequency: "Daily" | "Weekly" | "Monthly" | "Yearly";
    via: string;
  };
}

// SMS Via options
const smsViaOptions = ["SMS", "WhatsApp", "Email", "Push Notification"];
const smsFrequencyOptions = ["Daily", "Weekly", "Monthly", "Yearly"];

const Customer = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [acTitle, setAcTitle] = useState("");
  const [dealingPerson, setDealingPerson] = useState("");
  const [reference, setReference] = useState("");
  const [cnicFront, setCnicFront] = useState("");
  const [cnicBack, setCnicBack] = useState("");
  const [ntn, setNtn] = useState("");
  const [phones, setPhones] = useState<Phone[]>([]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneStatus, setPhoneStatus] = useState<
    "Ptcl" | "Mobile" | "Whatsapp"
  >("Mobile");
  const [addresses, setAddresses] = useState<{ text: string; map: string }[]>(
    [],
  );
  const [addressText, setAddressText] = useState("");
  const [addressMap, setAddressMap] = useState("");
  const [route, setRoute] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [postDatedCheques, setPostDatedCheques] = useState<PostDatedCheque[]>(
    [],
  );
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [chequeDueDate, setChequeDueDate] = useState("");
  const [signatureImage, setSignatureImage] = useState("");
  const [chequeDetails, setChequeDetails] = useState("");
  const [chequeImage, setChequeImage] = useState("");
  const [ledgerDetails, setLedgerDetails] = useState("");
  const [ledgerNumber, setLedgerNumber] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [otherImages, setOtherImages] = useState<string[]>([]);
  const [otherImage, setOtherImage] = useState("");

  // Map state
  const [showMap, setShowMap] = useState(false);
  const [mapSearchQuery, setMapSearchQuery] = useState("");

  // SMS Pattern state
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [smsFrequency, setSmsFrequency] = useState<
    "Daily" | "Weekly" | "Monthly" | "Yearly"
  >("Monthly");
  const [smsVia, setSmsVia] = useState("SMS");

  // For sending SMS to existing customers
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [selectedCustomerIndexes, setSelectedCustomerIndexes] = useState<
    number[]
  >([]);

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validate only required fields for step 1
      if (!customerName || !acTitle || !route) {
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
    setPhones([...phones, { number: phoneNumber, status: phoneStatus }]);
    setPhoneNumber("");
    setPhoneStatus("Mobile");
  };

  const handleRemovePhone = (index: number) => {
    setPhones(phones.filter((_, i) => i !== index));
  };

  const handleAddAddress = () => {
    if (!addressText) {
      notify.error("Please enter an address");
      return;
    }
    setAddresses([...addresses, { text: addressText, map: addressMap }]);
    setAddressText("");
    setAddressMap("");
  };

  const handleRemoveAddress = (index: number) => {
    setAddresses(addresses.filter((_, i) => i !== index));
  };

  const handleAddCheque = () => {
    if (!chequeDueDate || !chequeDetails) return;
    setPostDatedCheques([
      ...postDatedCheques,
      { dueDate: chequeDueDate, details: chequeDetails, image: chequeImage },
    ]);
    setChequeDueDate("");
    setChequeDetails("");
    setChequeImage("");
  };

  const handleAddSignature = () => {
    if (!signatureImage) return;
    setSignatures([...signatures, { image: signatureImage }]);
    setSignatureImage("");
  };

  const handleRemoveSignature = (index: number) => {
    setSignatures(signatures.filter((_, i) => i !== index));
  };

  const handleRemoveCheque = (index: number) => {
    setPostDatedCheques(postDatedCheques.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Validate only required fields
    if (!customerName || !acTitle || !route) {
      notify.error(
        "Please complete all required fields: Customer Name, A/C Title, and Route",
      );
      return;
    }

    // Validate phone number if entered
    if (phoneNumber && phones.length === 0) {
      notify.error("Please add the phone number or clear the field");
      return;
    }

    // Validate address if entered
    if (addressText && addresses.length === 0) {
      notify.error("Please add the address or clear the field");
      return;
    }

    const newCustomer: Customer = {
      customerName,
      acTitle,
      dealingPerson,
      reference,
      cnicFront,
      cnicBack,
      ntn,
      phones,
      addresses,
      route,
      creditLimit: Number(creditLimit) || 0,
      postDatedCheques,
      ledgerDetails,
      ledgerNumber: Number(ledgerNumber) || 0,
      signatures,
      otherImages,
      smsPattern: smsEnabled
        ? {
            enabled: smsEnabled,
            frequency: smsFrequency,
            via: smsVia,
          }
        : undefined,
    };

    if (editingIndex !== null) {
      const updatedCustomers = [...customers];
      updatedCustomers[editingIndex] = newCustomer;
      setCustomers(updatedCustomers);
      setEditingIndex(null);
    } else {
      setCustomers([...customers, newCustomer]);
    }

    // Reset all form fields
    resetForm();
    notify.success("Customer saved successfully.");
  };

  const resetForm = () => {
    setCustomerName("");
    setAcTitle("");
    setDealingPerson("");
    setReference("");
    setCnicFront("");
    setCnicBack("");
    setNtn("");
    setPhones([]);
    setAddresses([]);
    setRoute("");
    setCreditLimit("");
    setPostDatedCheques([]);
    setLedgerDetails("");
    setLedgerNumber("");
    setSignatures([]);
    setOtherImages([]);
    setSmsEnabled(false);
    setSmsFrequency("Monthly");
    setSmsVia("SMS");

    // Reset to step 1
    setCurrentStep(1);
  };

  const handleEdit = (index: number) => {
    const customer = customers[index];
    if (!customer) return;

    setCustomerName(customer.customerName);
    setAcTitle(customer.acTitle);
    setDealingPerson(customer.dealingPerson || "");
    setReference(customer.reference || "");
    setCnicFront(customer.cnicFront || "");
    setCnicBack(customer.cnicBack || "");
    setNtn(customer.ntn || "");
    setPhones(customer.phones || []);
    setAddresses(customer.addresses || []);
    setRoute(customer.route);
    setCreditLimit(customer.creditLimit ? customer.creditLimit.toString() : "");
    setPostDatedCheques(customer.postDatedCheques || []);
    setLedgerDetails(customer.ledgerDetails || "");
    setSignatures(customer.signatures || []);
    setLedgerNumber(
      customer.ledgerNumber ? customer.ledgerNumber.toString() : "",
    );
    setOtherImages(customer.otherImages || []);

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
    notify.success("Customer loaded for editing.");
  };

  const handleDelete = (index: number) => {
    notify.confirmDelete(() => {
      setCustomers((prev) => prev.filter((_, i) => i !== index));
      notify.success("Customer deleted successfully.");
    });
  };

  const handleCnicFrontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setCnicFront(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCnicBackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setCnicBack(reader.result as string);
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
    setOtherImages([...otherImages, otherImage]);
    setOtherImage("");
    notify.success("Image added successfully!");
  };

  const handleRemoveOtherImage = (index: number) => {
    setOtherImages(otherImages.filter((_, i) => i !== index));
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
    // In a real implementation, this would use the Google Maps API to search for the location
    // and update the addressMap state with the coordinates
    // For now, we'll just simulate this behavior
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
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                }}
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
                value={acTitle}
                onChange={(e) => {
                  setAcTitle(e.target.value);
                }}
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
                value={route}
                onChange={(e) => {
                  setRoute(e.target.value);
                }}
                className="input input-bordered w-full"
              />
            </div>

            {/* Optional Fields */}
            <div className="pt-2">
              <label className="block font-medium mb-1">Dealing Person</label>
              <input
                type="text"
                placeholder="Enter Name"
                value={dealingPerson}
                onChange={(e) => {
                  setDealingPerson(e.target.value);
                }}
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Reference</label>
              <input
                type="text"
                placeholder="Enter Name"
                value={reference}
                onChange={(e) => {
                  setReference(e.target.value);
                }}
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
              {cnicFront && (
                <div className="mt-2">
                  <img
                    src={cnicFront}
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
              {cnicBack && (
                <div className="mt-2">
                  <img
                    src={cnicBack}
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
                value={ntn}
                onChange={(e) => {
                  setNtn(e.target.value);
                }}
                className="input input-bordered w-full"
              />
            </div>

            {/* Credit Limit */}
            <div>
              <label className="block font-medium mb-1">Credit Limit</label>
              <input
                type="number"
                placeholder="Enter Credit Limit"
                value={creditLimit}
                onChange={(e) => {
                  setCreditLimit(e.target.value);
                }}
                className="input input-bordered w-full"
              />
            </div>

            {/* Ledger Number */}
            <div>
              <label className="block font-medium mb-1">Ledger Number</label>
              <input
                type="text"
                value={ledgerNumber}
                placeholder="Enter Ledger Number"
                onChange={(e) => {
                  setLedgerNumber(e.target.value);
                }}
                className="input input-bordered w-full"
              />
            </div>

            {/* Ledger Details */}
            <div className="md:col-span-2">
              <label className="block font-medium mb-1">Ledger Details</label>
              <textarea
                value={ledgerDetails}
                placeholder="Enter Ledger Details"
                onChange={(e) => {
                  setLedgerDetails(e.target.value);
                }}
                className="textarea textarea-bordered w-full"
                rows={3}
              />
            </div>

            {/* Signature Section */}
            <div className="md:col-span-2">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold mb-2">Signature</h3>
                <div className="flex-1 flex flex-col">
                  {" "}
                  {/* Use flex-col to stack elements vertically */}
                  <input
                    type="file"
                    onChange={handleSignatureImageUpload}
                    className="file-input file-input-bordered w-full md:w-1/2"
                    accept="image/*"
                  />
                  <Button
                    onClick={handleAddSignature}
                    className="mt-4 md:w-1/8 "
                    shape="info"
                    disabled={!signatureImage}
                  >
                    Add Signature
                  </Button>
                </div>

                {signatures.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="table w-1/4">
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {signatures.map((signature, index) => (
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
                        ))}
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
              {phones.length > 0 && (
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
                      {phones.map((phone, index) => (
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
              {addresses.length > 0 && (
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
                      {addresses.map((address, index) => (
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
              {otherImages.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {otherImages.map((image, index) => (
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

              {postDatedCheques.length > 0 && (
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
                      {postDatedCheques.map((cheque, index) => (
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
                      ))}
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
            <button className="btn btn-success" onClick={handleSave}>
              {editingIndex !== null ? "Update" : "Save"}
            </button>
          )}
        </div>
      </div>

      {/* Customers List */}
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

export default Customer;
