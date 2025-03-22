/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { notify } from "@/lib/notify";
import { FormField } from "@/common/components/ui/form/FormField";
import { useForm } from "react-hook-form";
import { Button } from "@/common/components/ui/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { brandSchema, type BrandFormData } from "./brand.schema";
import {
  createBrand,
  fetchAllBrands,
  updateBrand,
  deleteBrand,
} from "./brand.service";
import { logger } from "@/lib/logger";
import { useService } from "@/common/hooks/custom/useService";
import { ErrorModal } from "@/common/components/Error";
import type { Company } from "../Accounts/CompanyAccounts/company.schema";
import { fetchAllCompanies } from "../Accounts/CompanyAccounts/company.service";
import { fetchAllRoutes } from "../Accounts/DeliveryRoutes/route.service";
import type { DeliveryRoute } from "../Accounts/DeliveryRoutes/deliveryRoute.schema";
import { fetchAllTaxes } from "../Accounts/TaxAccounts/tax.service";
import TrashIcon from "@heroicons/react/24/solid/TrashIcon";
import { PencilSquareIcon } from "@heroicons/react/24/solid";

// Additional properties not in the schema but used in the component
type BrandExtended = BrandFormData & {
  lessCommission: boolean;
  taxes: Tax[];
  freights: {
    routeId: string;
    amountPerBag: number;
    truckSharePerBag: number;
  }[];
  companyId: string;
  companyName?: string; // For display purposes only
};

// Type for the Tax entity
type Tax = {
  id: string;
  name: string;
};

