import { sendApiRequest } from "@/common/services/api.service";
import { type ITruckRoute } from "./truckroute.schema";

export const createTruckRoute = async (data: ITruckRoute) => {
  const response = await sendApiRequest<ITruckRoute>("/trucks/routes", {
    method: "POST",
    withAuthorization: true,
    data,
  });
  return response;
};

export const fetchAllTruckRoute = async () => {
  const response = await sendApiRequest<ITruckRoute[]>("/trucks/routes", {
    method: "GET",
    withAuthorization: true,
  });
  return response;
};

export const updateTruckRoute = async (id: string, data: ITruckRoute) => {
  const response = await sendApiRequest<ITruckRoute>(`/trucks/routes/${id}`, {
    method: "PATCH",
    withAuthorization: true,
    data,
  });
  return response;
};

export const deleteTruckRoute = async (id: string) => {
  const response = await sendApiRequest(`/trucks/routes/${id}`, {
    method: "DELETE",
    withAuthorization: true,
  });
  return response;
};
