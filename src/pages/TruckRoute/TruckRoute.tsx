/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useEffect, useState } from "react";
import { notify } from "@/lib/notify";
import { FormField } from "@/common/components/ui/form/FormField";
import { useForm } from "react-hook-form";
import { Button } from "@/common/components/ui/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { truckRouteSchema, type ITruckRoute } from "./truckroute.schema";
import {
  createTruckRoute,
  fetchAllTruckRoute,
  updateTruckRoute,
  deleteTruckRoute,
} from "./truckroute.service";
import { logger } from "@/lib/logger";
import { useService } from "@/common/hooks/custom/useService";
import { ErrorModal } from "@/common/components/Error";
import { TrashIcon } from "@heroicons/react/24/solid";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { handleErrorNotification } from "@/utils/exceptions";

export const TruckRoute = () => {
  const [routes, setRoutes] = useState<ITruckRoute[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { error, data, isLoading } = useService(fetchAllTruckRoute);

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    setValue,
    setFocus,
    getValues,
    reset,
  } = useForm<ITruckRoute>({
    resolver: zodResolver(truckRouteSchema),
    defaultValues: {
      id: "",
      name: "",
      code: "",
    },
  });

  const handleAddRoute = async (newRouteData: ITruckRoute) => {
    try {
      const newRoute = await createTruckRoute(newRouteData);
      setRoutes([...routes, newRoute]);
      reset();
      notify.success("Route added successfully.");
    } catch (error: unknown) {
      logger.error(error);
      handleErrorNotification(error, "Route");
    }
  };

  const onRouteUpdate = async (routeId: string) => {
    try {
      const updatedRouteData = getValues();
      const updatedRoute = await updateTruckRoute(routeId, updatedRouteData);
      const updatedRoutes = routes.map((route) => {
        if (route.id === routeId) {
          return updatedRoute;
        }
        return route;
      });

      setRoutes(updatedRoutes);
      setEditingId(null);
      reset();
      notify.success("Route updated successfully.");
    } catch (error: unknown) {
      handleErrorNotification(error, "Route");
      logger.error(error);
    }
  };

  const handleEdit = (routeId: string) => {
    const targetRoute = routes.find((route) => route.id === routeId);
    if (!targetRoute) return;

    setValue("name", targetRoute.name);
    setValue("code", targetRoute.code);
    setFocus("name");
    setEditingId(routeId);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    reset();
  };

  const handleDelete = (routeId: string) => {
    notify.confirmDelete(async () => {
      try {
        await deleteTruckRoute(routeId);
        setRoutes(routes.filter((route) => route.id !== routeId));
        notify.success("Route deleted successfully.");
      } catch (error: unknown) {
        handleErrorNotification(error, "Route");
        logger.error(error);
      }
    });
  };

  useEffect(() => {
    if (data) {
      setRoutes(data);
    }
  }, [data]);

  const filteredRoutes = routes.filter(
    (route) =>
      route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.code.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (error) {
    return (
      <ErrorModal
        message={
          error instanceof Error ? error.message : "Failed to fetch routes data"
        }
      />
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Truck Routes Management</h2>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by Route Name or Short Code"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
        }}
        className="input input-bordered w-full mb-4"
      />

      {/* Form */}
      <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            placeholder="Enter Route Name"
            name={"name"}
            label={"Route Name"}
            register={register}
            errorMessage={errors.name?.message}
          />
          <FormField
            placeholder="Enter Short Code"
            name={"code"}
            label={"Short Code"}
            register={register}
            errorMessage={errors.code?.message}
          />
        </div>

        <Button
          onClick={
            editingId !== null
              ? handleSubmit(() => {
                  void onRouteUpdate(editingId);
                })
              : handleSubmit(handleAddRoute)
          }
          shape="info"
          pending={isSubmitting}
          className="mt-4"
        >
          {editingId !== null ? "Update Route" : "Add Route"}
        </Button>
        {editingId !== null && (
          <Button
            onClick={handleCancelEdit}
            shape="neutral"
            className="mt-4 ml-2"
          >
            Cancel
          </Button>
        )}
      </div>

      {isLoading && <div className="skeleton h-28 w-full"></div>}
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
                <tr
                  key={route.id}
                  className="border-b border-base-300 text-center"
                >
                  <td>{index + 1}</td>
                  <td>{route.name}</td>
                  <td>{route.code}</td>
                  <td className="p-1 flex gap-1 justify-center">
                    <button
                      onClick={() => {
                        route.id && handleEdit(route.id);
                      }}
                      className="flex items-center mt-2 justify-center"
                    >
                      <PencilSquareIcon className="w-5 h-5 text-info" />
                    </button>

                    <button
                      onClick={() => {
                        handleDelete(route.id ?? "");
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
          No routes added yet.
        </div>
      )}
    </div>
  );
};
