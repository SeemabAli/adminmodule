import { sendApiRequest } from "@/common/services/api.service";
import { type TruckOtherExpenses } from "./truckotherexpenses.schema";
import { parseIndianNumber } from "@/utils/CommaSeparator";

export const createTruckOtherExpenses = async (data: TruckOtherExpenses) => {
  // Create a new object to avoid mutating the original data
  const processedData = {
    ...data,
    // Ensure values are numbers when sending to API
    firstTrip:
      typeof data.firstTrip === "string"
        ? parseIndianNumber(data.firstTrip)
        : Number(data.firstTrip ?? 0),
    secondTrip:
      typeof data.secondTrip === "string"
        ? parseIndianNumber(data.secondTrip)
        : Number(data.secondTrip ?? 0),
    thirdTrip:
      typeof data.thirdTrip === "string"
        ? parseIndianNumber(data.thirdTrip)
        : Number(data.thirdTrip ?? 0),
  };

  const response = await sendApiRequest<TruckOtherExpenses>("/truck-expenses", {
    method: "POST",
    withAuthorization: true,
    data: processedData,
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
  // Create a new object to avoid mutating the original data
  const processedData = {
    ...data,
    // Ensure values are numbers when sending to API
    firstTrip:
      typeof data.firstTrip === "string"
        ? parseIndianNumber(data.firstTrip)
        : Number(data.firstTrip ?? 0),
    secondTrip:
      typeof data.secondTrip === "string"
        ? parseIndianNumber(data.secondTrip)
        : Number(data.secondTrip ?? 0),
    thirdTrip:
      typeof data.thirdTrip === "string"
        ? parseIndianNumber(data.thirdTrip)
        : Number(data.thirdTrip ?? 0),
  };

  const response = await sendApiRequest<TruckOtherExpenses>(
    `/truck-expenses/${id}`,
    {
      method: "PATCH",
      withAuthorization: true,
      data: processedData,
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
