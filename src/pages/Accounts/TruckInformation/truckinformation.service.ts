import { sendApiRequest } from "@/common/services/api.service";
import { type TruckInformation } from "./truckinformation.schema";

export const createTruckInformation = async (data: TruckInformation) => {
  const response = await sendApiRequest<TruckInformation>(
    "/truck-information",
    {
      method: "POST",
      withAuthorization: true,
      data,
    },
  );
  return response;
};

export const fetchAllTruckInformation = async () => {
  const response = await sendApiRequest<TruckInformation[]>(
    "/truck-information",
    {
      method: "GET",
      withAuthorization: true,
    },
  );
  return response;
};

export const updateTruckInformation = async (
  id: string,
  data: TruckInformation,
) => {
  const response = await sendApiRequest<TruckInformation>(
    `/truck-information/${id}`,
    {
      method: "PATCH",
      withAuthorization: true,
      data,
    },
  );
  return response;
};

export const deleteTruckInformation = async (id: string) => {
  const response = await sendApiRequest(`/truck-information/${id}`, {
    method: "DELETE",
    withAuthorization: true,
  });
  return response;
};
