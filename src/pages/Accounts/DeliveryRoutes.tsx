import { useState } from "react";
import { notify } from "../../lib/notify";


const DeliveryRoutes = () => {
    const [routes, setRoutes] = useState<{ routeName: string; shortCode: string; haveToll: string; tollType?: string }[]>([]);
    const [routeName, setRouteName] = useState("");
    const [shortCode, setShortCode] = useState("");
    const [haveToll, setHaveToll] = useState("Yes");
    const [tollType, setTollType] = useState("One Way");
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Save or Update Route
    const handleSaveRoute = () => {
        if (routeName.trim() === "" || shortCode.trim() === "") {
            notify.error("Route Name and Short Code are required!");
            return;
        }

        const newRoute = { routeName, shortCode, haveToll, tollType: haveToll === "Yes" ? tollType : undefined };

        if (editingIndex !== null) {
            const updatedRoutes = [...routes];
            updatedRoutes[editingIndex] = newRoute;
            setRoutes(updatedRoutes);
            setEditingIndex(null);
            notify.success("Route updated successfully!");
        } else {
            setRoutes([...routes, newRoute]);
            notify.success("Route added successfully!");
        }

        resetForm();
    };

    // Edit Route
    const handleEditRoute = (index: number) => {
        setRouteName(routes[index].routeName);
        setShortCode(routes[index].shortCode);
        setHaveToll(routes[index].haveToll);
        setTollType(routes[index].tollType || "One Way");
        setEditingIndex(index);
    };

    // Delete Route
    const handleDeleteRoute = (index: number) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this route?");
        if (confirmDelete) {
            setRoutes(routes.filter((_, i) => i !== index));
            notify.success("Route deleted successfully!");
        }
    };

    // Reset Form Fields
    const resetForm = () => {
        setRouteName("");
        setShortCode("");
        setHaveToll("Yes");
        setTollType("One Way");
        setEditingIndex(null);
    };

    // Filter Routes
    const filteredRoutes = routes.filter((route) =>
        route.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.shortCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Delivery Routes</h2>

            {/* Search Bar */}
            <label className="block mb-1 font-medium">
                Search
            <input
                type="text"
                placeholder="Search by Route Name or Short Code"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-bordered w-full mb-4"
            />
        </label>

            {/* Route Form */}
            <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 gap-4">
                    <label className="block mb-1 font-medium">
                        Route Name
                    <input
                        type="text"
                        placeholder="Route Name"
                        value={routeName}
                        onChange={(e) => setRouteName(e.target.value)}
                        className="input input-bordered w-full"
                    />
                    </label>
                    <label className="block mb-1 font-medium">
                        Route Short Code
                    <input
                        type="text"
                        placeholder="Route Short Code"
                        value={shortCode}
                        onChange={(e) => setShortCode(e.target.value)}
                        className="input input-bordered w-full"
                    />
                    </label>

                    {/* Have Toll - Radio Buttons */}
                    <div className="flex gap-4 items-center">
                        Have Toll?
                        <label className="flex items-center space-x-2">
                            <input
                                type="radio"
                                name="haveToll"
                                value="Yes"
                                checked={haveToll === "Yes"}
                                onChange={() => setHaveToll("Yes")}
                                className="radio"
                            />
                            <span>Yes</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="radio"
                                name="haveToll"
                                value="No"
                                checked={haveToll === "No"}
                                onChange={() => setHaveToll("No")}
                                className="radio"
                            />
                            <span>No</span>
                        </label>
                    </div>

                    {/* Toll Type - One Way / Two Way (Only if Toll is Yes) */}
                    {haveToll === "Yes" && (
                        <div className="flex gap-4 items-center">
                            Toll Type:
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="tollType"
                                    value="One Way"
                                    checked={tollType === "One Way"}
                                    onChange={() => setTollType("One Way")}
                                    className="radio"
                                />
                                <span>One Way</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="tollType"
                                    value="Two Way"
                                    checked={tollType === "Two Way"}
                                    onChange={() => setTollType("Two Way")}
                                    className="radio"
                                />
                                <span>Two Way</span>
                            </label>
                        </div>
                    )}
                </div>
                <button onClick={handleSaveRoute} className="btn btn-primary mt-4">
                    {editingIndex !== null ? "Update Route" : "Save Route"}
                </button>
            </div>

            {/* Routes Table */}
            {filteredRoutes.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="table w-full bg-base-200 rounded-lg shadow-md">
                        <thead>
                            <tr className="bg-base-300 text-base-content text-center">
                                <th className="p-3">#</th>
                                <th className="p-3">Route Name</th>
                                <th className="p-3">Short Code</th>
                                <th className="p-3">Have Toll</th>
                                <th className="p-3">Toll Type</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRoutes.map((route, index) => {
                                const actualIndex = routes.findIndex((r) => r.routeName === route.routeName && r.shortCode === route.shortCode);
                                return (
                                    <tr key={index} className="border-b border-base-300 text-center">
                                        <td className="p-3">{index + 1}</td>
                                        <td className="p-3">{route.routeName}</td>
                                        <td className="p-3">{route.shortCode}</td>
                                        <td className="p-3">{route.haveToll}</td>
                                        <td className="p-3">{route.haveToll === "Yes" ? route.tollType : "-"}</td>
                                        <td className="p-3">
                                            <button onClick={() => handleEditRoute(actualIndex)} className="btn btn-sm btn-warning mr-2">
                                                Edit
                                            </button>
                                            <button onClick={() => handleDeleteRoute(actualIndex)} className="btn btn-sm btn-error">
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-500 text-center">No routes found.</p>
            )}
        </div>
    );
};

export default DeliveryRoutes;
