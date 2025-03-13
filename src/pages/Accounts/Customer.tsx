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
    signatures: Signature[];
}

const Customer = () => {
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
    const [phoneStatus, setPhoneStatus] = useState<"Ptcl" | "Mobile" | "Whatsapp">("Mobile");
    const [addresses, setAddresses] = useState<{ text: string; map: string }[]>([]);
    const [addressText, setAddressText] = useState("");
    const [addressMap, setAddressMap] = useState("");
    const [route, setRoute] = useState("");
    const [creditLimit, setCreditLimit] = useState("");
    const [postDatedCheques, setPostDatedCheques] = useState<PostDatedCheque[]>([]);
    const [signatures, setSignatures] = useState<Signature[]>([]);
    const [chequeDueDate, setChequeDueDate] = useState("");
    const [signatureImage, setSignatureImage] = useState("");
    const [chequeDetails, setChequeDetails] = useState("");
    const [chequeImage, setChequeImage] = useState("");
    const [ledgerDetails, setLedgerDetails] = useState("");
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

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
        setPostDatedCheques([...postDatedCheques, { dueDate: chequeDueDate, details: chequeDetails, image: chequeImage }]);
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
        if (!customerName || !acTitle || !route) {
            notify.error("Please compelete all fields correctly");
            return;
        };

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
            signatures
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
        setSignatures([]);

        notify.success("Customer added");
    };

    const handleEdit = (index: number) => {
        const customer = customers[index];
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
        setSignatures(customer.signatures || []);
        setEditingIndex(index);
    };

    const handleDelete = (index: number) => {
        setCustomers((prev) => prev.filter((_, i) => i !== index));
    };

    const handleCnicFrontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setCnicFront(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCnicBackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setCnicBack(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChequeImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setChequeImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSignatureImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setSignatureImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">{editingIndex !== null ? "Edit Customer" : "Customer Management"}</h2>

            <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Information */}
                <div>
                    <label className="block font-medium mb-1">Customer Name</label>
                    <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="input input-bordered w-full" />
                </div>
                <div>
                    <label className="block font-medium mb-1">A/C Title</label>
                    <input type="text" value={acTitle} onChange={(e) => setAcTitle(e.target.value)} className="input input-bordered w-full" />
                </div>
                <div>
                    <label className="block font-medium mb-1">Dealing Person</label>
                    <input type="text" value={dealingPerson} onChange={(e) => setDealingPerson(e.target.value)} className="input input-bordered w-full" />
                </div>
                <div>
                    <label className="block font-medium mb-1">Reference</label>
                    <input type="text" value={reference} onChange={(e) => setReference(e.target.value)} className="input input-bordered w-full" />
                </div>

                {/* CNIC Images */}
                <div>
                    <label className="block font-medium mb-1">CNIC Front Side</label>
                    <input type="file" onChange={handleCnicFrontUpload} className="file-input file-input-bordered w-full" accept="image/*" />
                    {cnicFront && (
                        <div className="mt-2">
                            <img src={cnicFront} alt="CNIC Front" className="w-32 h-20 object-cover rounded" />
                        </div>
                    )}
                </div>
                <div>
                    <label className="block font-medium mb-1">CNIC Back Side</label>
                    <input type="file" onChange={handleCnicBackUpload} className="file-input file-input-bordered w-full" accept="image/*" />
                    {cnicBack && (
                        <div className="mt-2">
                            <img src={cnicBack} alt="CNIC Back" className="w-32 h-20 object-cover rounded" />
                        </div>
                    )}
                </div>

                {/* NTN */}
                <div>
                    <label className="block font-medium mb-1">NTN#</label>
                    <input type="text" value={ntn} onChange={(e) => setNtn(e.target.value)} className="input input-bordered w-full" />
                </div>

                {/* Route */}
                <div>
                    <label className="block font-medium mb-1">Route</label>
                    <input type="text" value={route} onChange={(e) => setRoute(e.target.value)} className="input input-bordered w-full" />
                </div>

                {/* Credit Limit */}
                <div>
                    <label className="block font-medium mb-1">Credit Limit</label>
                    <input
                        type="number"
                        value={creditLimit}
                        onChange={(e) => setCreditLimit(e.target.value)}
                        className="input input-bordered w-full"
                    />
                </div>

                {/* Ledger Details */}
                <div>
                    <label className="block font-medium mb-1">Ledger Details</label>
                    <textarea
                        value={ledgerDetails}
                        onChange={(e) => setLedgerDetails(e.target.value)}
                        className="textarea textarea-bordered w-full"
                    />
                </div>

                {/* Signature Section */}
                <div>
                    <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-semibold mb-2">Signatures</h3>
                    <div className="flex gap-4 flex-wrap mb-2">
                        <div className="flex-1">
                            <input
                                type="file"
                                onChange={handleSignatureImageUpload}
                                className="file-input file-input-bordered w-full"
                                accept="image/*"
                            />
                        </div>
                        <button onClick={handleAddSignature} className="btn btn-info">Add Signature</button>
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
                                                    <img src={signature.image} alt="Signature" className="w-16 h-12 object-cover rounded" />
                                                )}
                                            </td>
                                            <td>
                                                <button onClick={() => handleRemoveSignature(index)} className="btn btn-sm btn-error">Remove</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    </div>
                </div>

                {/* Phone Numbers Section */}
                <div className="md:col-span-2">
                    <h3 className="text-xl font-semibold mb-2">Phone Numbers</h3>
                    <div className="flex gap-4 mb-2 flex-wrap">
                        <input
                            type="text"
                            placeholder="Phone Number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="input input-bordered"
                        />
                        <select
                            value={phoneStatus}
                            onChange={(e) => setPhoneStatus(e.target.value as "Ptcl" | "Mobile" | "Whatsapp")}
                            className="select select-bordered"
                        >
                            <option value="Ptcl">Ptcl</option>
                            <option value="Mobile">Mobile</option>
                            <option value="Whatsapp">Whatsapp</option>
                        </select>
                        <button onClick={handleAddPhone} className="btn btn-info">Add</button>
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
                                                <button onClick={() => handleRemovePhone(index)} className="btn btn-sm btn-error">Remove</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Addresses Section */}
                <div className="md:col-span-2">
                    <h3 className="text-xl font-semibold mb-2">Address</h3>
                    <div className="mb-2 flex gap-4 flex-wrap">
                        <input
                            type="text"
                            placeholder="Address Text"
                            value={addressText}
                            onChange={(e) => setAddressText(e.target.value)}
                            className="input input-bordered"
                        />
                        <input
                            type="text"
                            placeholder="Map Address (URL)"
                            value={addressMap}
                            onChange={(e) => setAddressMap(e.target.value)}
                            className="input input-bordered"
                        />
                        <button onClick={handleAddAddress} className="btn btn-info">Add Address</button>
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
                                                    <a href={address.map} target="_blank" rel="noopener noreferrer" className="link link-primary">
                                                        View on Map
                                                    </a>
                                                )}
                                            </td>
                                            <td>
                                                <button onClick={() => handleRemoveAddress(index)} className="btn btn-sm btn-error">Remove</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Post-dated Cheques Section */}
                <div className="md:col-span-2">
                    <h3 className="text-xl font-semibold mb-2">Post-dated Cheques</h3>
                    <div className="flex  gap-4 flex-wrap mb-2">
                        <input
                            type="date"
                            placeholder="Due Date"
                            value={chequeDueDate}
                            onChange={(e) => setChequeDueDate(e.target.value)}
                            className="input input-bordered"
                        />
                        <input
                            type="text"
                            placeholder="Cheque Details"
                            value={chequeDetails}
                            onChange={(e) => setChequeDetails(e.target.value)}
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
                        <button onClick={handleAddCheque} className="btn btn-info">Add Cheque</button>
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
                                                    <img src={cheque.image} alt="Cheque" className="w-16 h-12 object-cover rounded" />
                                                )}
                                            </td>
                                            <td>
                                                <button onClick={() => handleRemoveCheque(index)} className="btn btn-sm btn-error">Remove</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="md:col-span-2">
                    <button onClick={handleSave} className="btn btn-info">
                        {editingIndex !== null ? "Update Customer" : "Save Customer"}
                    </button>
                </div>
            </div>

            {customers.length > 0 && (
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
                                <tr key={index} className="border-b border-base-300 text-center">
                                    <td>{index + 1}</td>
                                    <td>{customer.customerName}</td>
                                    <td>{customer.acTitle}</td>
                                    <td>{customer.route}</td>
                                    <td>{customer.creditLimit}</td>
                                    <td className="flex justify-center gap-2">
                                        <button onClick={() => handleEdit(index)} className="btn btn-sm btn-secondary">Edit</button>
                                        <button onClick={() => handleDelete(index)} className="btn btn-sm btn-error">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Customer;