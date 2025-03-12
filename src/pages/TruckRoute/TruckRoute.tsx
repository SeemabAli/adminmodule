import { useState } from "react";

const TruckRoute = () => {
    const [routes, setRoutes] = useState<{
        name: string;
        shortCode: string;
    }[]>([]);

    const [routeName, setRouteName] = useState("");
    const [routeShortCode, setRouteShortCode] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // Save or Update Route
    const handleSaveRoute = () => {
        if (routeName.trim() === "" || routeShortCode.trim() === "") return;

        const newRoute = {
            name: routeName,
            shortCode: routeShortCode,
        };

        if (editingIndex !== null) {
            const updatedRoutes = [...routes];
            updatedRoutes[editingIndex] = newRoute;
            setRoutes(updatedRoutes);
            setEditingIndex(null);
        } else {
            setRoutes([...routes, newRoute]);
        }

        // Reset Fields
        setRouteName("");
        setRouteShortCode("");
    };

    // Edit Route
    const handleEditRoute = (index: number) => {
        const route = routes[index];
        setRouteName(route.name);
        setRouteShortCode(route.shortCode);
        setEditingIndex(index);
    };

    // Filtered routes based on search query
    const filteredRoutes = routes.filter((route) =>
        route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.shortCode.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Truck Routes Management</h2>

            {/* Search Bar */}
            <input
                type="text"
                placeholder="Search by Route Name or Short Code"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-bordered w-full mb-4"
            />

            {/* Form */}
            <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Route Name & Short Code */}
                    <label className="block mb-1 font-medium">Salary
                    <input
                        type="text"
                        placeholder="Route Name"
                        value={routeName}
                        onChange={(e) => setRouteName(e.target.value)}
                        className="input input-bordered w-full"
                    />
                    </label>
                    <label className="block mb-1 font-medium">Salary
                    <input
                        type="text"
                        placeholder="Route Short Code"
                        value={routeShortCode}
                        onChange={(e) => setRouteShortCode(e.target.value)}
                        className="input input-bordered w-full"
                    />
                    </label>
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
                                <th>#</th>
                                <th>Route Name</th>
                                <th>Short Code</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRoutes.map((route, index) => (
                                <tr key={index} className="border-b border-base-300 text-center">
                                    <td>{index + 1}</td>
                                    <td>{route.name}</td>
                                    <td>{route.shortCode}</td>
                                    <td>
                                        <button onClick={() => handleEditRoute(index)} className="btn btn-sm btn-warning">
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-500 text-center">No routes added yet.</p>
            )}
        </div>
    );
};

export default TruckRoute;
