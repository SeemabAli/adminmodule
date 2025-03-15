import { useState } from "react";
import { notify } from "@/lib/notify.tsx";

interface Truck {
    truckNumber: string;
    defaultDriver: string;
    defaultRoute: string;
    truckType: string;
}

const TruckInformation = () => {
    const [trucks, setTrucks] = useState<Truck[]>([]);
    const [formData, setFormData] = useState<Truck>({
        truckNumber: "",
        defaultDriver: "",
        defaultRoute: "Karachi - Lahore",
        truckType: "MBnCO",
    });
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const routes = [
        "Karachi - Lahore",
        "Lahore - Islamabad",
        "Islamabad - Peshawar",
        "Quetta - Karachi",
        "Faisalabad - Multan",
        "Multan - Hyderabad",
        "Sialkot - Rawalpindi",
    ];

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Save or update truck information
    const handleSaveTruck = () => {
        const { truckNumber, defaultDriver, truckType } = formData;

        if (!truckNumber.trim() || !defaultDriver.trim() || !truckType) {
            notify.error("All fields are required!");
            return;
        }

        if (editingIndex !== null) {
            const updatedTrucks = [...trucks];
            updatedTrucks[editingIndex] = formData;
            setTrucks(updatedTrucks);
            setEditingIndex(null);
        } else {
            setTrucks([...trucks, formData]);
        }

        resetForm();
    };

    // Edit truck details
    const handleEditTruck = (index: number) => {
        setFormData(trucks[index]);
        setEditingIndex(index);
    };

    // Delete truck entry
    const handleDeleteTruck = (index: number) => {
        notify.confirmDelete(() => {
            setTrucks((prev) => prev.filter((_, i) => i !== index));
            notify.success("Truck deleted successfully!");
        });
    };


    // Reset form fields
    const resetForm = () => {
        setFormData({ truckNumber: "", defaultDriver: "", defaultRoute: "Karachi - Lahore", truckType: "MBnCO" });
        setEditingIndex(null);
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Truck Information</h2>

            {/* Truck Information Form */}
            <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block mb-1 font-medium">
                        Truck Number
                        <input
                            type="text"
                            name="truckNumber"
                            placeholder="Truck Number"
                            value={formData.truckNumber}
                            onChange={handleChange}
                            className="input input-bordered w-full"
                        />
                    </label>
                    <label className="block mb-1 font-medium">
                        Driver Name
                        <input
                            type="text"
                            name="defaultDriver"
                            placeholder="Default Driver"
                            value={formData.defaultDriver}
                            onChange={handleChange}
                            className="input input-bordered w-full"
                        />
                    </label>
                    <label className="block mb-1 font-medium">
                        Route
                        <select
                            name="defaultRoute"
                            value={formData.defaultRoute}
                            onChange={handleChange}
                            className="select select-bordered w-full"
                        >
                            {routes.map((route, index) => (
                                <option key={index} value={route}>
                                    {route}
                                </option>
                            ))}
                        </select>
                    </label>

                    {/* Truck Type Radio Buttons */}
                    <div className="flex gap-4 items-center">
                        <label className="flex items-center space-x-2">
                            <input
                                type="radio"
                                name="truckType"
                                value="MBnCO"
                                checked={formData.truckType === "MBnCO"}
                                onChange={handleChange}
                                className="radio"
                            />
                            <span>MBnCO</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="radio"
                                name="truckType"
                                value="Outsource"
                                checked={formData.truckType === "Outsource"}
                                onChange={handleChange}
                                className="radio"
                            />
                            <span>Outsource</span>
                        </label>
                    </div>
                </div>
                <button onClick={handleSaveTruck} className="btn btn-info mt-4">
                    {editingIndex !== null ? "Update Truck" : "Save Truck"}
                </button>
            </div>

            {/* Truck Information Table */}
            {trucks.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="table w-full bg-base-200 rounded-lg shadow-md">
                        <thead>
                            <tr className="bg-base-300 text-base-content text-center">
                                <th className="p-3">#</th>
                                <th className="p-3">Truck Number</th>
                                <th className="p-3">Default Driver</th>
                                <th className="p-3">Default Route</th>
                                <th className="p-3">Truck Type</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trucks.map((truck, index) => (
                                <tr key={index} className="border-b border-base-300 text-center">
                                    <td className="p-3">{index + 1}</td>
                                    <td className="p-3">{truck.truckNumber}</td>
                                    <td className="p-3">{truck.defaultDriver}</td>
                                    <td className="p-3">{truck.defaultRoute}</td>
                                    <td className="p-3">{truck.truckType}</td>
                                    <td className="p-3">
                                        <button onClick={() => handleEditTruck(index)} className="btn btn-sm btn-secondary mr-2">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDeleteTruck(index)} className="btn btn-sm btn-error">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-500 text-center">No trucks added yet.</p>
            )}
        </div>
    );
};

export default TruckInformation;
