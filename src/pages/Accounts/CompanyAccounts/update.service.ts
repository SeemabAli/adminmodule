import { sendApiRequest } from "@/common/services/api.service";
import { type Company } from "./company.schema";

export const updateCompany = async (id: string, data: Company) => {
  const response = await sendApiRequest(`/companies/${id}`, {
    method: "PUT",
    withAuthorization: true,
    data,
  });
  return response;
};
