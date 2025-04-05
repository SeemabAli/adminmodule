/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Utilities and hooks
import { logger } from "@/lib/logger";
import { notify } from "@/lib/notify";
import { useService } from "@/common/hooks/custom/useService";

// Components
import { ErrorModal } from "@/common/components/Error";
import PurchaseHeader from "./PurchaseHeader";
import PurchaseItemForm from "./PurchaseItemForm";
import PurchaseItemsTable from "./PurchaseItemsTable";

// Types and schema
import {
  purchaseSchema,
  type PurchaseFormData,
  type PurchaseItem,
} from "./purchase.schema";

// Services
import {
  createPurchase,
  fetchAllPurchases,
  updatePurchase,
  fetchAllDrivers,
} from "./purchase.service";
import { fetchAllCompanies } from "../CompanyAccounts/company.service";
import { fetchAllTruckInformation } from "@/pages/Accounts/TruckInformation/truckinformation.service";
import { fetchAllBrands } from "@/pages/Brands/brand.service";

const Purchase = () => {
  // Current date formatted as YYYY-MM-DD
  const today = useMemo(() => new Date().toISOString().split("T")[0] ?? "", []);

  // Form setup with React Hook Form
  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    trigger,
  } = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      transactionDate: today,
      items: [],
    },
  });

  // State management
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [routeFreight, setRouteFreight] = useState({
    amountPerBag: 0,
    truckSharePerBag: 0,
  });
  const [brandRoutes, setBrandRoutes] = useState<any[]>([]);

  // Load data using useService hook
  const { error: purchasesError, isLoading: isPurchasesLoading } =
    useService(fetchAllPurchases);
  const {
    data: companies,
    error: companiesError,
    isLoading: isCompaniesLoading,
  } = useService(fetchAllCompanies);
  const {
    data: trucks,
    error: trucksError,
    isLoading: isTrucksLoading,
  } = useService(fetchAllTruckInformation);
  const {
    data: drivers,
    error: driversError,
    isLoading: isDriversLoading,
  } = useService(fetchAllDrivers);
  const {
    data: brands,
    error: brandsError,
    isLoading: isBrandsLoading,
  } = useService(fetchAllBrands);

  // Form values being watched
  const selectedCompany = watch("companyId");
  const selectedTruck = watch("truckId");
  const selectedBrand = watch("items.0.brandId");
  const selectedRoute = watch("items.0.routeId");
  const qtyInTon = watch("items.0.qtyInTon");
  const ratePerTon = watch("items.0.ratePerTon");

  // Loading state
  const isLoading =
    isPurchasesLoading ||
    isCompaniesLoading ||
    isTrucksLoading ||
    isDriversLoading ||
    isBrandsLoading;

  // Handle errors
  const dataError =
    purchasesError ??
    companiesError ??
    trucksError ??
    driversError ??
    brandsError;
  if (dataError) {
    const errorMessage =
      (dataError as { message?: string })?.message ?? "Failed to fetch data";
    return <ErrorModal message={errorMessage} />;
  }

  // Handle truck selection
  useEffect(() => {
    if (selectedTruck && trucks) {
      const truck = trucks.find((t) => t.id === selectedTruck);
      if (truck) {
        setValue("truckStatus", truck.sourcingType);
      }
    }
  }, [selectedTruck, trucks, setValue]);

  // Handle brand selection
  useEffect(() => {
    if (selectedBrand && brands) {
      const brand = brands.find((b) => b.id === selectedBrand);
      if (brand?.freights) {
        setBrandRoutes(brand.freights);
      } else {
        setBrandRoutes([]);
      }
    } else {
      setBrandRoutes([]);
    }
  }, [selectedBrand, brands]);

  // Handle route selection
  useEffect(() => {
    if (selectedRoute && brandRoutes.length > 0) {
      const freight = brandRoutes.find(
        (freight) => freight.route.id === selectedRoute,
      );

      if (freight) {
        setRouteFreight({
          amountPerBag: freight.amountPerBag,
          truckSharePerBag: freight.truckSharePerBag,
        });
      } else {
        setRouteFreight({ amountPerBag: 0, truckSharePerBag: 0 });
      }
    }
  }, [selectedRoute, brandRoutes]);

  // Calculate derived values when inputs change
  useEffect(() => {
    if (qtyInTon) {
      // Convert tons to bags (1 ton = 20 bags)
      const calculatedBags = qtyInTon * 20;
      setValue("items.0.bags", calculatedBags);

      // Calculate freight
      if (routeFreight.truckSharePerBag) {
        const freightPerBag = routeFreight.truckSharePerBag;
        setValue("items.0.freightPerBag", freightPerBag);
        setValue("items.0.totalFreight", freightPerBag * calculatedBags);
      }

      // Calculate rates and pricing
      if (ratePerTon) {
        const calculatedRatePerBag = ratePerTon / 20;
        setValue("items.0.ratePerBag", calculatedRatePerBag);

        const unitPrice =
          calculatedRatePerBag + (getValues("items.0.freightPerBag") ?? 0);
        setValue("items.0.unitPrice", unitPrice);

        setValue("items.0.totalPrice", calculatedBags * unitPrice);
      }
    }
  }, [qtyInTon, ratePerTon, routeFreight, setValue, getValues]);

  // Add or update item in the grid
  const handleAddToGrid = async () => {
    const isValid = await trigger("items.0");
    if (!isValid) return;

    const currentItem = getValues("items.0");
    const brandItem = brands?.find((b) => b.id === currentItem.brandId);

    // Find route name from brand freights
    let routeName = "";
    if (brandItem?.freights) {
      const routeFreight = brandItem.freights.find(
        (f) => f.route.id === currentItem.routeId,
      );
      if (routeFreight) {
        routeName = routeFreight.route.name;
      }
    }

    if (!brandItem || !routeName) return;

    const purchaseItem: PurchaseItem = {
      id:
        editingIndex !== null
          ? (purchaseItems[editingIndex]?.id ?? "")
          : Date.now().toString(),
      brandId: currentItem.brandId,
      brandName: brandItem.name,
      routeId: currentItem.routeId,
      routeName,
      qtyInTon: currentItem.qtyInTon,
      bags: currentItem.bags,
      freightPerBag: currentItem.freightPerBag,
      totalFreight: currentItem.totalFreight,
      ratePerTon: currentItem.ratePerTon,
      ratePerBag: currentItem.ratePerBag,
      unitPrice: currentItem.unitPrice,
      totalPrice: currentItem.totalPrice,
      commissionPerBag: currentItem.commissionPerBag,
      whtTax: currentItem.whtTax,
    };

    if (editingIndex !== null) {
      // Update existing item
      const updatedItems = [...purchaseItems];
      updatedItems[editingIndex] = purchaseItem;
      setPurchaseItems(updatedItems);
      setEditingIndex(null);
    } else {
      // Add new item
      setPurchaseItems((prev) => [...prev, purchaseItem]);
    }

    // Reset item fields
    resetItemFields();
  };

  // Reset item form fields
  const resetItemFields = () => {
    setValue("items.0", {
      brandId: "",
      routeId: "",
      qtyInTon: 0,
      bags: 0,
      freightPerBag: 0,
      totalFreight: 0,
      ratePerTon: 0,
      ratePerBag: 0,
      unitPrice: 0,
      totalPrice: 0,
      commissionPerBag: 0,
      whtTax: 0,
    });
  };

  // Edit a purchase item from the grid
  const handleEditItem = (index: number) => {
    const item = purchaseItems[index];
    if (!item) return;

    setValue("items.0", {
      brandId: item.brandId,
      routeId: item.routeId,
      qtyInTon: item.qtyInTon,
      bags: item.bags,
      freightPerBag: item.freightPerBag,
      totalFreight: item.totalFreight,
      ratePerTon: item.ratePerTon,
      ratePerBag: item.ratePerBag,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      commissionPerBag: item.commissionPerBag,
      whtTax: item.whtTax,
    });

    setEditingIndex(index);
  };

  // Delete a purchase item from the grid
  const handleDeleteItem = (index: number) => {
    notify.confirmDelete(() => {
      setPurchaseItems((prev) => prev.filter((_, i) => i !== index));
      notify.success("Item removed successfully!");
    });
  };

  // Handle save purchase order
  const handleSavePurchaseOrder = async (data: PurchaseFormData) => {
    try {
      if (purchaseItems.length === 0) {
        notify.error("Please add at least one item to the purchase order");
        return;
      }

      const payload = {
        ...data,
        items: purchaseItems,
      };

      if (editingIndex !== null) {
        if (purchaseItems[editingIndex]) {
          await updatePurchase(purchaseItems[editingIndex]?.id ?? "", payload);
        }
      } else {
        await createPurchase(payload);
      }

      notify.success("Purchase order saved successfully!");
      reset();
      setPurchaseItems([]);
    } catch (error) {
      logger.error("Failed to save purchase order", error);
      notify.error("Failed to save purchase order");
    }
  };

  // Calculate purchase summary
  const purchaseSummary = useMemo(() => {
    if (purchaseItems.length === 0)
      return { totalQty: 0, totalBags: 0, totalAmount: 0 };

    return purchaseItems.reduce(
      (acc, item) => {
        return {
          totalQty: acc.totalQty + item.qtyInTon,
          totalBags: acc.totalBags + (item.bags ?? 0),
          totalAmount: acc.totalAmount + (item.totalPrice ?? 0),
        };
      },
      { totalQty: 0, totalBags: 0, totalAmount: 0 },
    );
  }, [purchaseItems]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">Loading purchase data...</div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Purchase Order</h2>

      {/* Header Section */}
      <PurchaseHeader
        register={register}
        errors={errors}
        watch={watch}
        setValue={setValue}
        companies={
          (companies ?? []).filter((company) => company.id !== undefined) as {
            id: string;
            name: string;
          }[]
        }
        trucks={
          (trucks ?? []).filter((truck) => truck.id !== undefined) as {
            id: string;
            number: string;
            sourcingType: string;
          }[]
        }
        drivers={drivers ?? []}
        today={today}
      />

      {/* Item Form Section */}
      <PurchaseItemForm
        register={register}
        errors={errors}
        watch={watch}
        brands={brands ?? []}
        brandRoutes={brandRoutes}
        routeFreight={routeFreight}
        selectedCompany={selectedCompany}
        selectedRoute={selectedRoute}
        handleAddToGrid={handleAddToGrid}
        isEditing={editingIndex !== null}
        isSubmitting={isSubmitting}
      />

      {/* Items Table */}
      <PurchaseItemsTable
        items={purchaseItems}
        onEdit={handleEditItem}
        onDelete={handleDeleteItem}
        summary={purchaseSummary}
      />

      {/* Save Button */}
      <div className="flex justify-between items-center">
        <div className="text-base-content">
          <p className="font-semibold">Order Summary:</p>
          <p>Total Quantity: {purchaseSummary.totalQty.toFixed(2)} tons</p>
          <p>Total Bags: {purchaseSummary.totalBags}</p>
          <p>Total Amount: {purchaseSummary.totalAmount.toFixed(2)}</p>
        </div>

        <button
          onClick={handleSubmit(handleSavePurchaseOrder)}
          className="btn btn-success btn-md"
          disabled={purchaseItems.length === 0 || isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Purchase Order"}
        </button>
      </div>
    </div>
  );
};

export default Purchase;
