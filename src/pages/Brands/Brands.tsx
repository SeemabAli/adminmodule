import { useState } from "react";
import { notify } from "../../lib/notify";

const Brands = () => {
    const [brands, setBrands] = useState<{
        name: string;
        shortCode: string;
        kgPerBag: number;
        commission: number;
        lessCommission: boolean;
        taxes: string[];
        routeShortCode: string;
        freight: number;
        givenToTruck: number;
        companyName: string;
    }[]>([]);

    const [brandName, setBrandName] = useState("");
    const [brandShortCode, setBrandShortCode] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [kgPerBag, setKgPerBag] = useState<number | null>(null);
    const [commission, setCommission] = useState<number | null>(null);
    const [lessCommission, setLessCommission] = useState(false);
    const [routeShortCode, setRouteShortCode] = useState("");
    const [freight, setFreight] = useState<number | null>(null);
    const [givenToTruck, setGivenToTruck] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [taxes, setTaxes] = useState<string[]>([]);
    const [step, setStep] = useState(1);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [isInEditMode, setIsInEditMode] = useState(false);

    // Dummy Data
    const taxTypes = ["WHT", "GST", "Sales Tax"];
    const routeShortCodes = ["RTE001", "RTE002", "RTE003", "RTE004"];

    const handleNext = () => {
        if (!companyName || !brandName || !brandShortCode) return;
        setStep(2);
    };

    const handleBack = () => setStep(1);

    // Save or Update Brand
    const handleSaveBrand = () => {
        if (!kgPerBag || !commission ||  routeShortCode === "" || !freight || !givenToTruck) {
          notify.error("Please complete all fields correctly");
          return;  
        };

        const newBrand = {
            name: brandName,
            shortCode: brandShortCode,
            companyName,
            kgPerBag,
            commission,
            lessCommission,
            taxes,
            routeShortCode,
            freight,
            givenToTruck
        };

        if (editingIndex !== null) {
            const updatedBrands = [...brands];
            updatedBrands[editingIndex] = newBrand;
            setBrands(updatedBrands);
            setEditingIndex(null);
        } else {
            setBrands([...brands, newBrand]);
        }

        // Reset Fields & Return to Step 1
        setBrandName("");
        setBrandShortCode("");
        setCompanyName("");
        setKgPerBag(null);
        setCommission(null);
        setLessCommission(false);
        setTaxes([]);
        setRouteShortCode("");
        setFreight(null);
        setGivenToTruck(null);
        setStep(1);
    };

    // Edit Brand
    const handleEditBrand = (index: number) => {
        setIsInEditMode(true);
        const brand = brands[index];
        setBrandName(brand.name);
        setBrandShortCode(brand.shortCode);
        setCompanyName(brand.companyName);
        setKgPerBag(brand.kgPerBag);
        setCommission(brand.commission);
        setLessCommission(brand.lessCommission);
        setTaxes([...brand.taxes])
        setRouteShortCode(brand.routeShortCode);
        setFreight(brand.freight);
        setGivenToTruck(brand.givenToTruck);
        setEditingIndex(index);
        setStep(2);
    };

    // Filtered brands based on search query
    const filteredBrands = brands.filter((brand) =>
        brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.shortCode.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleTaxChange = (tax: string) => {
        setTaxes((prev) =>
            prev.includes(tax) ? prev.filter((t) => t !== tax) : [...prev, tax]
        );
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Brand Management</h2>

            {/* Search Bar */}
            <input
                type="text"
                placeholder="Search by Brand Name or Short Code"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-bordered w-full mb-4"
            />

            <div className="bg-base-200 p-4 rounded-lg shadow-md">
                {step === 1 ? (
                    <>
                        <label className="block mb-1 font-medium" >Company Name</label>
                        <input type="text" placeholder="Enter Company Name" className="input input-bordered w-full mb-2" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />

                        <label className="block mb-1 font-medium">Brand Name</label>
                        <input type="text" placeholder="Enter Brand Name" className="input input-bordered w-full mb-2" value={brandName} onChange={(e) => setBrandName(e.target.value)} />

                        <label className="block mb-1 font-medium">Brand Short Code</label>
                        <input type="text" placeholder="Enter Brand Short Code" className="input input-bordered w-full mb-2" value={brandShortCode} onChange={(e) => setBrandShortCode(e.target.value)} />

                        <button className="btn btn-info mt-4" onClick={handleNext}>Next</button>
                    </>
                ) : (
                    <>
                        <label>KG per Bag</label>
                        <input type="number" placeholder="Enter Weight" className="input input-bordered w-full mb-2" value={kgPerBag ?? ""} onChange={(e) => setKgPerBag(parseFloat(e.target.value))} />

                        <label>Commission per Bag</label>
                        <input type="number" placeholder="Enter Amount" className="input input-bordered w-full mb-2" value={commission ?? ""} onChange={(e) => setCommission(parseFloat(e.target.value))} />

                        <label>Taxes</label>
                        <div className="mb-2">
                            {taxTypes.map((tax) => (
                                <label key={tax} className="flex items-center gap-2">
                                    <input type="checkbox" checked={taxes.includes(tax)} onChange={() => handleTaxChange(tax)} /> {tax}
                                </label>
                            ))}
                        </div>

                        <label>Route Short Code</label>
                        <select className="select select-bordered w-full mb-2" value={routeShortCode} onChange={(e) => setRouteShortCode(e.target.value)}>
                            <option value="">Select Route</option>
                            {routeShortCodes.map((route) => <option key={route} value={route}>{route}</option>)}
                        </select>

                        <label>Freight</label>
                        <input type="number" placeholder="Enter Amount" className="input input-bordered w-full mb-2" value={freight ?? ""} onChange={(e) => setFreight(parseFloat(e.target.value))} />

                        <label>Given to Truck</label>
                        <input type="number" placeholder="Enter Amount" className="input input-bordered w-full mb-2" value={givenToTruck ?? ""} onChange={(e) => setGivenToTruck(parseFloat(e.target.value))} />

                        <div className="flex justify-between mt-4">
                            <button className="btn btn-secondary" onClick={handleBack}>Back</button>
                            <button className="btn btn-info" onClick={handleSaveBrand}>{isInEditMode ? "Update Brand" : "Save Brand"}</button>
                        </div>
                    </>
                )}
            </div>
            {/* Brands Table */}
            {filteredBrands.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="table w-full bg-base-200 rounded-lg shadow-md">
                        <thead>
                            <tr className="bg-base-300 text-base-content text-center">
                                <th>#</th>
                                <th>Brand Name</th>
                                <th>Short Code</th>
                                <th>KG/Bag</th>
                                <th>Commission</th>
                                <th>Tax</th>
                                <th>Route</th>
                                <th>Freight</th>
                                <th>Given to Truck</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBrands.map((brand, index) => (
                                <tr key={index} className="border-b border-base-300 text-center">
                                    <td>{index + 1}</td>
                                    <td>{brand.name}</td>
                                    <td>{brand.shortCode}</td>
                                    <td>{brand.kgPerBag}</td>
                                    <td>{brand.commission}</td>
                                    <td>{brand.taxes.toString()}</td>
                                    <td>{brand.routeShortCode}</td>
                                    <td>{brand.freight}</td>
                                    <td>{brand.givenToTruck}</td>
                                    <td>
                                        <button onClick={() => handleEditBrand(index)} className="btn btn-sm btn-secondary">
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-500 text-center">No brands added yet.</p>
            )}
        </div>
    );
};

export default Brands;