import { useState } from "react";

const DeliveryRoutes = () => {
    const [routes, setRoutes] = useState<{ routeName: string; shortCode: string; haveToll: string }[]>([]);
    const [routeName, setRouteName] = useState("");
    const [shortCode, setShortCode] = useState("");
    const [haveToll, setHaveToll] = useState("Yes");
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Save or Update Route
    const handleSaveRoute = () => {
        if (routeName.trim() === "" || shortCode.trim() === "") return;

        if (editingIndex !== null) {
            const updatedRoutes = [...routes];
            updatedRoutes[editingIndex] = { routeName, shortCode, haveToll };
            setRoutes(updatedRoutes);
            setEditingIndex(null);
        } else {
            setRoutes([...routes, { routeName, shortCode, haveToll }]);
        }

        setRouteName("");
        setShortCode("");
        setHaveToll("Yes");
    };

    // Edit Route
    const handleEditRoute = (index: number) => {
        const route = routes[index];
        setRouteName(route.routeName);
        setShortCode(route.shortCode);
        setHaveToll(route.haveToll);
        setEditingIndex(index);
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
            <input
                type="text"
                placeholder="Search by Route Name or Short Code"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-bordered w-full mb-4"
            />

            {/* Route Form */}
            <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Route Name"
                        value={routeName}
                        onChange={(e) => setRouteName(e.target.value)}
                        className="input input-bordered w-full"
                    />
                    <input
                        type="text"
                        placeholder="Route Short Code"
                        value={shortCode}
                        onChange={(e) => setShortCode(e.target.value)}
                        className="input input-bordered w-full"
                    />

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
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRoutes.map((route, index) => (
                                <tr key={index} className="border-b border-base-300 text-center">
                                    <td className="p-3">{index + 1}</td>
                                    <td className="p-3">{route.routeName}</td>
                                    <td className="p-3">{route.shortCode}</td>
                                    <td className="p-3">{route.haveToll}</td>
                                    <td className="p-3">
                                        <button
                                            onClick={() => handleEditRoute(index)}
                                            className="btn btn-sm btn-warning"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
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
