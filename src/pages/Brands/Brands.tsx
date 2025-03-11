import { useState } from "react";

const Brands = () => {
    const [brands, setBrands] = useState<{
        name: string;
        shortCode: string;
        kgPerBag: number;
        commission: number;
        lessCommission: boolean;
        taxType: string;
        routeShortCode: string;
        freight: number;
        givenToTruck: number;
    }[]>([]);

    const [brandName, setBrandName] = useState("");
    const [brandShortCode, setBrandShortCode] = useState("");
    const [kgPerBag, setKgPerBag] = useState<number | null>(null);
    const [commission, setCommission] = useState<number | null>(null);
    const [lessCommission, setLessCommission] = useState(false);
    const [taxType, setTaxType] = useState("");
    const [routeShortCode, setRouteShortCode] = useState("");
    const [freight, setFreight] = useState<number | null>(null);
    const [givenToTruck, setGivenToTruck] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // Dummy Data
    const taxTypes = ["WHT", "GST", "Sales Tax"];
    const routeShortCodes = ["RTE001", "RTE002", "RTE003", "RTE004"];

    // Save or Update Brand
    const handleSaveBrand = () => {
        if (brandName.trim() === "" || brandShortCode.trim() === "" || !kgPerBag || !commission || taxType === "" || routeShortCode === "" || !freight || !givenToTruck) return;

        const newBrand = {
            name: brandName,
            shortCode: brandShortCode,
            kgPerBag,
            commission,
            lessCommission,
            taxType,
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

        // Reset Fields
        setBrandName("");
        setBrandShortCode("");
        setKgPerBag(null);
        setCommission(null);
        setLessCommission(false);
        setTaxType("");
        setRouteShortCode("");
        setFreight(null);
        setGivenToTruck(null);
    };

    // Edit Brand
    const handleEditBrand = (index: number) => {
        const brand = brands[index];
        setBrandName(brand.name);
        setBrandShortCode(brand.shortCode);
        setKgPerBag(brand.kgPerBag);
        setCommission(brand.commission);
        setLessCommission(brand.lessCommission);
        setTaxType(brand.taxType);
        setRouteShortCode(brand.routeShortCode);
        setFreight(brand.freight);
        setGivenToTruck(brand.givenToTruck);
        setEditingIndex(index);
    };

    // Filtered brands based on search query
    const filteredBrands = brands.filter((brand) =>
        brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.shortCode.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

            {/* Form */}
            <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Brand Name & Short Code */}
                    <input
                        type="text"
                        placeholder="Brand Name"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        className="input input-bordered w-full"
                    />
                    <input
                        type="text"
                        placeholder="Brand Short Code"
                        value={brandShortCode}
                        onChange={(e) => setBrandShortCode(e.target.value)}
                        className="input input-bordered w-full"
                    />

                    {/* KG per Bag & Commission per Bag */}
                    <input
                        type="number"
                        placeholder="KG per Bag"
                        value={kgPerBag ?? ""}
                        onChange={(e) => setKgPerBag(e.target.value ? parseFloat(e.target.value) : null)}
                        className="input input-bordered w-full"
                    />
                    <input
                        type="number"
                        placeholder="Commission per Bag"
                        value={commission ?? ""}
                        onChange={(e) => setCommission(e.target.value ? parseFloat(e.target.value) : null)}
                        className="input input-bordered w-full"
                    />

                    {/* Less Commission Checkbox */}
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={lessCommission}
                            onChange={(e) => setLessCommission(e.target.checked)}
                            className="checkbox"
                        />
                        At Purchase Time Less Commission
                    </label>

                    {/* Tax Type Dropdown */}
                    <select
                        value={taxType}
                        onChange={(e) => setTaxType(e.target.value)}
                        className="select select-bordered w-full"
                    >
                        <option value="">Select Applicable Tax</option>
                        {taxTypes.map((tax, index) => (
                            <option key={index} value={tax}>
                                {tax}
                            </option>
                        ))}
                    </select>

                    {/* Route Short Code, Freight & Given to Truck */}
                    <select
                        value={routeShortCode}
                        onChange={(e) => setRouteShortCode(e.target.value)}
                        className="select select-bordered w-full"
                    >
                        <option value="">Select Route Short Code</option>
                        {routeShortCodes.map((route, index) => (
                            <option key={index} value={route}>
                                {route}
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        placeholder="Freight"
                        value={freight ?? ""}
                        onChange={(e) => setFreight(e.target.value ? parseFloat(e.target.value) : null)}
                        className="input input-bordered w-full"
                    />

                    <input
                        type="number"
                        placeholder="Given to Truck"
                        value={givenToTruck ?? ""}
                        onChange={(e) => setGivenToTruck(e.target.value ? parseFloat(e.target.value) : null)}
                        className="input input-bordered w-full"
                    />
                </div>

                <button onClick={handleSaveBrand} className="btn btn-primary mt-4">
                    {editingIndex !== null ? "Update Brand" : "Save Brand"}
                </button>
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
                                    <td>{brand.taxType}</td>
                                    <td>{brand.routeShortCode}</td>
                                    <td>{brand.freight}</td>
                                    <td>{brand.givenToTruck}</td>
                                    <td>
                                        <button onClick={() => handleEditBrand(index)} className="btn btn-sm btn-warning">
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
