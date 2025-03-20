import { sendApiRequest } from "@/common/services/api.service";
import { type BrandFormData } from "./brand.schema";

export const updateBrand = async (id: string, data: BrandFormData) => {
  const response = await sendApiRequest(`/brands/${id}`, {
    method: "PUT",
    withAuthorization: true,
    data,
  });
  return response;
};
