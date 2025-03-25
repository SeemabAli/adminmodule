import { z } from "zod";

export const purchaseSchema = z.object({
  id: z.string().optional(),
  transactionDate: z.string().nonempty("Transaction date is required"),
  companyId: z.string().nonempty("Company is required"),
  purchaseOrderId: z.string().nonempty("Purchase order ID is required"),
  truckId: z.string().nonempty("Truck is required"),
  truckStatus: z.string().nonempty("Truck status is required"),
  driverId: z.string().nonempty("Driver is required"),
  driverName: z.string().nonempty("Driver name is required"),
  saleRouteId: z.string().optional(),
  items: z.array(
    z.object({
      brandId: z.string().nonempty("Brand is required"),
      routeId: z.string().nonempty("Route is required"),
      qtyInTon: z
        .number()
        .positive("Quantity must be positive")
        .or(z.string().regex(/^\d+$/).transform(Number))
        .refine((val) => val > 0, "Quantity must be greater than 0"),
      bags: z.number().positive(),
      freightPerBag: z.number().positive(),
      totalFreight: z.number().positive(),
      ratePerTon: z.number().positive(),
      ratePerBag: z.number().positive(),
      unitPrice: z.number().positive(),
      totalPrice: z.number().positive(),
      commissionPerBag: z.number().nonnegative(),
      whtTax: z.number().nonnegative(),
    }),
  ),
});

export type PurchaseFormData = z.infer<typeof purchaseSchema>;

// Additional types for related entities
export type Company = {
  id: string;
  name: string;
};

export type Truck = {
  id: string;
  name: string;
  status: "Company Own" | "Outsource";
};

export type Driver = {
  id: string;
  name: string;
};

export type Route = {
  id: string;
  name: string;
  companyFreight: number;
  truckFreight: number;
};

export type Brand = {
  id: string;
  name: string;
  companyId: string;
  weightPerBagKg: number;
  commissionPerBag: number;
};

export type PurchaseItem = {
  id: string;
  brandId: string;
  brandName: string;
  routeId: string;
  routeName: string;
  qtyInTon: number;
  bags: number;
  freightPerBag: number;
  totalFreight: number;
  ratePerTon: number;
  ratePerBag: number;
  unitPrice: number;
  totalPrice: number;
  commissionPerBag: number;
  whtTax: number;
};
