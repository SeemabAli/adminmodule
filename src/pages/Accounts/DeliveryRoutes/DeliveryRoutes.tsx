import { useEffect, useState } from "react";
import { logger } from "@/lib/logger";
import { createRoute, fetchAllRoutes } from "./route.service";
import { notify } from "../../../lib/notify";
import { FormField } from "@/common/components/ui/form/FormField";
import { useForm } from "react-hook-form";
import { Button } from "@/common/components/ui/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorModal } from "@/common/components/Error";
import { useService } from "@/common/hooks/custom/useService";
import { deliveryRouteSchema } from "./deliveryRoute.schema";

type DeliveryRoute = {
  name: string;
  code: string;
  haveToll: string;
  tollType?: string;
  tollAmount?: number;
};

const DeliveryRoutes = () => {
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
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
  } = useForm<
    {
      name: string;
      code: string;
      haveToll: string;
      tollType?: string;
      tollAmount?: number;
    } & DeliveryRoute
  >({
    resolver: zodResolver(deliveryRouteSchema),
    defaultValues: {
      name: "",
      code: "",
      haveToll: "No",
      tollType: "oneway",
      tollAmount: undefined,
    },
  });

  const haveToll = watch("haveToll");

  const handleAddRoute = async (newDeliveryRoute: DeliveryRoute) => {
    try {
      await createRoute({
        ...newDeliveryRoute,
        tollType: newDeliveryRoute.tollType ?? "",
        tollAmount: newDeliveryRoute.tollAmount ?? undefined,
      });
      setRoutes([...routes, newDeliveryRoute]);
      reset();
      notify.success("Route added successfully!");
    } catch (error: unknown) {
      notify.error("Failed to add route.");
      logger.error(error);
    }
  };

  const onRouteUpdate = async (updatedRouteIndex: number) => {
    const updatedRoute = getValues();

    // Format the toll amount if toll is enabled
    if (updatedRoute.haveToll === "Yes" && updatedRoute.tollAmount) {
      updatedRoute.tollAmount = Number(updatedRoute.tollAmount);
    }

    const updatedRoutes = routes.map((route, index) => {
      if (index === updatedRouteIndex) {
        return updatedRoute;
      }
      return route;
    });

    setRoutes(updatedRoutes);
    setEditingIndex(null);
    reset();
    notify.success("Route updated successfully!");
    return Promise.resolve(updatedRoutes);
  };

  const handleEdit = (index: number) => {
    const targetRoute = routes.find((_, i) => i === index);
    if (!targetRoute) return;

    setValue("name", targetRoute.name);
    setValue("code", targetRoute.code);
    setValue("haveToll", targetRoute.haveToll);

    if (targetRoute.haveToll === "Yes") {
      setValue("tollType", targetRoute.tollType ?? "oneway");
      setValue("tollAmount", targetRoute.tollAmount ?? undefined);
    }

    setFocus("name");
    setEditingIndex(index);
  };

  const handleDelete = (index: number) => {
    notify.confirmDelete(() => {
      setRoutes(routes.filter((_, i) => i !== index));
      notify.success("Route deleted successfully!");
    });
  };

  // Filter Routes
  const filteredRoutes = routes.filter(
    (route) =>
      route.name.toLowerCase().includes(searchTerm.toLowerCase()) ??
      route.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    if (data) {
      setRoutes(
        data.map((route) => ({
          ...route,
          tollAmount: route.tollAmount ? Number(route.tollAmount) : undefined,
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
                value="Yes"
                {...register("haveToll")}
                className="radio-info"
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="No"
                {...register("haveToll")}
                className="radio-info"
              />
              <span>No</span>
            </label>
          </div>
        </div>

        {/* Toll Type and Amount - Only if Toll is Yes */}
        {haveToll === "Yes" && (
          <>
            <div className="mt-2">
              <label className="block mb-1 font-medium">Toll Type</label>
              <div className="flex gap-4 items-center">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="oneway"
                    {...register("tollType")}
                    className="radio-info"
                  />
                  <span>One Way</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="twoway"
                    {...register("tollType")}
                    className="radio-info"
                  />
                  <span>Two Way</span>
                </label>
              </div>
            </div>

            <div className="mt-2">
              <FormField
                placeholder="Enter Toll Amount"
                type="number"
                name="tollAmount"
                label="Toll Amount"
                register={register}
                errorMessage={errors.tollAmount?.message}
                onChange={(e) => {
                  setValue(
                    "tollAmount",
                    Number(e.target.value.replace(/,/g, "")),
                  );
                }}
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
                  <td className="p-3">{route.haveToll}</td>
                  <td className="p-3">
                    {route.haveToll === "Yes" ? route.tollType : "-"}
                  </td>
                  <td className="p-3">
                    {route.haveToll === "Yes" ? route.tollAmount : "-"}
                  </td>
                  <td className="p-3 flex gap-2 justify-center">
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => {
                        handleEdit(index);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        handleDelete(index);
                      }}
                      className="btn btn-sm btn-error"
                    >
                      Delete
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
