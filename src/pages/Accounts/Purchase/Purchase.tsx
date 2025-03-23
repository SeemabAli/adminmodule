import { notify } from "@/lib/notify";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";

interface Company {
  id: string;
  name: string;
}

interface Truck {
  id: string;
  name: string;
  status: "Company Own" | "Outsource";
}

interface Driver {
  id: string;
  name: string;
}

interface Route {
  id: string;
  name: string;
  companyFreight: number;
  truckFreight: number;
}

interface Brand {
  id: string;
  name: string;
  companyId: string;
}

interface PurchaseItem {
  id: string;
  brandId: string;
  brandName: string;
  routeId: string;
  routeName: string;
  qtyInTon: number;
  bags: number;
  freightPerBag: number;
  totalFreight: number;
  ratePerTon: number;
  ratePerBag: number;
  unitPrice: number;
  totalPrice: number;
  commissionPerBag: number;
  whtTax: number;
}

export const Purchase = () => {
  // Current date formatted as YYYY-MM-DD for input[type="date"]
  const today = new Date().toISOString().split("T")[0];

  // States for form fields
  const [transactionDate, setTransactionDate] = useState(today);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [purchaseOrderId, setPurchaseOrderId] = useState<string>("");
  const [selectedTruck, setSelectedTruck] = useState<string>("");
  const [truckStatus, setTruckStatus] = useState<string>("");
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [customDriver, setCustomDriver] = useState<string>("");
  const [selectedSaleRoute, setSelectedSaleRoute] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedRoute, setSelectedRoute] = useState<string>("");
  const [routeFreight, setRouteFreight] = useState({ company: 0, truck: 0 });

  // States for calculations
  const [qtyInTon, setQtyInTon] = useState<number | null>(null);
  const [bags, setBags] = useState<number | null>(null);
  const [freightPerBag, setFreightPerBag] = useState<number | null>(null);
  const [totalFreight, setTotalFreight] = useState<number | null>(null);
  const [ratePerTon, setRatePerTon] = useState<number | null>(null);
  const [ratePerBag, setRatePerBag] = useState<number | null>(null);
  const [unitPrice, setUnitPrice] = useState<number | null>(null);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [commissionPerBag, setCommissionPerBag] = useState<number | null>(null);
  const [whtTax, setWhtTax] = useState<number | null>(null);

  // Grid state
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Mock data (would be fetched from API in real application)
  const companies: Company[] = [
    { id: "1", name: "PAK CEMENT" },
    { id: "2", name: "DG CEMENT" },
  ];

  const trucks: Truck[] = [
    { id: "1", name: "ABC124", status: "Outsource" },
    { id: "2", name: "XYZ789", status: "Company Own" },
  ];

  const drivers: Driver[] = [
    { id: "1", name: "AAA" },
    { id: "2", name: "BBB" },
  ];

  const routes: Route[] = [
    {
      id: "1",
      name: "CHAK BELLI KHAN",
      companyFreight: 200.0,
      truckFreight: 10.0,
    },
    { id: "2", name: "CHOA ROAD", companyFreight: 150.0, truckFreight: 8.0 },
  ];

  const brands: Brand[] = [
    { id: "1", name: "Cement", companyId: "1" },
    { id: "1", name: "White Cement", companyId: "1" },
    { id: "1", name: "Hard Cement", companyId: "1" },
    { id: "2", name: "Bond", companyId: "2" },
  ];

  // Auto-generate purchase order ID (simple incrementing function for demo)
  useEffect(() => {
    if (selectedCompany) {
      // In a real app, this would come from your backend
      const randomId = Math.floor(100 + Math.random() * 900);
      setPurchaseOrderId(randomId.toString());
    }
  }, [selectedCompany]);

  // Handle truck selection
  const handleTruckChange = (truckId: string) => {
    setSelectedTruck(truckId);
    const truck = trucks.find((t) => t.id === truckId);
    if (truck) {
      setTruckStatus(truck.status);
    }
  };

  // Handle route selection
  const handleRouteChange = (routeId: string) => {
    setSelectedRoute(routeId);
    const route = routes.find((r) => r.id === routeId);
    if (route) {
      setRouteFreight({
        company: route.companyFreight,
        truck: route.truckFreight,
      });
      // Pre-calculate freight per bag if bags are available
      if (bags) {
        const freightPerBag = route.truckFreight / bags;
        setFreightPerBag(freightPerBag);
        setTotalFreight(route.truckFreight);
      }
    }
  };

  // Calculate bags from qty in ton (assuming 1 ton = 20 bags)
  const calculateBags = (tons: number) => {
    const calculatedBags = tons * 20;
    setBags(calculatedBags);

    // Recalculate dependent values
    if (routeFreight.truck) {
      const freightPerBag = routeFreight.truck / calculatedBags;
      setFreightPerBag(freightPerBag);
      setTotalFreight(routeFreight.truck);
    }

    if (ratePerTon !== null) {
      const calculatedRatePerBag = ratePerTon / 20;
      setRatePerBag(calculatedRatePerBag);
      setUnitPrice(calculatedRatePerBag + (freightPerBag ?? 0));
      setTotalPrice(
        calculatedBags * (calculatedRatePerBag + (freightPerBag ?? 0)),
      );
    }
  };

  // Calculate rate per bag from rate per ton
  const calculateRatePerBag = (ratePerTon: number) => {
    const calculatedRatePerBag = ratePerTon / 20;
    setRatePerBag(calculatedRatePerBag);

    // Recalculate dependent values
    setUnitPrice(calculatedRatePerBag + (freightPerBag ?? 0));
    if (bags) {
      setTotalPrice(bags * (calculatedRatePerBag + (freightPerBag ?? 0)));
    }
  };

  // Add or update purchase item in the grid
  const handleAddToGrid = () => {
    if (
      !selectedBrand ||
      !selectedRoute ||
      qtyInTon === null ||
      ratePerTon === null
    ) {
      notify.error("Please fill all required fields.");
      return;
    }

    const brandItem = brands.find((b) => b.id === selectedBrand);
    const routeItem = routes.find((r) => r.id === selectedRoute);

    if (!brandItem || !routeItem) return;

    const purchaseItem: PurchaseItem = {
      id:
        editingIndex !== null
          ? (purchaseItems.find((_, i) => i === editingIndex)?.id ?? "")
          : Date.now().toString(),
      brandId: selectedBrand,
      brandName: brandItem.name,
      routeId: selectedRoute,
      routeName: routeItem.name,
      qtyInTon: qtyInTon || 0,
      bags: bags ?? 0,
      freightPerBag: freightPerBag ?? 0,
      totalFreight: totalFreight ?? 0,
      ratePerTon: ratePerTon,
      ratePerBag: ratePerBag ?? 0,
      unitPrice: unitPrice ?? 0,
      totalPrice: totalPrice ?? 0,
      commissionPerBag: commissionPerBag ?? 0,
      whtTax: whtTax ?? 0,
    };

    if (editingIndex !== null) {
      // Update existing item
      const updatedItems = [...purchaseItems];
      updatedItems[editingIndex] = purchaseItem;
      setPurchaseItems(updatedItems);
      setEditingIndex(null);
    } else {
      // Add new item
      setPurchaseItems([...purchaseItems, purchaseItem]);
    }

    // Reset brand and route specific fields
    setSelectedBrand("");
    setSelectedRoute("");
    setQtyInTon(null);
    setBags(null);
    setFreightPerBag(null);
    setTotalFreight(null);
    setRatePerTon(null);
    setRatePerBag(null);
    setUnitPrice(null);
    setTotalPrice(null);
    setCommissionPerBag(null);
    setWhtTax(null);
  };

  // Edit a purchase item from the grid
  const handleEditItem = (index: number) => {
    const item = purchaseItems.find((_, i) => i === index);
    if (!item) return;
    setSelectedBrand(item.brandId);
    setSelectedRoute(item.routeId);
    setQtyInTon(item.qtyInTon);
    setBags(item.bags);
    setFreightPerBag(item.freightPerBag);
    setTotalFreight(item.totalFreight);
    setRatePerTon(item.ratePerTon);
    setRatePerBag(item.ratePerBag);
    setUnitPrice(item.unitPrice);
    setTotalPrice(item.totalPrice);
    setCommissionPerBag(item.commissionPerBag);
    setWhtTax(item.whtTax);
    setEditingIndex(index);
  };

  // Handle save purchase order
  const handleSavePurchaseOrder = () => {
    if (
      !selectedCompany ||
      !selectedTruck ||
      !selectedDriver ||
      purchaseItems.length === 0
    ) {
      notify.error("Please fill all required fields.");
      return;
    }

    // Here you would typically send the data to your backend
    console.log("Saving purchase order:", {
      transactionDate,
      companyId: selectedCompany,
      purchaseOrderId,
      truckId: selectedTruck,
      truckStatus,
      driverId: selectedDriver,
      driverName:
        customDriver || drivers.find((d) => d.id === selectedDriver)?.name,
      saleRouteId: selectedSaleRoute,
      items: purchaseItems,
    });

    notify.success("Purchase order saved successfully!");

    // Reset form
    setSelectedCompany("");
    setPurchaseOrderId("");
    setSelectedTruck("");
    setTruckStatus("");
    setSelectedDriver("");
    setCustomDriver("");
    setSelectedSaleRoute("");
    setPurchaseItems([]);
  };

  const handleDeletePurchaseItems = (index: number) => {
    notify.confirmDelete(() => {
      setPurchaseOrderId(purchaseItems.find((_, i) => i === index)?.id ?? "");
      setPurchaseItems((prev) => prev.filter((_, i) => i !== index));
      notify.success("Order deleted successfully!");
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Purchase</h2>

      {/* Header Section */}
      <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Transaction Date */}
          <label className="block mb-1 font-medium">
            Transaction Date
            <input
              type="date"
              value={transactionDate}
              onChange={(e) => {
                setTransactionDate(e.target.value);
              }}
              className="input input-bordered w-full"
            />
          </label>

          {/* Company */}
          <label className="block mb-1 font-medium">
            Company
            <select
              value={selectedCompany}
              onChange={(e) => {
                setSelectedCompany(e.target.value);
              }}
              className="select select-bordered w-full"
            >
              <option value="">Select Company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </label>

          {/* Purchase Order ID */}
          <label className="block mb-1 font-medium">
            Purchase Order ID
            <input
              type="text"
              value={purchaseOrderId}
              readOnly
              className="input input-bordered w-full"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Truck */}
          <div>
            <label className="block mb-1 font-medium">
              Truck
              <select
                value={selectedTruck}
                onChange={(e) => {
                  handleTruckChange(e.target.value);
                }}
                className="select select-bordered w-full"
              >
                <option value="">Select Truck</option>
                {trucks.map((truck) => (
                  <option key={truck.id} value={truck.id}>
                    {truck.name}
                  </option>
                ))}
              </select>
            </label>
            {truckStatus && (
              <div className="text-sm text-gray-600 mt-1">{truckStatus}</div>
            )}
          </div>

          {/* Driver Name */}
          <div>
            <label className="block mb-1 font-medium">
              Driver Name
              <select
                value={selectedDriver}
                onChange={(e) => {
                  setSelectedDriver(e.target.value);
                }}
                className="select select-bordered w-full"
              >
                <option value="">Select Driver</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name}
                  </option>
                ))}
              </select>
            </label>
            {/* Custom driver input for substitutes */}
            <input
              type="text"
              placeholder="Or enter substitute driver"
              value={customDriver}
              onChange={(e) => {
                setCustomDriver(e.target.value);
              }}
              className="input input-bordered w-full mt-2 text-sm"
            />
          </div>

          {/* Sale Route Name */}
          <div>
            <label className="block mb-1 font-medium">
              Sale Route Name
              <select
                value={selectedSaleRoute}
                onChange={(e) => {
                  setSelectedSaleRoute(e.target.value);
                }}
                className="select select-bordered w-full"
              >
                <option value="">Select Sale Route</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.name}
                  </option>
                ))}
              </select>
            </label>
            {selectedSaleRoute && (
              <div className="text-sm text-gray-600 mt-1">
                {routes.find((r) => r.id === selectedSaleRoute)?.companyFreight}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Brand and Route Section */}
      <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Brand */}
          <div>
            <label className="block mb-1 font-medium">
              Brand
              <select
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                }}
                className="select select-bordered w-full"
              >
                <option value="">Select Brand</option>
                {brands
                  .filter(
                    (brand) =>
                      !selectedCompany || brand.companyId === selectedCompany,
                  )
                  .map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
              </select>
            </label>
          </div>

          {/* Route */}
          <div>
            <label className="block mb-1 font-medium">
              Route
              <select
                value={selectedRoute}
                onChange={(e) => {
                  handleRouteChange(e.target.value);
                }}
                className="select select-bordered w-full"
              >
                <option value="">Select Route</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.name}
                  </option>
                ))}
              </select>
            </label>
            {selectedRoute && (
              <div className="text-sm text-gray-600 mt-1">
                Company: {routeFreight.company.toFixed(2)}/ Truck:{" "}
                {routeFreight.truck.toFixed(2)}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Qty in Ton */}
          <div>
            <label className="block mb-1 font-medium">
              Qty in Ton
              <input
                type="number"
                value={qtyInTon ?? ""}
                onChange={(e) => {
                  const value = e.target.value
                    ? parseFloat(e.target.value)
                    : null;
                  setQtyInTon(value);
                  if (value !== null) {
                    calculateBags(value);
                  }
                }}
                className="input input-bordered w-full"
              />
            </label>
          </div>

          {/* Bags */}
          <div>
            <label className="block mb-1 font-medium">
              Bags
              <input
                type="number"
                value={bags ?? ""}
                readOnly
                className="input input-bordered w-full "
              />
            </label>
          </div>

          {/* Freight/Bag */}
          <div>
            <label className="block mb-1 font-medium">
              Freight/Bag
              <input
                type="number"
                value={freightPerBag !== null ? freightPerBag.toFixed(2) : ""}
                readOnly
                className="input input-bordered w-full"
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Total Freight */}
          <div>
            <label className="block mb-1 font-medium">
              Total Freight
              <input
                type="number"
                value={totalFreight !== null ? totalFreight.toFixed(2) : ""}
                readOnly
                className="input input-bordered w-full"
              />
            </label>
          </div>

          {/* Rate / Ton */}
          <div>
            <label className="block mb-1 font-medium">
              Rate / Ton
              <input
                type="number"
                value={ratePerTon ?? ""}
                onChange={(e) => {
                  const value = e.target.value
                    ? parseFloat(e.target.value)
                    : null;
                  setRatePerTon(value);
                  if (value !== null) {
                    calculateRatePerBag(value);
                  }
                }}
                className="input input-bordered w-full"
              />
            </label>
          </div>

          {/* Rate/Bag */}
          <div>
            <label className="block mb-1 font-medium">
              Rate/Bag
              <input
                type="number"
                value={ratePerBag !== null ? ratePerBag.toFixed(2) : ""}
                readOnly
                className="input input-bordered w-full"
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Unit Price */}
          <div>
            <label className="block mb-1 font-medium">
              Unit Price
              <input
                type="number"
                value={unitPrice !== null ? unitPrice.toFixed(2) : ""}
                readOnly
                className="input input-bordered w-full"
              />
            </label>
          </div>

          {/* Total Price */}
          <div>
            <label className="block mb-1 font-medium">
              Total Price
              <input
                type="number"
                value={totalPrice !== null ? totalPrice.toFixed(2) : ""}
                readOnly
                className="input input-bordered w-full "
              />
            </label>
          </div>

          {/* Comm./Bag */}
          <div>
            <label className="block mb-1 font-medium">
              Comm./Bag
              <input
                type="number"
                value={commissionPerBag ?? ""}
                onChange={(e) => {
                  setCommissionPerBag(
                    e.target.value ? parseFloat(e.target.value) : null,
                  );
                }}
                className="input input-bordered w-full"
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* WHT Tax */}
          <div>
            <label className="block mb-1 font-medium">
              WHT Tax
              <input
                type="number"
                value={whtTax ?? ""}
                onChange={(e) => {
                  setWhtTax(e.target.value ? parseFloat(e.target.value) : null);
                }}
                className="input input-bordered w-full"
              />
            </label>
          </div>
        </div>

        <button onClick={handleAddToGrid} className="btn btn-primary mt-4">
          {editingIndex !== null ? "Update Item" : "Add to Purchase"}
        </button>
      </div>

      {/* Items Grid */}
      {purchaseItems.length > 0 ? (
        <div className="overflow-x-auto bg-base-200 p-4 rounded-lg shadow-md mb-6">
          <table className="table w-full">
            <thead>
              <tr className="bg-base-300 text-base-content">
                <th className="p-3">#</th>
                <th className="p-3">Brand</th>
                <th className="p-3">Route</th>
                <th className="p-3">Qty (Ton)</th>
                <th className="p-3">Bags</th>
                <th className="p-3">Rate/Ton</th>
                <th className="p-3">Rate/Bag</th>
                <th className="p-3">Unit Price</th>
                <th className="p-3">Total Price</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {purchaseItems.map((item, index) => (
                <tr key={item.id} className="border-b border-base-300">
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{item.brandName}</td>
                  <td className="p-3">{item.routeName}</td>
                  <td className="p-3">{item.qtyInTon}</td>
                  <td className="p-3">{item.bags}</td>
                  <td className="p-3">{item.ratePerTon.toFixed(2)}</td>
                  <td className="p-3">{item.ratePerBag.toFixed(2)}</td>
                  <td className="p-3">{item.unitPrice.toFixed(2)}</td>
                  <td className="p-3">{item.totalPrice.toFixed(2)}</td>
                  <td className="p-3">
                    <button
                      onClick={() => {
                        handleEditItem(index);
                      }}
                      className="flex items-center justify-center"
                    >
                      <PencilSquareIcon className="w-4 h-4 text-info" />
                    </button>

                    <button
                      onClick={() => {
                        handleDeletePurchaseItems(index);
                      }}
                      className="flex items-center justify-center"
                    >
                      <TrashIcon className="w-4 h-4 text-red-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6 text-center text-gray-500">
          No purchase items added yet.
        </div>
      )}

      {/* Save Button */}
      <div className="text-right">
        <button
          onClick={handleSavePurchaseOrder}
          className="btn btn-success btn-md"
          disabled={purchaseItems.length === 0}
        >
          Save Purchase Order
        </button>
      </div>
    </div>
  );
};
