/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-confusing-void-expression */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { logger } from "@/lib/logger";
import { notify } from "@/lib/notify";
import { FormField } from "@/common/components/ui/form/FormField";
import { useForm } from "react-hook-form";
import { Button } from "@/common/components/ui/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorModal } from "@/common/components/Error";
import { useService } from "@/common/hooks/custom/useService";
import { brandSchema, type BrandFormData } from "./brand.schema";
import {
  createBrand,
  fetchAllBrands,
  updateBrand,
  deleteBrand,
} from "./brand.service";
import type { Company } from "../Accounts/CompanyAccounts/company.schema";
import { fetchAllCompanies } from "../Accounts/CompanyAccounts/company.service";
import type { DeliveryRoute } from "../Accounts/DeliveryRoutes/deliveryRoute.schema";
import { fetchAllRoutes } from "../Accounts/DeliveryRoutes/route.service";
import { fetchAllTaxes } from "../Accounts/TaxAccounts/tax.service";
import TrashIcon from "@heroicons/react/24/solid/TrashIcon";
import PencilSquareIcon from "@heroicons/react/24/solid/PencilSquareIcon";
import { ApiException } from "@/utils/exceptions";

type BrandExtended = BrandFormData & {
  id: string;
  lessCommission: boolean;
  taxes: Tax[];
  freights: FreightItem[];
  company: {
    id?: string;
    name: string;
    address: string;
  };
};

type Tax = {
  id: string;
  name: string;
};

type FreightItem = {
  routeId: string;
  amountPerBag: number;
  truckSharePerBag: number;
  route?: {
    id: string;
    name: string;
    code: string;
  };
};

type RouteInput = {
  routeId: string;
  amountPerBag: number | null;
  truckSharePerBag: number | null;
};

