/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
} from "react-hook-form";
import type { PurchaseFormData } from "./purchase.schema";

interface PurchaseItemFormProps {
  register: UseFormRegister<PurchaseFormData>;
  errors: FieldErrors<PurchaseFormData>;
  watch: UseFormWatch<PurchaseFormData>;
  brands: {
    id: string;
    name: string;
    company: { id: string };
    freights: any[];
  }[];
  brandRoutes: any[];
  routeFreight: { amountPerBag: number; truckSharePerBag: number };
  selectedCompany: string;
  selectedRoute: string;
  handleAddToGrid: () => void;
  isEditing: boolean;
  isSubmitting: boolean;
}

const PurchaseItemForm = ({
  register,
  errors,
  watch,
  brands,
  brandRoutes,
  routeFreight,
  selectedCompany,
  selectedRoute,
  handleAddToGrid,
  isEditing,
  isSubmitting,
}: PurchaseItemFormProps) => {
  // Filter brands by selected company
  const filteredBrands = selectedCompany
    ? brands.filter((brand) => brand.company.id === selectedCompany)
    : brands;

  return (
    <div className="bg-base-200 p-4 rounded-lg shadow-md">
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
              {filteredBrands.map((brand) => (
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
              disabled={!watch("items.0.brandId") || brandRoutes.length === 0}
            >
              <option value="">Select Route</option>
              {brandRoutes.map((freight) => (
                <option key={freight.route.id} value={freight.route.id}>
                  {freight.route.name}
                </option>
              ))}
            </select>
            {errors.items?.[0]?.routeId && (
              <p className="text-red-500 text-sm">
                {errors.items[0].routeId.message}
              </p>
            )}
            {selectedRoute && routeFreight.amountPerBag > 0 && (
              <div className="text-sm text-gray-600 mt-1">
                Amount Per Bag: {routeFreight.amountPerBag.toFixed(2)} / Truck
                Share: {routeFreight.truckSharePerBag.toFixed(2)}
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
              step="0.01"
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

        {/* Bags (calculated) */}
        <div>
          <label className="block mb-1 font-medium">
            Bags
            <input
              type="number"
              {...register("items.0.bags", { valueAsNumber: true })}
              readOnly
              className="input input-bordered w-full bg-base-300"
            />
          </label>
        </div>

        {/* Freight/Bag */}
        <div>
          <label className="block mb-1 font-medium">
            Freight/Bag
            <input
              type="number"
              step="0.01"
              {...register("items.0.freightPerBag", { valueAsNumber: true })}
              readOnly
              className="input input-bordered w-full bg-base-300"
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
              step="0.01"
              {...register("items.0.totalFreight", { valueAsNumber: true })}
              readOnly
              className="input input-bordered w-full bg-base-300"
            />
          </label>
        </div>

        {/* Rate / Ton */}
        <div>
          <label className="block mb-1 font-medium">
            Rate / Ton
            <input
              type="number"
              step="0.01"
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

        {/* Rate/Bag (calculated) */}
        <div>
          <label className="block mb-1 font-medium">
            Rate/Bag
            <input
              type="number"
              step="0.01"
              {...register("items.0.ratePerBag", { valueAsNumber: true })}
              readOnly
              className="input input-bordered w-full bg-base-300"
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {/* Unit Price (calculated) */}
        <div>
          <label className="block mb-1 font-medium">
            Unit Price
            <input
              type="number"
              step="0.01"
              {...register("items.0.unitPrice", { valueAsNumber: true })}
              readOnly
              className="input input-bordered w-full bg-base-300"
            />
          </label>
        </div>

        {/* Total Price (calculated) */}
        <div>
          <label className="block mb-1 font-medium">
            Total Price
            <input
              type="number"
              step="0.01"
              {...register("items.0.totalPrice", { valueAsNumber: true })}
              readOnly
              className="input input-bordered w-full bg-base-300"
            />
          </label>
        </div>

        {/* Commission/Bag */}
        <div>
          <label className="block mb-1 font-medium">
            Commission/Bag
            <input
              type="number"
              step="0.01"
              {...register("items.0.commissionPerBag", { valueAsNumber: true })}
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
              step="0.01"
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
        {isEditing ? "Update Item" : "Add to Purchase"}
      </button>
    </div>
  );
};

export default PurchaseItemForm;
