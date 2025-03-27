import { sendApiRequest } from "@/common/services/api.service";
import { type ITruckInformation } from "./truckinformation.schema";

export const createTruckInformation = async (data: ITruckInformation) => {
  const response = await sendApiRequest<ITruckInformation>("/trucks", {
    method: "POST",
    withAuthorization: true,
    data,
  });
  return response;
};

export const fetchAllTruckInformation = async () => {
  const response = await sendApiRequest<ITruckInformation[]>("/trucks", {
    method: "GET",
    withAuthorization: true,
  });
  return response;
};

export const updateTruckInformation = async (
  id: string,
  data: ITruckInformation,
) => {
  const response = await sendApiRequest<ITruckInformation>(`/trucks/${id}`, {
    method: "PATCH",
    withAuthorization: true,
    data,
  });
  return response;
};

export const deleteTruckInformation = async (id: string) => {
  const response = await sendApiRequest(`/trucks/${id}`, {
    method: "DELETE",
    withAuthorization: true,
  });
  return response;
};
