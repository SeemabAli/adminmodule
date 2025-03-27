import { sendApiRequest } from "@/common/services/api.service";
import { type TruckOtherExpenses } from "./truckotherexpenses.schema";

export const createTruckOtherExpenses = async (data: TruckOtherExpenses) => {
  const response = await sendApiRequest<TruckOtherExpenses>("/truck-expenses", {
    method: "POST",
    withAuthorization: true,
    data: {
      ...data,
      firstTrip: data.firstTrip ?? null,
      secondTrip: data.secondTrip ?? null,
      thirdTrip: data.thirdTrip ?? null,
    },
  });
  return response;
};

export const fetchAllTruckOtherExpenses = async () => {
  const response = await sendApiRequest<TruckOtherExpenses[]>(
    "/truck-expenses",
    {
      method: "GET",
      withAuthorization: true,
    },
  );
  return response;
};

export const updateTruckOtherExpenses = async (
  id: string,
  data: TruckOtherExpenses,
) => {
  const response = await sendApiRequest<TruckOtherExpenses>(
    `/truck-expenses/${id}`,
    {
      method: "PATCH",
      withAuthorization: true,
      data: {
        ...data,
        firstTrip: data.firstTrip ?? null,
        secondTrip: data.secondTrip ?? null,
        thirdTrip: data.thirdTrip ?? null,
      },
    },
  );
  return response;
};

export const deleteTruckOtherExpenses = async (id: string) => {
  const response = await sendApiRequest(`/truck-expenses/${id}`, {
    method: "DELETE",
    withAuthorization: true,
  });
  return response;
};
