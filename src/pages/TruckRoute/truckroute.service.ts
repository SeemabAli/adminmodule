import { sendApiRequest } from "@/common/services/api.service";
import { type TruckRoute } from "./truckroute.schema";

export const createTruckRoute = async (data: TruckRoute) => {
  const response = await sendApiRequest<TruckRoute>("/truck-route", {
    method: "POST",
    withAuthorization: true,
    data,
  });
  return response;
};

export const fetchAllTruckRoute = async () => {
  const response = await sendApiRequest<TruckRoute[]>("/truck-route", {
    method: "GET",
    withAuthorization: true,
  });
  return response;
};

export const updateTruckRoute = async (id: string, data: TruckRoute) => {
  const response = await sendApiRequest<TruckRoute>(`/truck-route/${id}`, {
    method: "PATCH",
    withAuthorization: true,
    data,
  });
  return response;
};

export const deleteTruckRoute = async (id: string) => {
  const response = await sendApiRequest(`/truck-route/${id}`, {
    method: "DELETE",
    withAuthorization: true,
  });
  return response;
};
