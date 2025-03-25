/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { logger } from "@/lib/logger";
import { notify } from "@/lib/notify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorModal } from "@/common/components/Error";
import { useService } from "@/common/hooks/custom/useService";
import {
  purchaseSchema,
  type PurchaseFormData,
  type PurchaseItem,
  type Company,
  type Truck,
  type Driver,
  type Route,
  type Brand,
} from "./purchase.schema";
import {
  createPurchase,
  fetchAllPurchases,
  updatePurchase,
  deletePurchase,
  fetchAllCompanies,
  fetchAllTrucks,
  fetchAllDrivers,
  fetchAllRoutes,
  fetchAllBrands,
} from "./purchase.service";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";

const Purchase = () => {
  // Current date formatted as YYYY-MM-DD for input[type="date"]
  const today = new Date().toISOString().split("T")[0];

  // Form setup with React Hook Form
  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    trigger,
  } = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      transactionDate: today,
      items: [],
    },
  });

  // State management
  const [transactionDate, setTransactionDate] = useState(today);
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [routeFreight, setRouteFreight] = useState({ company: 0, truck: 0 });

  // Form values being watched
  const selectedCompany = watch("companyId");
  const selectedTruck = watch("truckId");
  const selectedDriver = watch("driverId");
  const selectedBrand = watch("items.0.brandId"); // For the current item being added
  const selectedRoute = watch("items.0.routeId"); // For the current item being added
  const qtyInTon = watch("items.0.qtyInTon");
  const ratePerTon = watch("items.0.ratePerTon");
  const commissionPerBag = watch("items.0.commissionPerBag");
  const whtTax = watch("items.0.whtTax");

  // Data fetching using useService hook
  const {
    error: fetchError,
    isLoading: isFetching,
    data: purchasesData,
  } = useService(fetchAllPurchases);

  const {
    data: companiesData,
    isLoading: isCompaniesLoading,
    error: companiesError,
  } = useService(fetchAllCompanies);

  const {
    data: trucksData,
    isLoading: isTrucksLoading,
    error: trucksError,
  } = useService(fetchAllTrucks);

  const {
    data: driversData,
    isLoading: isDriversLoading,
    error: driversError,
  } = useService(fetchAllDrivers);

  const {
    data: routesData,
    isLoading: isRoutesLoading,
    error: routesError,
  } = useService(fetchAllRoutes);

  const {
    data: brandsData,
    isLoading: isBrandsLoading,
    error: brandsError,
  } = useService(fetchAllBrands);

  // Process fetched data
  const companies = companiesData ?? [];
  const trucks = trucksData ?? [];
  const drivers = driversData ?? [];
  const routes = routesData ?? [];
  const brands = brandsData ?? [];

  // Auto-generate purchase order ID when company is selected
  useEffect(() => {
    if (selectedCompany) {
      const randomId = Math.floor(100 + Math.random() * 900);
      setValue("purchaseOrderId", randomId.toString());
    }
  }, [selectedCompany, setValue]);

  // Handle truck selection
  useEffect(() => {
    if (selectedTruck) {
      const truck = trucks.find((t) => t.id === selectedTruck);
      if (truck) {
        setValue("truckStatus", truck.status);
      }
    }
  }, [selectedTruck, trucks, setValue]);

  // Handle route selection
  useEffect(() => {
    if (selectedRoute) {
      const route = routes.find((r) => r.id === selectedRoute);
      if (route) {
        setRouteFreight({
          company: route.companyFreight,
          truck: route.truckFreight,
        });
      }
    }
  }, [selectedRoute, routes]);

  // Calculate derived values whenever inputs change
  useEffect(() => {
    if (qtyInTon) {
      const calculatedBags = qtyInTon * 20;
      setValue("items.0.bags", calculatedBags);

      if (routeFreight.truck) {
        const freightPerBag = routeFreight.truck / calculatedBags;
        setValue("items.0.freightPerBag", freightPerBag);
        setValue("items.0.totalFreight", routeFreight.truck);
      }

      if (ratePerTon) {
        const calculatedRatePerBag = ratePerTon / 20;
        setValue("items.0.ratePerBag", calculatedRatePerBag);
        setValue(
          "items.0.unitPrice",
          calculatedRatePerBag + (getValues("items.0.freightPerBag") || 0),
        );
        setValue(
          "items.0.totalPrice",
          calculatedBags *
            (calculatedRatePerBag + (getValues("items.0.freightPerBag") || 0)),
        );
      }
    }
  }, [qtyInTon, ratePerTon, routeFreight, setValue, getValues]);

  // Handle API errors
  if (
    fetchError ||
    companiesError ||
    trucksError ||
    driversError ||
    routesError ||
    brandsError
  ) {
    const errorMessage =
      (fetchError as { message?: string })?.message ??
      (companiesError as { message?: string })?.message ??
      (trucksError as { message?: string })?.message ??
      (driversError as { message?: string })?.message ??
      (routesError as { message?: string })?.message ??
      (brandsError as { message?: string })?.message ??
      "Failed to fetch data";
    return <ErrorModal message={errorMessage} />;
  }

  // Add or update purchase item in the grid
  const handleAddToGrid = async () => {
    const isValid = await trigger("items.0");
    if (!isValid) return;

    const currentItem = getValues("items.0");
    const brandItem = brands.find((b) => b.id === currentItem.brandId);
    const routeItem = routes.find((r) => r.id === currentItem.routeId);

    if (!brandItem || !routeItem) return;

    const purchaseItem: PurchaseItem = {
      id:
        editingIndex !== null
          ? (purchaseItems[editingIndex]?.id ?? "")
          : Date.now().toString(),
      brandId: currentItem.brandId,
      brandName: brandItem.name,
      routeId: currentItem.routeId,
      routeName: routeItem.name,
      qtyInTon: currentItem.qtyInTon,
      bags: currentItem.bags,
      freightPerBag: currentItem.freightPerBag,
      totalFreight: currentItem.totalFreight,
      ratePerTon: currentItem.ratePerTon,
      ratePerBag: currentItem.ratePerBag,
      unitPrice: currentItem.unitPrice,
      totalPrice: currentItem.totalPrice,
      commissionPerBag: currentItem.commissionPerBag,
      whtTax: currentItem.whtTax,
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

    // Reset item fields
    setValue("items.0", {
      brandId: "",
      routeId: "",
      qtyInTon: 0,
      bags: 0,
      freightPerBag: 0,
      totalFreight: 0,
      ratePerTon: 0,
      ratePerBag: 0,
      unitPrice: 0,
      totalPrice: 0,
      commissionPerBag: 0,
      whtTax: 0,
    });
  };

  // Edit a purchase item from the grid
  const handleEditItem = (index: number) => {
    const item = purchaseItems[index];
    if (!item) return;

    setValue("items.0", {
      brandId: item.brandId,
      routeId: item.routeId,
      qtyInTon: item.qtyInTon,
      bags: item.bags,
      freightPerBag: item.freightPerBag,
      totalFreight: item.totalFreight,
      ratePerTon: item.ratePerTon,
      ratePerBag: item.ratePerBag,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      commissionPerBag: item.commissionPerBag,
      whtTax: item.whtTax,
    });

    setEditingIndex(index);
  };

  // Delete a purchase item from the grid
  const handleDeleteItem = (index: number) => {
    notify.confirmDelete(() => {
      setPurchaseItems((prev) => prev.filter((_, i) => i !== index));
      notify.success("Item removed successfully!");
    });
  };

  // Handle save purchase order
  const handleSavePurchaseOrder = async (data: PurchaseFormData) => {
    try {
      const payload = {
        ...data,
        items: purchaseItems,
      };

      if (editingIndex !== null) {
        if (editingIndex !== null && purchaseItems[editingIndex]) {
          await updatePurchase(purchaseItems[editingIndex].id, payload);
        }
      } else {
        await createPurchase(payload);
      }

      notify.success("Purchase order saved successfully!");
      reset();
      setPurchaseItems([]);
    } catch (error) {
      logger.error("Failed to save purchase order", error);
      notify.error("Failed to save purchase order");
    }
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
                setValue("transactionDate", e.target.value);
              }}
              className="input input-bordered w-full"
            />
          </label>

          {/* Company */}
          <label className="block mb-1 font-medium">
            Company
            <select
              {...register("companyId")}
              className="select select-bordered w-full"
            >
              <option value="">Select Company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            {errors.companyId && (
              <p className="text-red-500 text-sm">{errors.companyId.message}</p>
            )}
          </label>

          {/* Purchase Order ID */}
          <label className="block mb-1 font-medium">
            Purchase Order ID
            <input
              {...register("purchaseOrderId")}
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
                {...register("truckId")}
                className="select select-bordered w-full"
              >
                <option value="">Select Truck</option>
                {trucks.map((truck) => (
                  <option key={truck.id} value={truck.id}>
                    {truck.name}
                  </option>
                ))}
              </select>
              {errors.truckId && (
                <p className="text-red-500 text-sm">{errors.truckId.message}</p>
              )}
              {watch("truckStatus") && (
                <div className="text-sm text-gray-600 mt-1">
                  {watch("truckStatus")}
                </div>
              )}
            </label>
          </div>

          {/* Driver Name */}
          <div>
            <label className="block mb-1 font-medium">
              Driver Name
              <select
                {...register("driverId")}
                className="select select-bordered w-full"
              >
                <option value="">Select Driver</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name}
                  </option>
                ))}
              </select>
              {errors.driverId && (
                <p className="text-red-500 text-sm">
                  {errors.driverId.message}
                </p>
              )}
            </label>
            {/* Custom driver input for substitutes */}
            <input
              {...register("driverName")}
              placeholder="Or enter substitute driver"
              className="input input-bordered w-full mt-2 text-sm"
            />
          </div>

          {/* Sale Route Name */}
          <div>
            <label className="block mb-1 font-medium">
              Sale Route Name
              <select
                {...register("saleRouteId")}
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
                {...register("items.0.brandId")}
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
              {errors.items?.[0]?.brandId && (
                <p className="text-red-500 text-sm">
                  {errors.items[0].brandId.message}
                </p>
              )}
            </label>
          </div>

          {/* Route */}
          <div>
            <label className="block mb-1 font-medium">
              Route
              <select
                {...register("items.0.routeId")}
                className="select select-bordered w-full"
              >
                <option value="">Select Route</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.name}
                  </option>
                ))}
              </select>
              {errors.items?.[0]?.routeId && (
                <p className="text-red-500 text-sm">
                  {errors.items[0].routeId.message}
                </p>
              )}
              {selectedRoute && (
                <div className="text-sm text-gray-600 mt-1">
                  Company: {routeFreight.company.toFixed(2)}/ Truck:{" "}
                  {routeFreight.truck.toFixed(2)}
                </div>
              )}
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Qty in Ton */}
          <div>
            <label className="block mb-1 font-medium">
              Qty in Ton
              <input
                type="number"
                {...register("items.0.qtyInTon", { valueAsNumber: true })}
                className="input input-bordered w-full"
              />
              {errors.items?.[0]?.qtyInTon && (
                <p className="text-red-500 text-sm">
                  {errors.items[0].qtyInTon.message}
                </p>
              )}
            </label>
          </div>

          {/* Bags */}
          <div>
            <label className="block mb-1 font-medium">
              Bags
              <input
                type="number"
                {...register("items.0.bags", { valueAsNumber: true })}
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
                {...register("items.0.freightPerBag", { valueAsNumber: true })}
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
                {...register("items.0.totalFreight", { valueAsNumber: true })}
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
                {...register("items.0.ratePerTon", { valueAsNumber: true })}
                className="input input-bordered w-full"
              />
              {errors.items?.[0]?.ratePerTon && (
                <p className="text-red-500 text-sm">
                  {errors.items[0].ratePerTon.message}
                </p>
              )}
            </label>
          </div>

          {/* Rate/Bag */}
          <div>
            <label className="block mb-1 font-medium">
              Rate/Bag
              <input
                type="number"
                {...register("items.0.ratePerBag", { valueAsNumber: true })}
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
                {...register("items.0.unitPrice", { valueAsNumber: true })}
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
                {...register("items.0.totalPrice", { valueAsNumber: true })}
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
                {...register("items.0.commissionPerBag", {
                  valueAsNumber: true,
                })}
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
                {...register("items.0.whtTax", { valueAsNumber: true })}
                className="input input-bordered w-full"
              />
            </label>
          </div>
        </div>

        <button
          onClick={handleAddToGrid}
          className="btn btn-primary mt-4"
          disabled={isSubmitting}
        >
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
                        handleDeleteItem(index);
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
          onClick={handleSubmit(handleSavePurchaseOrder)}
          className="btn btn-success btn-md"
          disabled={purchaseItems.length === 0 || isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Purchase Order"}
        </button>
      </div>
    </div>
  );
};

export default Purchase;