const Brands = () => {
  const [brands, setBrands] = useState<BrandExtended[]>([]);
  const [lessCommission, setLessCommission] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [taxIds, setTaxIds] = useState<string[]>([]);
  const [availableTaxes, setAvailableTaxes] = useState<Tax[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
  const [routeInputs, setRouteInputs] = useState<RouteInput[]>([]);
  const [step, setStep] = useState(1);
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [expandedRoutes, setExpandedRoutes] = useState<string | null>(null);

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
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

  const {
    error: fetchBrandsError,
    data: brandsData,
    isLoading: isBrandsLoading,
  } = useService(fetchAllBrands);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [companiesData, routesData, taxesData] = await Promise.all([
          fetchAllCompanies(),
          fetchAllRoutes(),
          fetchAllTaxes(),
        ]);

        setCompanies(companiesData);
        setRoutes(routesData);
        setAvailableTaxes(
          taxesData.map((tax: any) => ({
            id: tax.id,
            name: tax.name,
          })),
        );
      } catch (error) {
        logger.error("Failed to fetch initial data", error);
        notify.error("Could not load required data");
      }
    };

    void fetchInitialData();
  }, []);

  useEffect(() => {
    if (brandsData) {
      const processedBrands = brandsData.map((brand: any) => ({
        id: brand.id,
        name: brand.name,
        code: brand.code,
        weightPerBagKg: brand.weightPerBagKg,
        commissionPerBag: brand.commissionPerBag,
        lessCommission: brand.hasPurchaseCommission ?? false,
        taxes: brand.taxes ?? [],
        freights: brand.freights ?? [],
        company: {
          id: brand.company?.id,
          name: brand.company?.name ?? "",
          address: brand.company?.address ?? "",
        },
      }));
      setBrands(processedBrands);
    }
  }, [brandsData]);

  // Only initialize route inputs when they're empty AND we're at step 2
  useEffect(() => {
    if (step === 2 && routeInputs.length === 0) {
      initializeRouteInputs();
    }
  }, [step, routeInputs.length]);

  const initializeRouteInputs = () => {
    if (!isEditMode) {
      setRouteInputs(
        routes.map((route) => ({
          routeId: route.id ?? "",
          amountPerBag: null,
          truckSharePerBag: null,
        })),
      );
    } else if (editingBrandId) {
      const brand = brands.find((b) => b.id === editingBrandId);
      if (!brand) return;

      const existingRouteInputs = routes.map((route) => {
        const existingFreight = brand.freights.find(
          (f) => f.routeId === route.id,
        );
        return {
          routeId: route.id ?? "",
          amountPerBag: existingFreight ? existingFreight.amountPerBag : null,
          truckSharePerBag: existingFreight
            ? existingFreight.truckSharePerBag
            : null,
        };
      });
      setRouteInputs(existingRouteInputs);
    }
  };

  const handleNextStep = async () => {
    const isValid = await trigger(["name", "code"]);
    if (!isValid) return;

    if (!selectedCompanyId) {
      notify.error("Please select a company");
      return;
    }

    setStep(2);

    // Initialize route inputs if in edit mode when moving to step 2
    if (isEditMode && editingBrandId) {
      const brand = brands.find((b) => b.id === editingBrandId);
      if (!brand) return;

      const existingRouteInputs = routes.map((route) => {
        const existingFreight = brand.freights.find(
          (f) => f.routeId === route.id,
        );
        return {
          routeId: route.id ?? "",
          amountPerBag: existingFreight ? existingFreight.amountPerBag : null,
          truckSharePerBag: existingFreight
            ? existingFreight.truckSharePerBag
            : null,
        };
      });
      setRouteInputs(existingRouteInputs);
    }
  };

  const handlePreviousStep = () => {
    setStep(1);
  };

  const handleRouteInputChange = (
    index: number,
    field: "amountPerBag" | "truckSharePerBag",
    value: number | null,
  ) => {
    const updatedInputs = [...routeInputs];
    if (updatedInputs[index]) {
      updatedInputs[index][field] = value;
      setRouteInputs(updatedInputs);
    }
  };

  const countValidRoutes = (freights: FreightItem[]) => {
    return freights.filter(
      (freight) =>
        freight.amountPerBag !== null && freight.truckSharePerBag !== null,
    ).length;
  };

  const handleTaxToggle = (taxId: string) => {
    setTaxIds((prev) =>
      prev.includes(taxId)
        ? prev.filter((id) => id !== taxId)
        : [...prev, taxId],
    );
  };

  const handleRemoveTax = (taxId: string) => {
    setTaxIds((prev) => prev.filter((id) => id !== taxId));
  };

  const handleSaveBrand = async () => {
    const isValid = await trigger(["weightPerBagKg", "commissionPerBag"]);
    if (!isValid) return;

    if (taxIds.length === 0) {
      notify.error("Please select at least one tax");
      return;
    }

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

    const brandData: BrandFormData = {
      name: formValues.name,
      code: formValues.code,
      weightPerBagKg: Number(formValues.weightPerBagKg),
      commissionPerBag: Number(formValues.commissionPerBag),
    };

    if (isEditMode && editingBrandId) {
      brandData.id = editingBrandId;
    }

    const payload = {
      ...brandData,
      companyId: selectedCompanyId,
      lessCommission,
      taxIds,
      freights: validFreights.map((freight) => ({
        routeId: freight.routeId,
        amountPerBag: Math.round(freight.amountPerBag ?? 0),
        truckSharePerBag: Math.round(freight.truckSharePerBag ?? 0),
      })),
    };

    try {
      let updatedBrand: BrandExtended;

      if (isEditMode && editingBrandId) {
        const response = await updateBrand(editingBrandId, payload);
        updatedBrand = {
          ...response,
          lessCommission: response.hasPurchaseCommission ?? false,
          taxes: (response.taxes ?? [])
            .filter((tax: any) => tax.id)
            .map((tax: any) => ({
              id: tax.id as string,
              name: tax.name,
            })),
          freights: (response.freights ?? []).map((freight: any) => ({
            routeId: freight.routeId ?? "",
            amountPerBag: freight.amountPerBag,
            truckSharePerBag: freight.truckSharePerBag,
            route: freight.route,
          })),
          company: {
            id: response.company?.id,
            name: response.company?.name ?? "",
            address: response.company?.address ?? "",
          },
        };
        setBrands(
          brands.map((b) => (b.id === editingBrandId ? updatedBrand : b)),
        );
      } else {
        updatedBrand = (await createBrand(payload)) as BrandExtended;
        setBrands([...brands, updatedBrand]);
      }

      resetFormState();
      notify.success(
        isEditMode
          ? "Brand updated successfully!"
          : "Brand added successfully!",
      );
    } catch (error) {
      if (error instanceof ApiException && error.statusCode === 409) {
        notify.error("Brand with this code already exists.");
      } else {
        notify.error(
          isEditMode ? "Failed to update brand" : "Failed to add brand",
        );
        logger.error(error);
      }
    }
  };

  const resetFormState = () => {
    reset();
    setSelectedCompanyId("");
    setLessCommission(false);
    setTaxIds([]);
    setRouteInputs([]);
    setStep(1);
    setIsEditMode(false);
    setEditingBrandId(null);
  };

  const handleEditBrand = (brandId: string) => {
    const brand = brands.find((b) => b.id === brandId);
    if (!brand) return;

    setIsEditMode(true);
    setEditingBrandId(brandId);
    setSelectedCompanyId(brand.company?.id ?? "");
    setLessCommission(brand.lessCommission);
    setTaxIds(brand.taxes.map((tax) => tax.id));

    setValue("name", brand.name);
    setValue("code", brand.code);
    setValue("weightPerBagKg", brand.weightPerBagKg);
    setValue("commissionPerBag", brand.commissionPerBag);

    // Set route inputs when editing, but don't rely on the useEffect to initialize them
    const existingRouteInputs = routes.map((route) => {
      const existingFreight = brand.freights.find(
        (f) => f.routeId === route.id,
      );
      return {
        routeId: route.id ?? "",
        amountPerBag: existingFreight ? existingFreight.amountPerBag : null,
        truckSharePerBag: existingFreight
          ? existingFreight.truckSharePerBag
          : null,
      };
    });
    setRouteInputs(existingRouteInputs);
    setStep(1);
  };

  const handleDeleteBrand = async (brandId: string) => {
    notify.confirmDelete(async () => {
      try {
        await deleteBrand(brandId);
        setBrands(brands.filter((brand) => brand.id !== brandId));
        notify.success("Brand deleted successfully!");
      } catch (error) {
        notify.error("Failed to delete brand");
        logger.error(error);
      }
    });
  };

  const filteredBrands = brands.filter(
    (brand) =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Brand Management</h2>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Search</label>
        <input
          type="text"
          placeholder="Search by Brand Name or Short Code"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input input-bordered w-full"
        />
      </div>

      <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
        {step === 1 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="col-span-2">
                <label className="block mb-1 font-medium">Company Name</label>
                <select
                  className="select select-bordered w-full mb-2"
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                >
                  <option value="">Select Company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              <FormField
                type="text"
                placeholder="Brand Name"
                name="name"
                label="Brand Name"
                register={register}
                errorMessage={errors.name?.message}
              />

              <FormField
                type="text"
                placeholder="Brand Short Code"
                name="code"
                label="Brand Short Code"
                register={register}
                errorMessage={errors.code?.message}
              />
            </div>

            <Button onClick={handleNextStep} shape="info" className="mt-4">
              Next
            </Button>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <FormField
                type="number"
                placeholder="Weight in KG"
                name="weightPerBagKg"
                label="KG Per Bag"
                register={register}
                errorMessage={errors.weightPerBagKg?.message}
              />

              <FormField
                type="number"
                placeholder="Commission Amount"
                name="commissionPerBag"
                label="Commission Per Bag"
                register={register}
                errorMessage={errors.commissionPerBag?.message}
              />
            </div>

            <div className="mt-2">
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={lessCommission}
                  onChange={(e) => setLessCommission(e.target.checked)}
                  className="checkbox-info"
                />
                <span>Less Commission at Purchase Time</span>
              </label>
            </div>

            <div className="mt-2">
              <label className="block mb-1 font-medium">Taxes</label>
              <select
                className="select select-bordered w-full mb-2"
                value=""
                onChange={(e) =>
                  e.target.value && handleTaxToggle(e.target.value)
                }
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

              {taxIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {taxIds.map((taxId) => {
                    const tax = availableTaxes.find((t) => t.id === taxId);
                    return (
                      <div key={taxId} className="badge badge-info gap-1">
                        {tax?.name}
                        <button
                          className="ml-1"
                          onClick={() => handleRemoveTax(taxId)}
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-4">
              <label className="block mb-2 font-medium">
                Freight & Truck Share Configuration
              </label>
              <div className="overflow-x-auto mb-4">
                <table className="table w-full">
                  <thead>
                    <tr className="bg-base-300">
                      <th>Route</th>
                      <th>Freight Amount</th>
                      <th>Truck Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routes.map((route, index) => {
                      const routeInput = routeInputs.find(
                        (r) => r.routeId === route.id,
                      ) ?? {
                        routeId: route.id ?? "",
                        amountPerBag: null,
                        truckSharePerBag: null,
                      };
                      const routeIndex = routeInputs.findIndex(
                        (r) => r.routeId === route.id,
                      );
                      const effectiveIndex =
                        routeIndex !== -1 ? routeIndex : index;

                      return (
                        <tr key={route.id}>
                          <td>{route.code}</td>
                          <td>
                            <input
                              type="number"
                              placeholder="Freight Amount"
                              className="input input-bordered input-sm w-full"
                              value={routeInput.amountPerBag ?? ""}
                              onChange={(e) =>
                                handleRouteInputChange(
                                  effectiveIndex,
                                  "amountPerBag",
                                  e.target.value === ""
                                    ? null
                                    : parseFloat(e.target.value),
                                )
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              placeholder="Truck Share"
                              className="input input-bordered input-sm w-full"
                              value={routeInput.truckSharePerBag ?? ""}
                              onChange={(e) =>
                                handleRouteInputChange(
                                  effectiveIndex,
                                  "truckSharePerBag",
                                  e.target.value === ""
                                    ? null
                                    : parseFloat(e.target.value),
                                )
                              }
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <Button onClick={handlePreviousStep} shape="secondary">
                Back
              </Button>
              <Button
                onClick={handleSubmit(handleSaveBrand)}
                shape="info"
                pending={isSubmitting}
              >
                {isEditMode ? "Update Brand" : "Save Brand"}
              </Button>
            </div>
          </>
        )}
      </div>

      {isBrandsLoading ? (
        <div className="skeleton h-28 w-full"></div>
      ) : filteredBrands.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="table w-full bg-base-200 rounded-lg shadow-md">
            <thead>
              <tr className="bg-base-300 text-base-content text-center">
                <th className="p-3">#</th>
                <th className="p-3">Brand Name</th>
                <th className="p-3">Short Code</th>
                <th className="p-3">Company</th>
                <th className="p-3">KG/Bag</th>
                <th className="p-3">Commission</th>
                <th className="p-3">Less Comm.</th>
                <th className="p-3">Taxes</th>
                <th className="p-3">Routes</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBrands.map((brand, index) => (
                <>
                  <tr
                    key={brand.id}
                    className="border-b border-base-300 text-center"
                  >
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">{brand.name}</td>
                    <td className="p-3">{brand.code}</td>
                    <td className="p-3">{brand.company?.name ?? "N/A"}</td>
                    <td className="p-3">{Math.round(brand.weightPerBagKg)}</td>
                    <td className="p-3">
                      {Math.round(brand.commissionPerBag)}
                    </td>
                    <td className="p-3">
                      {brand.lessCommission ? "Yes" : "No"}
                    </td>
                    <td className="p-3">
                      {brand.taxes.map((tax) => tax.name).join(", ")}
                    </td>
                    <td
                      className="p-3 cursor-pointer hover:bg-base-300"
                      onClick={() =>
                        setExpandedRoutes(
                          expandedRoutes === brand.id ? null : brand.id,
                        )
                      }
                    >
                      {countValidRoutes(brand.freights)} routes
                      {expandedRoutes === brand.id ? " ▲" : " ▼"}
                    </td>
                    <td className="p-3 flex gap-2 justify-center">
                      <button
                        onClick={() => brand.id && handleEditBrand(brand.id)}
                        className="flex items-center mt-2 justify-center"
                      >
                        <PencilSquareIcon className="w-5 h-5 text-info" />
                      </button>
                      <button
                        onClick={() => brand.id && handleDeleteBrand(brand.id)}
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
                                <th>Route</th>
                                <th>Freight Amount</th>
                                <th>Truck Share</th>
                              </tr>
                            </thead>
                            <tbody>
                              {brand.freights.map((freight, freightIndex) => {
                                const routeCode =
                                  freight.route?.code ??
                                  routes.find((r) => r.id === freight.routeId)
                                    ?.code ??
                                  freight.routeId;

                                return (
                                  <tr key={freightIndex}>
                                    <td>{routeCode}</td>
                                    <td>{Math.round(freight.amountPerBag)}</td>
                                    <td>
                                      {Math.round(freight.truckSharePerBag)}
                                    </td>
                                  </tr>
                                );
                              })}
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
        <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6 text-center text-gray-500">
          No brands found.
        </div>
      )}
    </div>
  );
};

export default Brands;
