import { sendApiRequest } from "@/common/services/api.service";
import { type BrandFormData } from "./brand.schema";
import type { Tax } from "../Accounts/TaxAccounts/TaxAccounts";

type Freights = {
  routeName: string;
  routeCode: string;
  truckSharePerBag: number;
  amountPerBag: number;
};

type GetBrandResponse = {
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
