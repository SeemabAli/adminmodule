/* eslint-disable @typescript-eslint/no-explicit-any */
import { sendApiRequest } from "@/common/services/api.service";
import { type BrandFormData } from "./brand.schema";
import type { Tax } from "@/pages/Accounts/TaxAccounts/tax.schema";
import { parseIndianNumber } from "@/utils/CommaSeparator"; // Assuming you have a utility for number parsing

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

// Helper function to format commission per bag
const formatCommissionPerBag = (amount: number): number => {
  return Number(amount.toFixed(2)); // Example: Format as a number with 2 decimal places
};

export const createBrand = async (data: BrandFormData) => {
  const processedData = {
    ...data,
    commissionPerBag:
      typeof data.commissionPerBag === "string"
        ? parseIndianNumber(data.commissionPerBag)
        : Number(data.commissionPerBag ?? 0),
  };

  const response = await sendApiRequest("/brands", {
    method: "POST",
    withAuthorization: true,
    data: processedData,
  });
  return response;
};

export const fetchAllBrands = async () => {
  const response = await sendApiRequest<GetBrandResponse[]>("/brands", {
    method: "GET",
    withAuthorization: true,
  });

  // Format commission per bag for each brand
  return response.map((brand) => ({
    ...brand,
    commissionPerBag: formatCommissionPerBag(brand.commissionPerBag),
  }));
};

export const updateBrand = async (id: string, data: BrandFormData) => {
  const processedData = {
    ...data,
    commissionPerBag:
      typeof data.commissionPerBag === "string"
        ? parseIndianNumber(data.commissionPerBag)
        : Number(data.commissionPerBag ?? 0),
  };

  const response = await sendApiRequest<GetBrandResponse>(`/brands/${id}`, {
    method: "PATCH",
    withAuthorization: true,
    data: processedData,
  });

  // Format commission per bag after update
  return {
    ...response,
    commissionPerBag: formatCommissionPerBag(response.commissionPerBag),
  };
};

export const deleteBrand = async (id: string) => {
  const response = await sendApiRequest(`/brands/${id}`, {
    method: "DELETE",
    withAuthorization: true,
  });
  return response;
};
