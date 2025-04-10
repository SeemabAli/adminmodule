import { type DeliveryRoute } from "./deliveryRoute.schema";
import { sendApiRequest } from "@/common/services/api.service";
import { parseIndianNumber } from "@/utils/CommaSeparator";

export const createRoute = async (data: DeliveryRoute) => {
  // Create a processed copy of the data to ensure proper number handling
  const processedData = {
    ...data,
    // If toll exists and amount is a string, parse it to a number
    toll: data.toll
      ? {
          ...data.toll,
          amount:
            typeof data.toll.amount === "string"
              ? parseIndianNumber(data.toll.amount)
              : Number(data.toll.amount ?? 0),
        }
      : undefined,
  };

  const response = await sendApiRequest<DeliveryRoute>("/delivery-routes", {
    method: "POST",
    withAuthorization: true,
    data: processedData,
  });
  return response;
};

export const fetchAllRoutes = async () => {
  const response = await sendApiRequest<DeliveryRoute[]>("/delivery-routes", {
    method: "GET",
    withAuthorization: true,
  });
  return response;
};

export const updateDeliveryRoute = async (id: string, data: DeliveryRoute) => {
  // Create a processed copy of the data to ensure proper number handling
  const processedData = {
    ...data,
    // If toll exists and amount is a string, parse it to a number
    toll: data.toll
      ? {
          ...data.toll,
          amount:
            typeof data.toll.amount === "string"
              ? parseIndianNumber(data.toll.amount)
              : Number(data.toll.amount ?? 0),
        }
      : undefined,
  };

  const response = await sendApiRequest<DeliveryRoute>(
    `/delivery-routes/${id}`,
    {
      method: "PATCH",
      withAuthorization: true,
      data: processedData,
    },
  );
  return response;
};

export const deleteDeliveryRoute = async (id: string) => {
  const response = await sendApiRequest(`/delivery-routes/${id}`, {
    method: "DELETE",
    withAuthorization: true,
  });
  return response;
};
