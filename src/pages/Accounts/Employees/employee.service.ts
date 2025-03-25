import { sendApiRequest } from "@/common/services/api.service";
import { type Employee } from "./employee.schema";

export const createEmployee = async (data: Employee) => {
  const response = await sendApiRequest<Employee>("/employee", {
    method: "POST",
    withAuthorization: true,
    data,
  });
  return response;
};

export const fetchAllEmployees = async () => {
  const response = await sendApiRequest<Employee[]>("/employee", {
    method: "GET",
    withAuthorization: true,
  });
  return response;
};

export const updateEmployee = async (id: string, data: Employee) => {
  const response = await sendApiRequest<Employee>(`/employee/${id}`, {
    method: "PATCH",
    withAuthorization: true,
    data,
  });
  return response;
};

export const deleteEmployee = async (id: string) => {
  const response = await sendApiRequest(`/employee/${id}`, {
    method: "DELETE",
    withAuthorization: true,
  });
  return response;
};
