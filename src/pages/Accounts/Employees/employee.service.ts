import { sendApiRequest } from "@/common/services/api.service";
import { type Employee } from "./employee.schema";

export const createEmployee = async (data: Employee) => {
  const response = await sendApiRequest("/employee", {
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
