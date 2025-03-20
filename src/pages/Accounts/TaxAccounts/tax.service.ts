import { sendApiRequest } from "@/common/services/api.service";
import type { Tax } from "./TaxAccounts";

export const createTax = async (data: Tax) => {
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
