import { type DeliveryRoute } from "./deliveryRoute.schema";
import { sendApiRequest } from "@/common/services/api.service";

export const createRoute = async (data: DeliveryRoute) => {
  const response = await sendApiRequest("/delivery-routes", {
    method: "POST",
    withAuthorization: true,
    data,
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
