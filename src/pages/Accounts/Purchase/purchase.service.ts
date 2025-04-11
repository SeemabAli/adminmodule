/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { sendApiRequest } from "@/common/services/api.service";
import {
  type Brand,
  type Company,
  type Driver,
  type PurchaseFormData,
  type Route,
  type Truck,
} from "./purchase.schema";

export const createPurchase = async (data: PurchaseFormData) => {
  const response = await sendApiRequest<PurchaseFormData>("/purchases", {
    method: "POST",
    withAuthorization: true,
    data,
  });
  return response;
};

export const fetchAllPurchases = async () => {
  const response = await sendApiRequest<PurchaseFormData[]>("/purchases", {
    method: "GET",
    withAuthorization: true,
  });
  return response;
};

export const updatePurchase = async (id: string, data: PurchaseFormData) => {
  const response = await sendApiRequest<PurchaseFormData>(`/purchases/${id}`, {
    method: "PATCH",
    withAuthorization: true,
    data,
  });
  return response;
};

export const deletePurchase = async (id: string) => {
  const response = await sendApiRequest(`/purchases/${id}`, {
    method: "DELETE",
    withAuthorization: true,
  });
  return response;
};

// Updated to fetch employees with department "DRIVER"
export const fetchAllDrivers = async () => {
  const response = await sendApiRequest<any[]>("/employees/drivers", {
    method: "GET",
    withAuthorization: true,
  });
  return response;
};