const Brands = () => {
  const [brands, setBrands] = useState<BrandExtended[]>([]);
  const [lessCommission, setLessCommission] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [taxIds, setTaxIds] = useState<string[]>([]);
  const [availableTaxes, setAvailableTaxes] = useState<Tax[]>([]);
  const [step, setStep] = useState(1);
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [isInEditMode, setIsInEditMode] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
  const [expandedRoutes, setExpandedRoutes] = useState<string | null>(null);
  const [routeInputs, setRouteInputs] = useState<
    {
      routeId: string;
      amountPerBag: number | null;
      truckSharePerBag: number | null;
    }[]
  >([]);

  // Use the service hook pattern for API calls
  const {
    error: fetchBrandsError,
    data: brandsData,
    isLoading: isBrandDataLoading,
  } = useService(fetchAllBrands);

  const {
    register,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    getValues,
    trigger,
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: "",
      code: "",
      weightPerBagKg: 0,
      commissionPerBag: 0,
    },
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetchAllCompanies();
        setCompanies(response);
      } catch (error: unknown) {
        logger.error("Failed to fetch companies", error);
      }
    };
    void fetchCompanies();

    const fetchRoutes = async () => {
      try {
        const response = await fetchAllRoutes();
        setRoutes(response);
      } catch (error: unknown) {
        logger.error("Failed to fetch routes", error);
      }
    };
    void fetchRoutes();

    // Fetch Taxes data
    const fetchTaxes = async () => {
      // Fetch taxes from API
      try {
        const response = await fetchAllTaxes();
        setAvailableTaxes(
          response.map((tax: any) => ({
            id: tax.id,
            name: tax.name,
          })),
        );
      } catch (error: unknown) {
        logger.error("Failed to fetch taxes", error);
      }
    };
    void fetchTaxes();
  }, []);

  // Update state when data is received from the API
  useEffect(() => {
    if (brandsData) {
      // Map API response to BrandExtended type
      const fetchedBrands = brandsData.map((brand: any) => ({
        id: brand.id,
        name: brand.name,
        code: brand.code,
        weightPerBagKg: brand.weightPerBagKg,
        commissionPerBag: brand.commissionPerBag,
        lessCommission: brand.lessCommission ?? false,
        taxes: brand.taxes ?? [],
        freights: brand.freights ?? [],
        companyId: brand.companyId,
        companyName: brand.companyName,
      }));
      setBrands(fetchedBrands);
    }
  }, [brandsData]);

  // Initialize route inputs when switching to step 2
  useEffect(() => {
    if (step === 2 && routeInputs.length === 0) {
      initializeRouteInputs();
    }
  }, [step, routeInputs.length]);

  // Initialize route inputs when moving to step 2
  const initializeRouteInputs = () => {
    // Initialize with empty values if in add mode
    if (!isInEditMode) {
      setRouteInputs(
        routes.map((route) => ({
          routeId: route.id ?? "", // Provide a fallback empty string if route.id is undefined
          amountPerBag: null,
          truckSharePerBag: null,
        })),
      );
    } else if (editingBrandId !== null) {
      // If in edit mode, populate with existing values
      const brand = brands.find((b) => b.id === editingBrandId);
      if (!brand) return;

      const initializedRouteInputs = routes.map((route) => {
        const existingRoute = brand?.freights.find(
          (r) => r.routeId === route.id,
        );
        return {
          routeId: route.id ?? "", // Ensure routeId is always a string
          amountPerBag: existingRoute ? existingRoute.amountPerBag : null,
          truckSharePerBag: existingRoute
            ? existingRoute.truckSharePerBag
            : null,
        };
      });
      setRouteInputs(initializedRouteInputs);
    }
  };

  // Handle API errors
  if (fetchBrandsError) {
    return (
      <ErrorModal
        message={
          fetchBrandsError instanceof Error
            ? fetchBrandsError.message
            : "Failed to fetch brands data"
        }
      />
    );
  }

  const handleNext = async () => {
    // Validate first step fields
    const isValid = await trigger(["name", "code"]);
    if (!isValid || !selectedCompanyId) {
      if (!selectedCompanyId) {
        notify.error("Please select a company");
      }
      return;
    }
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  // Handle route input change
  const handleRouteInputChange = (
    index: number,
    field: "amountPerBag" | "truckSharePerBag",
    value: number,
  ) => {
    const updatedRouteInputs = [...routeInputs];
    if (updatedRouteInputs[index]) {
      updatedRouteInputs[index][field] = value;
    }
    setRouteInputs(updatedRouteInputs);
  };

  // Count valid routes (with both amountPerBag and truckSharePerBag)
  const countValidRoutes = (freights: any[]) => {
    return freights.filter(
      (freight) =>
        freight.amountPerBag !== null &&
        freight.truckSharePerBag !== null &&
        freight.amountPerBag !== undefined &&
        freight.truckSharePerBag !== undefined,
    ).length;
  };

  // Save or Update Brand
  const handleSaveBrand = async () => {
    // Validate second step fields
    const isValid = await trigger(["weightPerBagKg", "commissionPerBag"]);
    if (!isValid || taxIds.length === 0) {
      if (taxIds.length === 0) {
        notify.error("Please select at least one tax");
      }
      return;
    }

    // Filter out routes that have both amountPerBag and truckSharePerBag values
    const validFreights = routeInputs.filter(
      (route) => route.amountPerBag !== null && route.truckSharePerBag !== null,
    );

    if (validFreights.length === 0) {
      notify.error(
        "Please add at least one route with freight and truck share values",
      );
      return;
    }

    const formValues = getValues();

    // Prepare data for API submission - conforming to the schema
    const brandData: BrandFormData = {
      name: formValues.name,
      code: formValues.code,
      weightPerBagKg: Number(formValues.weightPerBagKg), // Convert to number
      commissionPerBag: Number(formValues.commissionPerBag), // Convert to number
    };

    // If we're editing, include the ID
    if (isInEditMode && editingBrandId !== null) {
      brandData.id = editingBrandId;
    }

    // Prepare payload according to the API schema
    const payload = {
      ...brandData,
      companyId: selectedCompanyId,
      lessCommission,
      taxIds,
      freights: validFreights
        .filter(
          (
            route,
          ): route is {
            routeId: string;
            amountPerBag: number;
            truckSharePerBag: number;
          } => route.amountPerBag !== null && route.truckSharePerBag !== null,
        )
        .map((freight) => ({
          ...freight,
          amountPerBag: Math.round(freight.amountPerBag), // Round to integer
          truckSharePerBag: Math.round(freight.truckSharePerBag), // Round to integer
        })),
    };

    try {
      if (isInEditMode && editingBrandId) {
        // Update existing brand
        await updateBrand(editingBrandId, payload);
      } else {
        // Create new brand
        await createBrand(payload);
      }

      // Find company name for display in the table
      const companyName = companies.find(
        (c) => c.id === selectedCompanyId,
      )?.name;

      // Create a displayable version of the brand for local state
      const newBrand: BrandExtended = {
        ...payload,
        companyName: companyName ?? selectedCompanyId,
        taxes: taxIds
          .map((id) => availableTaxes.find((tax) => tax.id === id)!)
          .filter(Boolean),
      };

      // Update local state
      if (isInEditMode && editingBrandId) {
        setBrands((prevBrands) =>
          prevBrands.map((brand) =>
            brand.id === editingBrandId ? newBrand : brand,
          ),
        );
      } else {
        // Add new brand to state
        setBrands([...brands, newBrand]);
      }

      // Reset form
      reset();
      setSelectedCompanyId("");
      setLessCommission(false);
      setTaxIds([]);
      setRouteInputs([]);
      setStep(1);
      setIsInEditMode(false);
      setEditingBrandId(null);

      notify.success(
        isInEditMode
          ? "Brand updated successfully!"
          : "Brand added successfully!",
      );
    } catch (error) {
      notify.error(
        isInEditMode ? "Failed to update brand" : "Failed to add brand",
      );
      logger.error(error);
    }
  };

  // Edit Brand
  const handleEditBrand = (brandId: string) => {
    setIsInEditMode(true);
    const brand = brands.find((b) => b.id === brandId);
    if (!brand) return;

    // Set form values as per schema
    setValue("name", brand.name);
    setValue("code", brand.code);
    setValue("weightPerBagKg", brand.weightPerBagKg);
    setValue("commissionPerBag", brand.commissionPerBag);

    setSelectedCompanyId(brand.companyId);
    setLessCommission(brand.lessCommission);
    setTaxIds([...brand.taxes.map((tax) => tax.id)]);

    // Initialize with empty route inputs, they'll be populated in the initializeRouteInputs effect
    setRouteInputs([]);
    setEditingBrandId(brandId);
    setStep(1);
  };

  // Delete Brand
  const handleDeleteBrand = async (brandId: string) => {
    notify.confirmDelete(async () => {
      try {
        // Call API to delete brand
        await deleteBrand(brandId);

        // Update local state
        setBrands((prevBrands) =>
          prevBrands.filter((brand) => brand.id !== brandId),
        );

        notify.success("Brand deleted successfully!");
      } catch (error) {
        notify.error("Failed to delete brand");
        logger.error(error);
      }
    });
  };

  // Remove tax from selected taxes
  const handleRemoveTax = (taxIdToRemove: string) => {
    setTaxIds(taxIds.filter((id) => id !== taxIdToRemove));
  };

  // Filtered brands based on search query
  const filteredBrands = brands.filter(
    (brand) =>
      brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.code.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleTaxChange = (taxId: string) => {
    setTaxIds((prev) =>
      prev.includes(taxId)
        ? prev.filter((id) => id !== taxId)
        : [...prev, taxId],
    );
  };

  // Find company name by ID
  const getCompanyNameById = (id: string) => {
    const company = companies.find((c) => c.id === id);
    return company ? company.name : id;
  };

  // Get tax name by ID
  const getTaxNameById = (id: string) => {
    const tax = availableTaxes.find((t) => t.id === id);
    return tax ? tax.name : id;
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">Brand Management</h2>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by Brand Name or Short Code"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
        }}
        className="input input-bordered w-full mb-4"
      />

      <div className="bg-base-200 p-4 rounded-lg shadow-md">
        {step === 1 ? (
          <>
            <label className="block mb-1 font-medium relative w-full top-1 left-0.5">
              Company Name
            </label>
            <select
              className="select select-bordered w-full mb-2 left-0.5"
              value={selectedCompanyId}
              onChange={(e) => {
                setSelectedCompanyId(e.target.value);
              }}
            >
              <option value="">Select Company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            <FormField
              type="text"
              placeholder="Enter Brand Name"
              name="name"
              label="Brand Name"
              register={register}
              errorMessage={errors.name?.message}
            />
            <FormField
              type="text"
              placeholder="Enter Brand Short Code"
              name="code"
              label="Brand Short Code"
              register={register}
              errorMessage={errors.code?.message}
            />

            <button className="btn btn-info mt-4" onClick={handleNext}>
              Next
            </button>
          </>
        ) : (
          <>
            <FormField
              type="number"
              placeholder="Enter Weight"
              name="weightPerBagKg"
              label="KG Per Bag"
              register={register}
              errorMessage={errors.weightPerBagKg?.message}
            />

            <FormField
              type="number"
              placeholder="Enter Amount"
              name="commissionPerBag"
              label="Commission Per Bag"
              register={register}
              errorMessage={errors.commissionPerBag?.message}
            />
            <label className="flex items-center gap-2 mb-2 text-sm">
              <input
                type="checkbox"
                checked={lessCommission}
                onChange={(e) => {
                  setLessCommission(e.target.checked);
                }}
              />
              Less Commission at Purchase Time
            </label>
            <label className="block mb-1 font-medium relative w-full top-1 left-0.5">
              Taxes
            </label>
            <select
              className="select select-bordered w-full mb-2 left-0.5"
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  handleTaxChange(e.target.value);
                }
              }}
            >
              <option value="">Select Taxes</option>
              {availableTaxes.map((tax) => (
                <option
                  key={tax.id}
                  value={tax.id}
                  disabled={taxIds.includes(tax.id)}
                >
                  {tax.name}
                </option>
              ))}
            </select>

            {/* Display selected taxes */}
            {taxIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {taxIds.map((taxId) => (
                  <div key={taxId} className="badge badge-info gap-2">
                    {getTaxNameById(taxId)}
                    <button
                      className="btn-xs btn-circle"
                      onClick={() => {
                        handleRemoveTax(taxId);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="block mb-2 font-medium">
              Add Freight & Truck Share
            </label>
            <div className="overflow-x-auto mb-4">
              <table className="table w-full">
                <thead>
                  <tr className="bg-base-300">
                    <th>Route</th>
                    <th>Amount Per Bag</th>
                    <th>Truck Share Per Bag</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.map((route, index) => {
                    const routeInput = routeInputs.find(
                      (r) => r.routeId === route.id,
                    ) ?? {
                      routeId: route.id,
                      amountPerBag: null,
                      truckSharePerBag: null,
                    };
                    const routeInputIndex = routeInputs.findIndex(
                      (r) => r.routeId === route.id,
                    );

                    return (
                      <tr key={route.id}>
                        <td>{route.code}</td>
                        <td>
                          <input
                            type="number"
                            placeholder="Enter Amount Per Bag"
                            className="input input-bordered input-sm w-full"
                            value={routeInput.amountPerBag ?? ""}
                            onChange={(e) => {
                              handleRouteInputChange(
                                routeInputIndex !== -1
                                  ? routeInputIndex
                                  : index,
                                "amountPerBag",
                                e.target.value === ""
                                  ? 0
                                  : parseFloat(e.target.value),
                              );
                            }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            placeholder="Enter Truck Share"
                            className="input input-bordered input-sm w-full"
                            value={routeInput.truckSharePerBag ?? ""}
                            onChange={(e) => {
                              handleRouteInputChange(
                                routeInputIndex !== -1
                                  ? routeInputIndex
                                  : index,
                                "truckSharePerBag",
                                e.target.value === ""
                                  ? 0
                                  : parseFloat(e.target.value),
                              );
                            }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between mt-4">
              <button className="btn btn-secondary" onClick={handleBack}>
                Back
              </button>
              <Button
                shape="info"
                pending={isSubmitting || isBrandDataLoading}
                onClick={handleSaveBrand}
              >
                {isInEditMode ? "Update Brand" : "Save Brand"}
              </Button>
            </div>
          </>
        )}
      </div>
      {/* Brands Table */}
      {isBrandDataLoading ? (
        <div className="skeleton h-32 w-full mt-4"></div>
      ) : filteredBrands.length > 0 ? (
        <div className="overflow-x-auto mt-4">
          <table className="table w-full bg-base-200 rounded-lg shadow-md">
            <thead>
              <tr className="bg-base-300 text-base-content text-center">
                <th>#</th>
                <th>Brand Name</th>
                <th>Short Code</th>
                <th>Company</th>
                <th>KG/Bag</th>
                <th>Commission</th>
                <th>Less Comm.</th>
                <th>Tax</th>
                <th>Routes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBrands.map((brand, index) => (
                <>
                  <tr
                    key={brand.id}
                    className="border-b border-base-300 text-center"
                  >
                    <td>{index + 1}</td>
                    <td>{brand.name}</td>
                    <td>{brand.code}</td>
                    <td>{getCompanyNameById(brand.companyId)}</td>
                    <td>{Math.round(brand.weightPerBagKg)}</td>
                    <td>{Math.round(brand.commissionPerBag)}</td>
                    <td>{brand.lessCommission ? "Yes" : "No"}</td>
                    <td>{brand.taxes.map((tax) => tax.name).join(", ")}</td>
                    <td
                      className="cursor-pointer hover:bg-base-300"
                      onClick={() => {
                        setExpandedRoutes(
                          expandedRoutes === brand.id
                            ? null
                            : (brand.id ?? null),
                        );
                      }}
                    >
                      {countValidRoutes(brand.freights)} routes
                      {expandedRoutes === brand.id ? " ▲" : " ▼"}
                    </td>
                    <td className="p-3 flex gap-2 justify-center">
                      <button
                        onClick={() => {
                          brand.id && handleEditBrand(brand.id);
                        }}
                        className="flex items-center mt-2 justify-center"
                      >
                        <PencilSquareIcon className="w-5 h-5 text-info" />
                      </button>

                      <button
                        onClick={() => {
                          void handleDeleteBrand(brand.id ?? "");
                        }}
                        className="flex items-center mt-2 justify-center"
                      >
                        <TrashIcon className="w-5 h-5 text-red-500" />
                      </button>
                    </td>
                  </tr>
                  {expandedRoutes === brand.id && (
                    <tr>
                      <td colSpan={10} className="p-0">
                        <div className="bg-base-100 p-3 rounded m-2 shadow-inner">
                          <table className="table w-full">
                            <thead>
                              <tr className="bg-base-200">
                                <th>Amount Per Bag</th>
                                <th>Truck Share Per Bag</th>
                              </tr>
                            </thead>
                            <tbody>
                              {brand.freights.map((freight, freightIndex) => (
                                <tr key={freightIndex}>
                                  <td>{Math.round(freight.amountPerBag)}</td>
                                  <td>
                                    {Math.round(freight.truckSharePerBag)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-base-200 p-4 mt-4 rounded-lg shadow-md mb-6 text-center text-gray-500">
          No brands added yet.
        </div>
      )}
    </div>
  );
};

export default Brands;
