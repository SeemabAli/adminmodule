import { sendApiRequest } from "@/common/services/api.service";
import { type Purchase } from "./purchase.schema";

export const createPurchase = async (data: Purchase) => {
  const response = await sendApiRequest<Purchase>("/purchase", {
    method: "POST",
    withAuthorization: true,
    data,
  });
  return response;
};

export const fetchAllPurchase = async () => {
  const response = await sendApiRequest<Purchase[]>("/purchase", {
    method: "GET",
    withAuthorization: true,
  });
  return response;
};

export const updatePurchase = async (id: string, data: Purchase) => {
  const response = await sendApiRequest<Purchase>(`/purchase/${id}`, {
    method: "PATCH",
    withAuthorization: true,
    data,
  });
  return response;
};

export const deletePurchase = async (id: string) => {
  const response = await sendApiRequest(`/purchase/${id}`, {
    method: "DELETE",
    withAuthorization: true,
  });
  return response;
};
