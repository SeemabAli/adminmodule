import { sendApiRequest } from "@/common/services/api.service";
import {
  type IFactoryExpenses,
  type AppliesTo,
  type RateType,
} from "./factoryExpenses.schema";

// Helper function to map UI types to API types
const mapExpenseTypeToRateType = (expenseType: string): RateType => {
  switch (expenseType) {
    case "Fixed Amount":
      return "FIXED_AMOUNT";
    case "Fixed/Ton":
      return "FIXED_PER_TON";
    case "Percent/Ton":
      return "PERCENTAGE_PER_TON";
    case "Range Ton From":
      return "TIERED";
    default:
      return "FIXED_AMOUNT";
  }
};

const mapTypeToAppliesTo = (type: string): AppliesTo => {
  return type === "General" ? "GENERAL" : "SPECIFIC_PRODUCT";
};

export const createFactoryExpenses = async (data: IFactoryExpenses) => {
  const payload = {
    name: data.name,
    appliesTo: mapTypeToAppliesTo(data.type ?? "General"),
    rateType: mapExpenseTypeToRateType(data.expenseType ?? "Fixed Amount"),
    fixedPerTonRate: data.fixedPerTonRate,
    fixedAmountRate: data.fixedAmountRate,
    percentagePerTonRate: data.percentagePerTonRate,
    tieredPrices: data.tieredPrices ?? [],
  };

  const response = await sendApiRequest<IFactoryExpenses>("/factory-expenses", {
    method: "POST",
    withAuthorization: true,
    data: payload,
  });
  return response;
};

export const fetchAllFactoryExpenses = async () => {
  const response = await sendApiRequest<IFactoryExpenses[]>(
    "/factory-expenses",
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
  const payload = {
    name: data.name,
    appliesTo: mapTypeToAppliesTo(data.type ?? "General"),
    rateType: mapExpenseTypeToRateType(data.expenseType ?? "Fixed Amount"),
    fixedPerTonRate: data.fixedPerTonRate,
    fixedAmountRate: data.fixedAmountRate,
    percentagePerTonRate: data.percentagePerTonRate,
    tieredPrices: data.tieredPrices ?? [],
  };

  const response = await sendApiRequest<IFactoryExpenses>(
    `/factory-expenses/${id}`,
    {
      method: "PATCH",
      withAuthorization: true,
      data: payload,
    },
  );
  return response;
};

export const deleteFactoryExpenses = async (id: string) => {
  const response = await sendApiRequest(`/factory-expenses/${id}`, {
    method: "DELETE",
    withAuthorization: true,
  });
  return response;
};

export const fetchAllRanges = async () => {
  const response = await sendApiRequest<
    { rangeFrom: number; rangeTo: number }[]
  >("/factory-expenses/tiered-price-ranges", {
    method: "GET",
    withAuthorization: true,
  });
  return response;
};

export const createRanges = async (
  data: {
    rangeFrom: number;
    rangeTo: number;
    value: number;
  }[],
) => {
  const response = await sendApiRequest(
    "/factory-expenses/tiered-price-ranges",
    {
      method: "POST",
      withAuthorization: true,
      data,
    },
  );
  return response;
};
