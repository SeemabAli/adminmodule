import { sendApiRequest } from "@/common/services/api.service";
import { type IFactoryExpenses } from "./factoryExpenses.schema";

export const createFactoryExpenses = async (data: IFactoryExpenses) => {
  const response = await sendApiRequest<IFactoryExpenses>("/factoryExpenses", {
    method: "POST",
    withAuthorization: true,
    data,
  });
  return response;
};

export const fetchAllFactoryExpenses = async () => {
  const response = await sendApiRequest<IFactoryExpenses[]>(
    "/factoryExpenses",
    {
      method: "GET",
      withAuthorization: true,
    },
  );
  return response;
};

export const updateFactoryExpenses = async (
  id: string,
  data: IFactoryExpenses,
) => {
  const response = await sendApiRequest<IFactoryExpenses>(
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
