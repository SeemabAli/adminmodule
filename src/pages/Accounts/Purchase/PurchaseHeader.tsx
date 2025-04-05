import { useState } from "react";
import type {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
} from "react-hook-form";
import type { PurchaseFormData } from "./purchase.schema";

interface PurchaseHeaderProps {
  register: UseFormRegister<PurchaseFormData>;
  errors: FieldErrors<PurchaseFormData>;
  watch: UseFormWatch<PurchaseFormData>;
  setValue: UseFormSetValue<PurchaseFormData>;
  companies: { id: string; name: string }[];
  trucks: { id: string; number: string; sourcingType: string }[];
  drivers: { id: string; name: string }[];
  today: string;
}

const PurchaseHeader = ({
  register,
  errors,
  watch,
  setValue,
  companies,
  trucks,
  drivers,
  today,
}: PurchaseHeaderProps) => {
  const [transactionDate, setTransactionDate] = useState(today);

  return (
    <div className="bg-base-200 p-4 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          {errors.transactionDate && (
            <p className="text-red-500 text-sm">
              {errors.transactionDate.message}
            </p>
          )}
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
                  {truck.number}
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

        {/* Driver Section */}
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
              <p className="text-red-500 text-sm">{errors.driverId.message}</p>
            )}
          </label>

          {/* Substitute driver input */}
          <div className="mt-2 relative">
            <input
              {...register("driverName")}
              placeholder="Or enter substitute driver name"
              className="input input-bordered w-full pl-8 text-sm bg-base-100"
            />
            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
              ➤
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseHeader;
