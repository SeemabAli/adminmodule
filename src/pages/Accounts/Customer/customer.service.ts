import { sendApiRequest } from "@/common/services/api.service";
import type { ICustomer } from "./customer.schema";

export const createCustomer = async (data: ICustomer) => {
  const response = await sendApiRequest<ICustomer>("/customers", {
    method: "POST",
    withAuthorization: true,
    data,
  });
  return response;
};

export const fetchAllCustomers = async () => {
  const response = await sendApiRequest<ICustomer[]>("/customers", {
    method: "GET",
    withAuthorization: true,
  });
  return response;
};

export const updateCustomer = async (id: string, data: ICustomer) => {
  const response = await sendApiRequest<ICustomer>(`/customers/${id}`, {
    method: "PATCH",
    withAuthorization: true,
    data,
  });
  return response;
};

export const deleteCustomer = async (id: string) => {
  const response = await sendApiRequest(`/customers/${id}`, {
    method: "DELETE",
    withAuthorization: true,
  });
  return response;
};
