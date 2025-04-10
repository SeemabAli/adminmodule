import { useEffect, useState } from "react";
import { logger } from "@/lib/logger";
import {
  createRoute,
  fetchAllRoutes,
  updateDeliveryRoute,
  deleteDeliveryRoute,
} from "./route.service";
import { notify } from "../../../lib/notify";
import {
  FormattedNumberField,
  FormField,
} from "@/common/components/ui/form/FormField";
import { useForm } from "react-hook-form";
import { Button } from "@/common/components/ui/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorModal } from "@/common/components/Error";
import { useService } from "@/common/hooks/custom/useService";
import {
  deliveryRouteSchema,
  type DeliveryRoute,
} from "./deliveryRoute.schema";
import TrashIcon from "@heroicons/react/24/solid/TrashIcon";
import PencilSquareIcon from "@heroicons/react/24/solid/PencilSquareIcon";
import { handleErrorNotification } from "@/utils/exceptions";
import { convertNumberIntoLocalString } from "@/utils/CommaSeparator";

const DeliveryRoutes = () => {
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasToll, setHasToll] = useState(false);
  const { error, data, isLoading } = useService(fetchAllRoutes);

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    setValue,
    setFocus,
    getValues,
    reset,
    watch,
  } = useForm<DeliveryRoute>({
    resolver: zodResolver(deliveryRouteSchema),
    defaultValues: {
      name: "",
      code: "",
      toll: undefined,
    },
  });

  const watchToll = watch("toll");

  const handleAddRoute = async (formData: DeliveryRoute) => {
    try {
      // Format the payload based on hasToll state
      const routePayload = {
        name: formData.name,
        code: formData.code,
        toll: hasToll ? formData.toll : undefined,
      };

      const newRoute = await createRoute(routePayload);
      setRoutes([...routes, newRoute]);
      reset();
      setHasToll(false);
      notify.success("Route added successfully!");
    } catch (error: unknown) {
      logger.error(error);
      handleErrorNotification(error, "Delivery Route");
    }
  };

  const onRouteUpdate = async (updatedRouteIndex: number) => {
    const formValues = getValues();

    // Format the payload based on hasToll state
    const updateRoutePayload = {
      name: formValues.name,
      code: formValues.code,
      toll: hasToll ? formValues.toll : undefined,
    };

    try {
      const targetRoute = routes[updatedRouteIndex];
      if (targetRoute?.id) {
        // Call updateDeliveryRoute API with the id and updated data

        const updatedRoute = await updateDeliveryRoute(
          targetRoute.id,
          updateRoutePayload,
        );

        const updatedRoutes = routes.map((route, index) => {
          if (index === updatedRouteIndex) {
            return updatedRoute;
          }
          return route;
        });

        setRoutes(updatedRoutes);
        notify.success("Route updated successfully!");
      } else {
        notify.error("Route ID is missing.");
      }
    } catch (error) {
      handleErrorNotification(error, "Delivery Route");
      logger.error(error);
    }

    setEditingIndex(null);
    reset();
    setHasToll(false);
  };

  const handleEdit = (index: number) => {
    const targetRoute = routes[index];
    if (!targetRoute) return;

    setValue("name", targetRoute.name);
    setValue("code", targetRoute.code);

    if (targetRoute.toll) {
      setHasToll(true);
      setValue("toll", targetRoute.toll);
    } else {
      setHasToll(false);
      setValue("toll", { type: "ONEWAY", amount: null });
    }

    setFocus("name");
    setEditingIndex(index);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    reset();
  };

  const handleDelete = (id?: string) => {
    notify.confirmDelete(async () => {
      try {
        if (id) {
          await deleteDeliveryRoute(id); // API call to delete
        } else {
          notify.error("Route ID is missing.");
          return;
        }
        setRoutes(routes.filter((route) => route.id !== id));
        notify.success("Route deleted successfully!");
      } catch (error) {
        handleErrorNotification(error, "Delivery Route");
        logger.error(error);
      }
    });
  };

  const toggleToll = (hasT: boolean) => {
    setHasToll(hasT);
    if (hasT) {
      setValue("toll", { type: "ONEWAY", amount: null });
    } else {
      setValue("toll", undefined);
    }
  };

  // Filter Routes
  const filteredRoutes = routes.filter(
    (route) =>
      route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    if (data) {
      // Transform the received data to match the new schema structure
      setRoutes(
        data.map((route) => ({
          id: route.id,
          name: route.name,
          code: route.code,
          toll: route.toll
            ? {
                type: route.toll?.type ?? null,
                amount: route.toll?.amount ? Number(route.toll.amount) : null,
              }
            : undefined,
        })),
      );
    }
  }, [data]);

  if (error) {
    return (
      <ErrorModal
        message={
          error instanceof Error
            ? error.message
            : "Failed to fetch delivery routes data"
        }
      />
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Delivery Routes</h2>

      {/* Search Bar */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Search</label>
        <input
          type="text"
          placeholder="Search by Route Name or Short Code"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
          className="input input-bordered w-full"
        />
      </div>

      {/* Route Form */}
      <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <FormField
            placeholder="Route Name"
            name="name"
            label="Route Name"
            register={register}
            errorMessage={errors.name?.message}
          />
          <FormField
            placeholder="Route Short Code"
            name="code"
            label="Route Short Code"
            register={register}
            errorMessage={errors.code?.message}
          />
        </div>

        {/* Have Toll - Radio Buttons */}
        <div className="mt-2">
          <label className="block mb-1 font-medium">Have Toll?</label>
          <div className="flex gap-4 items-center">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={hasToll}
                onChange={() => {
                  toggleToll(true);
                }}
                className="radio-info"
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={!hasToll}
                onChange={() => {
                  toggleToll(false);
                }}
                className="radio-info"
              />
              <span>No</span>
            </label>
          </div>
        </div>

        {/* Toll Type and Amount - Only if Toll is Yes */}
        {hasToll && (
          <>
            <div className="mt-2">
              <label className="block mb-1 font-medium">Toll Type</label>
              <div className="flex gap-4 items-center">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="ONEWAY"
                    checked={watchToll?.type === "ONEWAY"}
                    onChange={() => {
                      setValue("toll.type", "ONEWAY");
                    }}
                    className="radio-info"
                  />
                  <span>One Way</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="TWOWAY"
                    checked={watchToll?.type === "TWOWAY"}
                    onChange={() => {
                      setValue("toll.type", "TWOWAY");
                    }}
                    className="radio-info"
                  />
                  <span>Two Way</span>
                </label>
              </div>
            </div>

            {/* Replace the existing Toll Amount section with this */}
            <div className="mt-2 w-1/2">
              <label className="block mb-1 font-medium">Toll Amount</label>
              <FormattedNumberField
                placeholder="Enter Toll Amount"
                name="toll.amount"
                label=""
                register={register}
                setValue={setValue}
                watch={watch}
                errorMessage={errors.toll?.amount?.message}
                className="w-1/2"
              />
            </div>
          </>
        )}

        <Button
          onClick={
            editingIndex !== null
              ? handleSubmit(() => {
                  void onRouteUpdate(editingIndex);
                })
              : handleSubmit(handleAddRoute)
          }
          shape="info"
          pending={isSubmitting}
          className="mt-4"
        >
          {editingIndex !== null ? "Update Route" : "Save Route"}
        </Button>
        {editingIndex !== null && (
          <Button
            onClick={handleCancelEdit}
            shape="neutral"
            className="mt-4 ml-2"
          >
            Cancel
          </Button>
        )}
      </div>

      {/* Routes Table */}
      {isLoading && <div className="skeleton h-28 w-full"></div>}
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
                <th className="p-3">Toll Amount</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoutes.map((route, index) => (
                <tr
                  key={index}
                  className="border-b border-base-300 text-center"
                >
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{route.name}</td>
                  <td className="p-3">{route.code}</td>
                  <td className="p-3">{route.toll ? "Yes" : "No"}</td>
                  <td className="p-3">{route.toll ? route.toll.type : "-"}</td>
                  <td className="p-3">
                    {route.toll
                      ? convertNumberIntoLocalString(route.toll.amount)
                      : "-"}
                  </td>
                  <td className="p-3 flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        handleEdit(index);
                      }}
                      className="flex items-center mt-2 justify-center"
                    >
                      <PencilSquareIcon className="w-5 h-5 text-info" />
                    </button>

                    <button
                      onClick={() => {
                        if (route.id !== undefined) {
                          handleDelete(route.id);
                        }
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
          No routes found.
        </div>
      )}
    </div>
  );
};

export default DeliveryRoutes;
