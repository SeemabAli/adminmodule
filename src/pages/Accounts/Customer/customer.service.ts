import { sendApiRequest } from "@/common/services/api.service";
import type { Customer } from "./customer.schema";

export const createCustomer = async (data: Customer) => {
  const response = await sendApiRequest<Customer>("/customers", {
    method: "POST",
    withAuthorization: true,
    data,
  });
  return response;
};

export const fetchAllCustomers = async () => {
  const response = await sendApiRequest<Customer[]>("/customers", {
    method: "GET",
    withAuthorization: true,
  });
  return response;
};

export const updateCustomer = async (id: string, data: Customer) => {
  const response = await sendApiRequest<Customer>(`/customers/${id}`, {
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
