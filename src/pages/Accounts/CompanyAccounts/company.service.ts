import { type Company } from "./company.schema";
import { sendApiRequest } from "@/common/services/api.service";

export const createCompany = async (data: Company) => {
  const response = await sendApiRequest("/companies", {
    method: "POST",
    data,
  });
  return response;
};

export const fetchAllCompanies = async () => {
  const response = await sendApiRequest<Company[]>("/companies", {
    method: "GET",
  });
  return response;
};
