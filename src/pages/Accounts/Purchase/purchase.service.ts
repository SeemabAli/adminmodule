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

// Related data services
export const fetchAllCompanies = async () => {
  const response = await sendApiRequest<Company[]>("/companies", {
    method: "GET",
    withAuthorization: true,
  });
  return response;
};

export const fetchAllTrucks = async () => {
  const response = await sendApiRequest<Truck[]>("/trucks", {
    method: "GET",
    withAuthorization: true,
  });
  return response;
};

export const fetchAllDrivers = async () => {
  const response = await sendApiRequest<Driver[]>("/drivers", {
    method: "GET",
    withAuthorization: true,
  });
  return response;
};

export const fetchAllRoutes = async () => {
  const response = await sendApiRequest<Route[]>("/routes", {
    method: "GET",
    withAuthorization: true,
  });
  return response;
};

export const fetchAllBrands = async () => {
  const response = await sendApiRequest<Brand[]>("/brands", {
    method: "GET",
    withAuthorization: true,
  });
  return response;
};
