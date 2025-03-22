import { sendApiRequest } from "@/common/services/api.service";
import type { Tax, TaxApplication } from "./tax.schema";

export interface TaxRequestPayload extends Omit<Tax, "applicableOn"> {
  applicationIds: string[];
  applicableOn?: { id: string; name: string }[];
}

export const createTax = async (data: TaxRequestPayload) => {
  const response = await sendApiRequest("/taxes", {
    method: "POST",
    withAuthorization: true,
    data,
  });
  return response;
};

export const fetchAllTaxes = async () => {
  const response = await sendApiRequest<Tax[]>("/taxes", {
    method: "GET",
    withAuthorization: true,
  });
  return response;
};

export const fetchTaxApplications = async () => {
  const response = await sendApiRequest<TaxApplication[]>(
    `/taxes/applications`,
    {
      method: "GET",
      withAuthorization: true,
    },
  );
  return response;
};

export const updateTax = async (id: string, data: TaxRequestPayload) => {
  const response = await sendApiRequest(`/taxes/${id}`, {
    method: "PATCH",
    withAuthorization: true,
    data,
  });
  return response;
};

export const deleteTax = async (id: string) => {
  const response = await sendApiRequest(`/taxes/${id}`, {
    method: "DELETE",
    withAuthorization: true,
  });
  return response;
};
