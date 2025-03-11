import { useState } from "react";

const TruckInformation = () => {
    const [trucks, setTrucks] = useState<
        { truckNumber: string; defaultDriver: string; defaultRoute: string; truckType: string }[]
    >([]);
    const [truckNumber, setTruckNumber] = useState("");
    const [defaultDriver, setDefaultDriver] = useState("");
    const [defaultRoute, setDefaultRoute] = useState("Karachi - Lahore");
    const [truckType, setTruckType] = useState("MBnCO");
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const routes = [
        "Karachi - Lahore",
        "Lahore - Islamabad",
        "Islamabad - Peshawar",
        "Quetta - Karachi",
        "Faisalabad - Multan",
        "Multan - Hyderabad",
        "Sialkot - Rawalpindi"
    ];

    // Save Truck Information
    const handleSaveTruck = () => {
        if (truckNumber.trim() === "" || defaultDriver.trim() === "" || !truckType) return;

        if (editingIndex !== null) {
            const updatedTrucks = [...trucks];
            updatedTrucks[editingIndex] = { truckNumber, defaultDriver, defaultRoute, truckType };
            setTrucks(updatedTrucks);
            setEditingIndex(null);
        } else {
            setTrucks([...trucks, { truckNumber, defaultDriver, defaultRoute, truckType }]);
        }

        setTruckNumber("");
        setDefaultDriver("");
        setDefaultRoute("Karachi - Lahore");
        setTruckType("MBnCO");
    };

    // Edit Truck
    const handleEditTruck = (index: number) => {
        const truck = trucks[index];
        setTruckNumber(truck.truckNumber);
        setDefaultDriver(truck.defaultDriver);
        setDefaultRoute(truck.defaultRoute);
        setTruckType(truck.truckType);
        setEditingIndex(index);
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Truck Information</h2>

            {/* Truck Information Form */}
            <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Truck Number" value={truckNumber} onChange={(e) => setTruckNumber(e.target.value)} className="input input-bordered w-full" />
                    <input type="text" placeholder="Default Driver" value={defaultDriver} onChange={(e) => setDefaultDriver(e.target.value)} className="input input-bordered w-full" />
                    <select value={defaultRoute} onChange={(e) => setDefaultRoute(e.target.value)} className="select select-bordered w-full">
                        {routes.map((route, index) => (
                            <option key={index} value={route}>{route}</option>
                        ))}
                    </select>

                    {/* Truck Type Radio Buttons */}
                    <div className="flex gap-4 items-center">
                        <label className="flex items-center space-x-2">
                            <input type="radio" name="truckType" value="MBnCO" checked={truckType === "MBnCO"} onChange={() => setTruckType("MBnCO")} className="radio" />
                            <span>MBnCO</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input type="radio" name="truckType" value="Outsource" checked={truckType === "Outsource"} onChange={() => setTruckType("Outsource")} className="radio" />
                            <span>Outsource</span>
                        </label>
                    </div>
                </div>
                <button onClick={handleSaveTruck} className="btn btn-primary mt-4">
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
                                        <button onClick={() => handleEditTruck(index)} className="btn btn-sm btn-warning">
                                            Edit
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
