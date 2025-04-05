import { sendApiRequest } from "@/common/services/api.service";
import { type Employee } from "./employee.schema";

export const createEmployee = async (data: Employee) => {
  const response = await sendApiRequest<Employee>("/employees", {
    method: "POST",
    withAuthorization: true,
    data,
  });
  return response;
};

export const fetchAllEmployees = async () => {
  const response = await sendApiRequest<Employee[]>("/employees", {
    method: "GET",
    withAuthorization: true,
  });
  return response;
};

export const updateEmployee = async (id: string, data: Employee) => {
  const response = await sendApiRequest<Employee>(`/employees/${id}`, {
    method: "PATCH",
    withAuthorization: true,
    data,
  });
  return response;
};

export const deleteEmployee = async (id: string) => {
  const response = await sendApiRequest(`/employees/${id}`, {
    method: "DELETE",
    withAuthorization: true,
  });
  return response;
};

export const updateRole = async (id: string, data: { role: string }) => {
  const response = await sendApiRequest<Employee>(`/employees/${id}/roles`, {
    method: "PATCH",
    withAuthorization: true,
    data: {
      newRole: data.role,
    },
  });
  return response;
};
