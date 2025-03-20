import { useState } from "react";
import { notify } from "../../lib/notify";

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
}

// SMS Template interface
interface SmsTemplate {
  id: number;
  name: string;
  content: string;
}

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

  // SMS related states
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [selectedCustomerIndexes, setSelectedCustomerIndexes] = useState<
    number[]
  >([]);
  const [selectedSmsTemplates, setSelectedSmsTemplates] = useState<number[]>(
    [],
  );
  const [smsVia, setSmsVia] = useState("SMS");

  // Dummy SMS templates
  const smsTemplates: SmsTemplate[] = [
    {
      id: 1,
      name: "Payment Reminder",
      content:
        "Dear customer, this is a gentle reminder to clear your pending payment.",
    },
    {
      id: 2,
      name: "New Offer",
      content:
        "Dear customer, we have a new offer available for you. Contact us for more details.",
    },
    {
      id: 3,
      name: "Order Confirmation",
      content: "Your order has been confirmed and will be delivered soon.",
    },
    {
      id: 4,
      name: "Holiday Notice",
      content:
        "Our office will remain closed on upcoming holidays. Sorry for inconvenience.",
    },
    {
      id: 5,
      name: "Thank You",
      content:
        "Thank you for your recent purchase. We appreciate your business.",
    },
  ];

  // SMS Via options
  const smsViaOptions = ["SMS", "WhatsApp", "Email", "Push Notification"];

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validate required fields for step 1
      if (!customerName || !acTitle || !route) {
        notify.error("Please complete all required fields in Step 1");
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
    if (!phoneNumber) return;
    setPhones([...phones, { number: phoneNumber, status: phoneStatus }]);
    setPhoneNumber("");
    setPhoneStatus("Mobile");
  };

  const handleRemovePhone = (index: number) => {
    setPhones(phones.filter((_, i) => i !== index));
  };

  const handleAddAddress = () => {
    if (!addressText) return;
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
    // Validation remains the same
    if (!customerName || !acTitle || !route) {
      notify.error("Please complete all fields correctly");
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
      creditLimit: Number(creditLimit),
      postDatedCheques,
      ledgerDetails,
      ledgerNumber: Number(ledgerNumber),
      signatures,
      otherImages,
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

    // Reset to step 1
    setCurrentStep(1);

    notify.success("Customer saved successfully.");
  };

  const handleEdit = (index: number) => {
    const customer = customers.find((_, i) => i === index);
    if (!customer) return;
    setCustomerName(customer.customerName);
    setAcTitle(customer.acTitle);
    setDealingPerson(customer.dealingPerson);
    setReference(customer.reference);
    setCnicFront(customer.cnicFront);
    setCnicBack(customer.cnicBack);
    setNtn(customer.ntn);
    setPhones(customer.phones);
    setAddresses(customer.addresses);
    setRoute(customer.route);
    setCreditLimit(customer.creditLimit.toString());
    setPostDatedCheques(customer.postDatedCheques);
    setLedgerDetails(customer.ledgerDetails);
    setSignatures(customer.signatures);
    setLedgerNumber(customer.ledgerNumber.toString());
    setOtherImages(customer.otherImages || []);
    setEditingIndex(index);

    // Reset to step 1 when editing
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

  // SMS related functions
  const openSmsModal = () => {
    setShowSmsModal(true);
    setSelectedCustomerIndexes([]);
    setSelectedSmsTemplates([]);
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

  const toggleSmsTemplateSelection = (id: number) => {
    if (selectedSmsTemplates.includes(id)) {
      setSelectedSmsTemplates(selectedSmsTemplates.filter((i) => i !== id));
    } else {
      setSelectedSmsTemplates([...selectedSmsTemplates, id]);
    }
  };

  const handleSendSms = () => {
    if (
      selectedCustomerIndexes.length === 0 ||
      selectedSmsTemplates.length === 0
    ) {
      notify.error("Please select customers and messages to send");
      return;
    }

    // Get customer names for display in success message
    const customerNames = selectedCustomerIndexes.map(
      (index) => customers.find((_, i) => i === index)?.customerName,
    );
    const messageCount = selectedSmsTemplates.length;

    // In a real app, you would send SMS here

    notify.success(
      `${messageCount} messages sent to ${customerNames.join(", ")} via ${smsVia}`,
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
            {/* Basic Information */}
            <div>
              <label className="block font-medium mb-1">Customer Name</label>
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
            <div>
              <label className="block font-medium mb-1">A/C Title</label>
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
            <div>
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

            {/* Route */}
            <div>
              <label className="block font-medium mb-1">Route</label>
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
                placeholder="Enter Ledger Details"
                onChange={(e) => {
                  setLedgerNumber(e.target.value);
                }}
                className="input input-bordered w-full"
              />
            </div>

            {/* Ledger Details */}
            <div>
              <label className="block font-medium mb-1">Ledger Details</label>
              <textarea
                value={ledgerDetails}
                placeholder="Enter Ledger Details"
                onChange={(e) => {
                  setLedgerDetails(e.target.value);
                }}
                className="textarea textarea-bordered w-full"
              />
            </div>

            {/* Signature Section */}
            <div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-semibold mb-2">Signature</h3>
                <div className="flex gap-4 flex-wrap mb-2">
                  <div className="flex-1">
                    <input
                      type="file"
                      onChange={handleSignatureImageUpload}
                      className="file-input file-input-bordered w-full"
                      accept="image/*"
                    />
                  </div>
                  <button onClick={handleAddSignature} className="btn btn-info">
                    Add Signature
                  </button>
                </div>
                {signatures.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="table w-full">
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
                                className="btn btn-sm btn-error"
                              >
                                Remove
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
          <div>
            {/* Phone Numbers Section */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Phone Numbers</h3>
              <div className="flex gap-4 mb-2 flex-wrap">
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                  }}
                  className="input input-bordered"
                />
                <select
                  value={phoneStatus}
                  onChange={(e) => {
                    setPhoneStatus(
                      e.target.value as "Ptcl" | "Mobile" | "Whatsapp",
                    );
                  }}
                  className="select select-bordered"
                >
                  <option value="Ptcl">Ptcl</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Whatsapp">Whatsapp</option>
                </select>
                <button onClick={handleAddPhone} className="btn btn-info">
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
                              className="btn btn-sm btn-error"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Addresses Section */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Address</h3>
              <div className="mb-2 flex gap-4 flex-wrap">
                <input
                  type="text"
                  placeholder="Address Text"
                  value={addressText}
                  onChange={(e) => {
                    setAddressText(e.target.value);
                  }}
                  className="input input-bordered"
                />
                <input
                  type="text"
                  placeholder="Map Address (URL)"
                  value={addressMap}
                  onChange={(e) => {
                    setAddressMap(e.target.value);
                  }}
                  className="input input-bordered"
                />
                <button onClick={handleAddAddress} className="btn btn-info">
                  Add Address
                </button>
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
                              className="btn btn-sm btn-error"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Other Images */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Other Images</h3>
              <div className="flex gap-4 mb-2">
                <div className="flex-1">
                  <input
                    type="file"
                    onChange={handleOtherImageUpload}
                    className="file-input file-input-bordered w-full"
                    accept="image/*"
                  />
                </div>
                <button onClick={handleAddOtherImage} className="btn btn-info">
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
                              className="btn btn-sm btn-error"
                            >
                              Remove
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
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Post-dated Cheques</h3>
              <div className="flex gap-4 flex-wrap mb-2">
                <input
                  type="date"
                  placeholder="Due Date"
                  value={chequeDueDate}
                  onChange={(e) => {
                    setChequeDueDate(e.target.value);
                  }}
                  className="input input-bordered"
                />
                <input
                  type="text"
                  placeholder="Cheque Details"
                  value={chequeDetails}
                  onChange={(e) => {
                    setChequeDetails(e.target.value);
                  }}
                  className="input input-bordered"
                />
                <div>
                  <input
                    type="file"
                    onChange={handleChequeImageUpload}
                    className="file-input file-input-bordered w-full"
                    accept="image/*"
                  />
                </div>
                <button onClick={handleAddCheque} className="btn btn-info">
                  Add Cheque
                </button>
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
                              className="btn btn-sm btn-error"
                            >
                              Remove
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

        {/* Navigation buttons */}
        <div className="mt-6 flex justify-between">
          {currentStep === 2 && (
            <button onClick={handlePrevStep} className="btn btn-secondary">
              Back
            </button>
          )}
          {currentStep === 1 && (
            <button onClick={handleNextStep} className="btn btn-accent ml-auto">
              Next
            </button>
          )}
          {currentStep === 2 && (
            <button onClick={handleSave} className="btn btn-info">
              {editingIndex !== null ? "Update Customer" : "Save Customer"}
            </button>
          )}
          {currentStep === 1 && <div></div>}
        </div>
      </div>

      {customers.length > 0 && (
        <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Customer List</h3>
            <button onClick={openSmsModal} className="btn btn-info">
              Send SMS
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="table w-full bg-base-200 rounded-lg shadow-md">
              <thead>
                <tr className="bg-base-300 text-base-content text-center">
                  <th>#</th>
                  <th>Customer Name</th>
                  <th>A/C Title</th>
                  <th>Route</th>
                  <th>Credit Limit</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, index) => (
                  <tr
                    key={index}
                    className="border-b border-base-300 text-center"
                  >
                    <td>{index + 1}</td>
                    <td>{customer.customerName}</td>
                    <td>{customer.acTitle}</td>
                    <td>{customer.route}</td>
                    <td>{customer.creditLimit}</td>
                    <td className="flex justify-center gap-2">
                      <button
                        onClick={() => {
                          handleEdit(index);
                        }}
                        className="btn btn-sm btn-secondary"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          handleDelete(index);
                        }}
                        className="btn btn-sm btn-error"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SMS Modal */}
      {showSmsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-200 p-6 rounded-lg shadow-lg w-full max-w-3xl">
            <h3 className="text-xl font-bold mb-4">Send SMS to Customers</h3>

            <div className="mb-4">
              <label className="block font-medium mb-2">Select SMS Via</label>
              <select
                className="select select-bordered w-full"
                value={smsVia}
                onChange={(e) => {
                  setSmsVia(e.target.value);
                }}
              >
                {smsViaOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block font-medium mb-2">Select Customers</label>
              <div className="bg-base-100 p-2 rounded-lg max-h-40 overflow-y-auto">
                {customers.map((customer, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      className="checkbox mr-2"
                      checked={selectedCustomerIndexes.includes(index)}
                      onChange={() => {
                        toggleCustomerSelection(index);
                      }}
                    />
                    <span>{customer.customerName}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block font-medium mb-2">
                Select Message Templates
              </label>
              <div className="bg-base-100 p-2 rounded-lg max-h-60 overflow-y-auto">
                {smsTemplates.map((template) => (
                  <div key={template.id} className="mb-2">
                    <div className="flex items-center mb-1">
                      <input
                        type="checkbox"
                        className="checkbox mr-2"
                        checked={selectedSmsTemplates.includes(template.id)}
                        onChange={() => {
                          toggleSmsTemplateSelection(template.id);
                        }}
                      />
                      <span className="font-medium">{template.name}</span>
                    </div>
                    <p className="text-sm pl-6 text-gray-600">
                      {template.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={closeSmsModal} className="btn btn-ghost">
                Cancel
              </button>
              <button
                onClick={handleSendSms}
                className="btn btn-info"
                disabled={
                  selectedCustomerIndexes.length === 0 ||
                  selectedSmsTemplates.length === 0
                }
              >
                Send Messages
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customer;
