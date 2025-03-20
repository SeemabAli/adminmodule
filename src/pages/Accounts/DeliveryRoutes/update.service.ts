import { sendApiRequest } from "@/common/services/api.service";
import { type DeliveryRoute } from "./deliveryRoute.schema";

export const updateDeliveryRoute = async (id: string, data: DeliveryRoute) => {
  const response = await sendApiRequest(`/delivery-routes/${id}`, {
    method: "PUT",
    withAuthorization: true,
    data,
  });
  return response;
};
