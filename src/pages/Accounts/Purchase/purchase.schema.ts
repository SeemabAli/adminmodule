import { z } from "zod";

// Define the purchase item schema
export const purchaseItemSchema = z.object({
  id: z.string().optional(),
  brandId: z.string().min(1, "Brand is required"),
  brandName: z.string().optional(),
  routeId: z.string().min(1, "Route is required"),
  routeName: z.string().optional(),
  qtyInTon: z.number().min(0.01, "Quantity must be greater than 0"),
  bags: z.number().optional(),
  freightPerBag: z.number().optional(),
  totalFreight: z.number().optional(),
  ratePerTon: z.number().min(0.01, "Rate per ton must be greater than 0"),
  ratePerBag: z.number().optional(),
  unitPrice: z.number().optional(),
  totalPrice: z.number().optional(),
  commissionPerBag: z.number().optional(),
  whtTax: z.number().optional(),
});

// Define the purchase schema
export const purchaseSchema = z.object({
  transactionDate: z.string(),
  companyId: z.string().min(1, "Company is required"),
  truckId: z.string().min(1, "Truck is required"),
  truckStatus: z.string().optional(),
  driverId: z.string().optional(),
  driverName: z.string().optional(),
  items: z.array(purchaseItemSchema).optional(),
});

// Type definitions based on the schema
export type PurchaseItem = z.infer<typeof purchaseItemSchema>;
export type PurchaseFormData = z.infer<typeof purchaseSchema>;

// Type definitions for other entities used in the component
export type Company = {
  id: string;
  name: string;
};

export type Truck = {
  id: string;
  number: string;
  sourcingType: string;
};

export type Driver = {
  id: string;
  name: string;
};

export type Route = {
  id: string;
  name: string;
};

export type Brand = {
  id: string;
  name: string;
  company: { id: string };
  freights: {
    route: Route;
    amountPerBag: number;
    truckSharePerBag: number;
  }[];
};
