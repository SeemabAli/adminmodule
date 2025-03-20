import { sendApiRequest } from "@/common/services/api.service";
import { type TaxFormData } from "./tax.schema";

export const updateTaxFormData = async (id: string, data: TaxFormData) => {
  const response = await sendApiRequest(`/taxes/${id}`, {
    method: "PUT",
    withAuthorization: true,
    data,
  });
  return response;
};
