import { sendApiRequest } from "@/common/services/api.service";
import { type FactoryExpenses } from "./factoryExpenses.schema";

export const createFactoryExpenses = async (data: FactoryExpenses) => {
  const response = await sendApiRequest<FactoryExpenses>("/factoryExpenses", {
    method: "POST",
    withAuthorization: true,
    data,
  });
  return response;
};

export const fetchAllFactoryExpenses = async () => {
  const response = await sendApiRequest<FactoryExpenses[]>("/factoryExpenses", {
    method: "GET",
    withAuthorization: true,
  });
  return response;
};

export const updateFactoryExpenses = async (
  id: string,
  data: FactoryExpenses,
) => {
  const response = await sendApiRequest<FactoryExpenses>(
    `/factoryExpenses/${id}`,
    {
      method: "PATCH",
      withAuthorization: true,
      data,
    },
  );
  return response;
};

export const deleteFactoryExpenses = async (id: string) => {
  const response = await sendApiRequest(`/factoryExpenses/${id}`, {
    method: "DELETE",
    withAuthorization: true,
  });
  return response;
};
