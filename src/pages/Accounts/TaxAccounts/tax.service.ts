import { sendApiRequest } from "@/common/services/api.service";
import type { Tax, TaxApplication } from "./tax.schema";
import { parseIndianNumber } from "@/utils/CommaSeparator";

export interface TaxRequestPayload extends Omit<Tax, "applications"> {
  applicationIds: string[];
  applications?: { id: string; name: string }[];
}

export const createTax = async (data: TaxRequestPayload) => {
  // Create a processed copy of the data to ensure proper number handling
  const processedData = {
    ...data,
    // Handle number formatting for fixed rate type
    rateValue:
      data.rateType === "FIXED" && typeof data.rateValue === "string"
        ? parseIndianNumber(data.rateValue)
        : Number(data.rateValue ?? 0),
  };

  const response = await sendApiRequest("/taxes", {
    method: "POST",
    withAuthorization: true,
    data: processedData,
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
  // Create a processed copy of the data to ensure proper number handling
  const processedData = {
    ...data,
    // Handle number formatting for fixed rate type
    rateValue:
      data.rateType === "FIXED" && typeof data.rateValue === "string"
        ? parseIndianNumber(data.rateValue)
        : Number(data.rateValue ?? 0),
  };

  const response = await sendApiRequest(`/taxes/${id}`, {
    method: "PATCH",
    withAuthorization: true,
    data: processedData,
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
