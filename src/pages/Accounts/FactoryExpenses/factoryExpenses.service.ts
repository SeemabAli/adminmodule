import { sendApiRequest } from "@/common/services/api.service";
import {
  type IFactoryExpenses,
  type AppliesTo,
  type RateType,
} from "./factoryExpenses.schema";

// API interface for factory expenses
interface IFactoryExpensesApiPayload {
  name: string;
  appliesTo: AppliesTo;
  rateType: RateType;
  fixedPerTonRate?: number;
  fixedAmountRate?: number;
  percentagePerTonRate?: number;
  tieredPrices?: {
    rangeId: string;
    price: number;
  }[];
  extraCharge?: number;
}

// Helper function to map UI form data to API payload
const prepareApiPayload = (
  data: IFactoryExpenses,
): IFactoryExpensesApiPayload => {
  return {
    name: data.name,
    appliesTo: data.type === "General" ? "GENERAL" : "SPECIFIC_PRODUCT",
    rateType: (() => {
      switch (data.expenseType) {
        case "Fixed Amount":
          return "FIXED_AMOUNT";
        case "Fixed/Ton":
          return "FIXED_PER_TON";
        case "Percent/Ton":
          return "PERCENTAGE_PER_TON";
        case "Range Ton From":
          return "RANGE";
        default:
          return "FIXED_AMOUNT";
      }
    })(),
    fixedPerTonRate:
      data.expenseType === "Fixed/Ton" ? data.fixedPerTonRate : undefined,
    fixedAmountRate:
      data.expenseType === "Fixed Amount" ? data.fixedAmountRate : undefined,
    percentagePerTonRate:
      data.expenseType === "Percent/Ton"
        ? data.percentagePerTonRate
        : undefined,
    tieredPrices: data.tieredPrices,
    extraCharge: data.extraCharge,
  };
};

export const createFactoryExpenses = async (data: IFactoryExpenses) => {
  const payload = prepareApiPayload(data);

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
  const payload = prepareApiPayload(data);

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
  try {
    const response = await sendApiRequest<
      { rangeFrom: number; rangeTo: number; id: string }[]
    >("/factory-expenses/tiered-price-ranges", {
      method: "GET",
      withAuthorization: true,
    });
    return response;
  } catch (error) {
    console.error("Error fetching ranges:", error);
    // Return empty array as fallback
    return [];
  }
};
