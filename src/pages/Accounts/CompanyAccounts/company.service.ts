import { type Company } from "./company.schema";
import { sendApiRequest } from "@/common/services/api.service";

export const createCompany = async (data: Company) => {
  const response = await sendApiRequest("/companies", {
    method: "POST",
    withAuthorization: true,
    data,
  });
  return response;
};

export const fetchAllCompanies = async () => {
  const response = await sendApiRequest<Company[]>("/companies", {
    method: "GET",
    withAuthorization: true,
  });
  return response;
};

export const updateCompany = async (id: string, data: Company) => {
  const response = await sendApiRequest(`/companies/${id}`, {
    method: "PUT",
    withAuthorization: true,
    data,
  });
  return response;
};

export const deleteCompany = async (id: string) => {
  const response = await sendApiRequest(`/companies/${id}`, {
    method: "DELETE",
    withAuthorization: true,
  });
  return response;
};
