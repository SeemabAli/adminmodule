/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { notify } from "@/lib/notify";
import { FormField } from "@/common/components/ui/form/FormField";
import { useForm } from "react-hook-form";
import { Button } from "@/common/components/ui/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  truckInformationSchema,
  type ITruckInformation,
} from "./truckinformation.schema";
import {
  createTruckInformation,
  fetchAllTruckInformation,
  updateTruckInformation,
  deleteTruckInformation,
} from "./truckinformation.service";
import { logger } from "@/lib/logger";
import { useService } from "@/common/hooks/custom/useService";
import { ErrorModal } from "@/common/components/Error";
import { TrashIcon } from "@heroicons/react/24/solid";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { ApiException } from "@/utils/exceptions";
import type { DeliveryRoute } from "../DeliveryRoutes/deliveryRoute.schema";
import { fetchAllRoutes } from "../DeliveryRoutes/route.service";

export const TruckInformation = () => {
  const [trucks, setTrucks] = useState<ITruckInformation[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);

  const { error, data, isLoading } = useService(fetchAllTruckInformation);

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    setValue,
    setFocus,
    getValues,
    reset,
    watch,
  } = useForm<ITruckInformation>({
    resolver: zodResolver(truckInformationSchema),
    defaultValues: {
      number: "",
      driverName: "",
      routeId: "",
      sourcingType: "insource", // Set default to Insource
    },
  });

  const truckType = watch("sourcingType");

  const handleAddTruck = async (newTruckData: ITruckInformation) => {
    try {
      const newTruck = await createTruckInformation(newTruckData);
      setTrucks([...trucks, newTruck]);
      reset();
      notify.success("Truck added successfully.");
    } catch (error: unknown) {
      logger.error(error);

      if (error instanceof ApiException) {
        if (error.statusCode == 409) {
          notify.error("Truck already exists.");
        }
        return;
      }
      notify.error("Failed to add truck.");
    }
  };

  const onTruckUpdate = async (truckId: string) => {
    try {
      const updatedTruckData = getValues();
      const updatedTruck = await updateTruckInformation(
        truckId,
        updatedTruckData,
      );

      const updatedTrucks = trucks.map((truck) => {
        if (truck.id === truckId) {
          return updatedTruck;
        }
        return truck;
      });

      setTrucks(updatedTrucks);
      setEditingId(null);
      reset();
      notify.success("Truck updated successfully.");
    } catch (error: unknown) {
      notify.error("Failed to update truck.");
      logger.error(error);
    }
  };

  const handleEdit = (truckId: string) => {
    const targetTruck = trucks.find((truck) => truck.id === truckId);
    if (!targetTruck) return;

    setValue("id", targetTruck.id ?? "");
    setValue("number", targetTruck.number);
    setValue("driverName", targetTruck.driverName);
    setValue("routeId", targetTruck.routeId);
    setValue("sourcingType", targetTruck.sourcingType);
    setFocus("number");
    setEditingId(truckId);
  };

  const handleDelete = (truckId: string) => {
    notify.confirmDelete(async () => {
      try {
        await deleteTruckInformation(truckId);
        setTrucks(trucks.filter((truck) => truck.id !== truckId));
        notify.success("Truck deleted successfully.");
      } catch (error: unknown) {
        notify.error("Failed to delete truck.");
        logger.error(error);
      }
    });
  };

  useEffect(() => {
    const fetchRoutesData = async () => {
      try {
        const routesData = await fetchAllRoutes();
        setRoutes(routesData);
      } catch (error) {
        logger.error("Failed to fetch routes", error);
        notify.error("Could not load routes data");
      }
    };

    if (data) {
      setTrucks(data);
    }
    void fetchRoutesData();
  }, [data]);

  if (error) {
    return (
      <ErrorModal
        message={
          error instanceof Error ? error.message : "Failed to fetch trucks data"
        }
      />
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Truck Information</h2>
      <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <FormField
            placeholder="Enter Truck Number"
            name={"number"}
            label={"Truck Number"}
            register={register}
            errorMessage={errors.number?.message}
          />
          <FormField
            placeholder="Enter Driver Name"
            name={"driverName"}
            label={"Driver Name"}
            register={register}
            errorMessage={errors.driverName?.message}
          />
          <label className="block mb-1 font-medium">
            Route
            <select
              {...register("routeId")}
              className="select select-bordered w-full"
            >
              <option value="">Select Route</option>
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.name}
                </option>
              ))}
            </select>
            {errors.routeId && (
              <span className="text-red-500 text-xs font-light">
                {errors.routeId.message}
              </span>
            )}
          </label>
          <div className="flex flex-col gap-2">
            <label className="font-medium">Truck Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="insource"
                  {...register("sourcingType")}
                  className="radio"
                />
                Insource
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="outsource"
                  {...register("sourcingType")}
                  className="radio"
                />
                Outsource
              </label>
            </div>
            {errors.sourcingType?.message && (
              <span className="text-red-500 text-sm">
                {errors.sourcingType.message}
              </span>
            )}
          </div>
        </div>
        <Button
          onClick={
            editingId !== null
              ? handleSubmit(() => {
                  void onTruckUpdate(editingId);
                })
              : handleSubmit(handleAddTruck)
          }
          shape="info"
          pending={isSubmitting}
          className="mt-4"
        >
          {editingId !== null ? "Update Truck" : "Add Truck"}
        </Button>
      </div>
      {isLoading && <div className="skeleton h-28 w-full"></div>}
      {trucks.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="table w-full bg-base-200 rounded-lg shadow-md">
            <thead>
              <tr className="bg-base-300 text-base-content text-center">
                <th className="p-3">#</th>
                <th className="p-3">Truck Number</th>
                <th className="p-3">Driver Name</th>
                <th className="p-3">Default Route</th>
                <th className="p-3">Truck Type</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trucks.map((truck, index) => (
                <tr
                  key={truck.id}
                  className="border-b border-base-300 text-center"
                >
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{truck.number}</td>
                  <td className="p-3">{truck.driverName}</td>
                  <td className="p-3">
                    {routes.find((route) => route.id === truck.routeId)?.name ??
                      "Unknown"}
                  </td>
                  <td className="p-3">{truck.sourcingType}</td>
                  <td className="p-1 flex gap-1 justify-center">
                    <button
                      onClick={() => {
                        truck.id && handleEdit(truck.id);
                      }}
                      className="flex items-center mt-2 justify-center"
                    >
                      <PencilSquareIcon className="w-5 h-5 text-info" />
                    </button>

                    <button
                      onClick={() => {
                        handleDelete(truck.id ?? "");
                      }}
                      className="flex items-center mt-2 justify-center"
                    >
                      <TrashIcon className="w-5 h-5 text-red-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6 text-center text-gray-500">
          No trucks added yet.
        </div>
      )}
    </div>
  );
};
