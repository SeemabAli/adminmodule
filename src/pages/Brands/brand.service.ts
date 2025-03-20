import { sendApiRequest } from "@/common/services/api.service";
import { type BrandFormData } from "./brand.schema";

export const createBrand = async (data: BrandFormData) => {
  const response = await sendApiRequest("/brands", {
    method: "POST",
    withAuthorization: true,
    data,
  });
  return response;
};

export const fetchAllBrands = async () => {
  const response = await sendApiRequest<BrandFormData[]>("/brands", {
    method: "GET",
    withAuthorization: true,
  });
  return response;
};
