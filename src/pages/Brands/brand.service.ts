/* eslint-disable @typescript-eslint/no-explicit-any */
import { sendApiRequest } from "@/common/services/api.service";
import { type BrandFormData } from "./brand.schema";
import type { Tax } from "@/pages/Accounts/TaxAccounts/tax.schema";

type Freights = {
  route: any;
  routeName: string;
  routeCode: string;
  truckSharePerBag: number;
  amountPerBag: number;
};

type GetBrandResponse = {
  hasPurchaseCommission: boolean;
  company: any;
  id: string;
  name: string;
  code: string;
  weightPerBagKg: number;
  commissionPerBag: number;
  taxes: Tax[];
  freights: Freights[];
};

export const createBrand = async (data: BrandFormData) => {
  const response = await sendApiRequest("/brands", {
    method: "POST",
    withAuthorization: true,
    data,
  });
  return response;
};

export const fetchAllBrands = async () => {
  const response = await sendApiRequest<GetBrandResponse[]>("/brands", {
    method: "GET",
    withAuthorization: true,
  });
  return response;
};

export const updateBrand = async (id: string, data: BrandFormData) => {
  const response = await sendApiRequest<GetBrandResponse>(`/brands/${id}`, {
    method: "PATCH",
    withAuthorization: true,
    data,
  });
  return response;
};

export const deleteBrand = async (id: string) => {
  const response = await sendApiRequest(`/brands/${id}`, {
    method: "DELETE",
    withAuthorization: true,
  });
  return response;
};
