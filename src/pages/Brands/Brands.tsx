/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { notify } from "@/lib/notify";
import { FormField } from "@/common/components/ui/form/FormField";
import { useForm } from "react-hook-form";
import { Button } from "@/common/components/ui/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { brandSchema, type BrandFormData } from "./brand.schema";
import { createBrand, fetchAllBrands } from "./brand.service";
import { logger } from "@/lib/logger";
import { useService } from "@/common/hooks/custom/useService";
import { ErrorModal } from "@/common/components/Error";
import type { Company } from "../Accounts/CompanyAccounts/company.schema";
import { fetchAllCompanies } from "../Accounts/CompanyAccounts/company.service";
import { fetchAllRoutes } from "../Accounts/DeliveryRoutes/route.service";
import type { DeliveryRoute } from "../Accounts/DeliveryRoutes/deliveryRoute.schema";

// Additional properties not in the schema but used in the component
type BrandExtended = BrandFormData & {
  lessCommission: boolean;
  taxes: string[];
  routes: {
    routeShortCode: string;
    freight: number;
    givenToTruck: number;
  }[];
  companyName: string;
};

const Brands = () => {
  const [brands, setBrands] = useState<BrandExtended[]>([]);
  const [lessCommission, setLessCommission] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [taxes, setTaxes] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isInEditMode, setIsInEditMode] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
  const [routeInputs, setRouteInputs] = useState<
    {
      routeShortCode: string;
      freight: number | null;
      givenToTruck: number | null;
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
      brandName: "",
      brandShortCode: "",
      weight: 0,
      commission: 0,
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
  }, []);

  // Update state when data is received from the API
  useEffect(() => {
    if (brandsData) {
      // Map API response to BrandExtended type
      const fetchedBrands = brandsData.map((brand: any) => ({
        id: brand.id,
        brandName: brand.brandName,
        brandShortCode: brand.brandShortCode,
        weight: brand.weight,
        commission: brand.commission,
        lessCommission: brand.lessCommission ?? false,
        taxes: brand.taxes ?? [],
        routes: brand.routes ?? [],
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
        routeShortCodes.map((route) => ({
          routeShortCode: route,
          freight: null,
          givenToTruck: null,
        })),
      );
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

  // Dummy Data
  const taxTypes = ["WHT", "GST", "Sales Tax", "Income Tax"];
  const routeShortCodes = ["RTE001", "RTE002", "RTE003", "RTE004"];

  const handleNext = async () => {
    // Validate first step fields
    const isValid = await trigger(["brandName", "brandShortCode"]);
    if (!isValid || !selectedCompany) {
      if (!selectedCompany) {
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
    field: "freight" | "givenToTruck",
    value: number,
  ) => {
    const updatedRouteInputs = [...routeInputs];
    if (updatedRouteInputs[index]) {
      updatedRouteInputs[index][field] = value;
    }
    setRouteInputs(updatedRouteInputs);
  };

  // Save or Update Brand
  const handleSaveBrand = async () => {
    // Validate second step fields
    const isValid = await trigger(["weight", "commission"]);
    if (!isValid || taxes.length === 0) {
      if (taxes.length === 0) {
        notify.error("Please select at least one tax");
      }
      return;
    }

    // Filter out routes that have both freight and givenToTruck values
    const validRoutes = routeInputs.filter(
      (route) => route.freight !== null && route.givenToTruck !== null,
    );

    if (validRoutes.length === 0) {
      notify.error(
        "Please add at least one route with freight and given to truck values",
      );
      return;
    }

    const formValues = getValues();

    // Prepare data for API submission - conforming to the schema
    const brandData: BrandFormData = {
      brandName: formValues.brandName,
      brandShortCode: formValues.brandShortCode,
      weight: formValues.weight,
      commission: formValues.commission,
    };

    // If we're editing, include the ID
    if (isInEditMode && editingIndex !== null && brands[editingIndex]?.id) {
      brandData.id = brands[editingIndex].id;
    }

    // Additional data that will be sent to the API but isn't in the formal schema
    const additionalData = {
      companyName: selectedCompany,
      lessCommission,
      taxes,
      routes: validRoutes.filter(
        (
          route,
        ): route is {
          routeShortCode: string;
          freight: number;
          givenToTruck: number;
        } => route.freight !== null && route.givenToTruck !== null,
      ),
    };

    // Combined data object to send to API
    const newBrand = { ...brandData, ...additionalData } as any;

    try {
      await createBrand(newBrand);

      // Update local state if in edit mode
      if (isInEditMode && editingIndex !== null) {
        const updatedBrands = [...brands];
        updatedBrands[editingIndex] = newBrand;
        setBrands(updatedBrands);
      } else {
        // Add new brand to state
        setBrands([...brands, newBrand]);
      }

      // Reset form
      reset();
      setSelectedCompany("");
      setLessCommission(false);
      setTaxes([]);
      setRouteInputs([]);
      setStep(1);
      setIsInEditMode(false);
      setEditingIndex(null);

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
  const handleEditBrand = (index: number) => {
    setIsInEditMode(true);
    const brand = brands[index];
    if (!brand) return;

    // Set form values as per schema
    setValue("brandName", brand.brandName);
    setValue("brandShortCode", brand.brandShortCode);
    setValue("weight", brand.weight);
    setValue("commission", brand.commission);

    setSelectedCompany(brand.companyName);
    setLessCommission(brand.lessCommission);
    setTaxes([...brand.taxes]);

    // Map the brand's routes to the routeInputs state
    const initializedRouteInputs = routeShortCodes.map((code) => {
      const existingRoute = brand.routes.find((r) => r.routeShortCode === code);
      return {
        routeShortCode: code,
        freight: existingRoute ? existingRoute.freight : null,
        givenToTruck: existingRoute ? existingRoute.givenToTruck : null,
      };
    });

    setRouteInputs(initializedRouteInputs);
    setEditingIndex(index);
    setStep(1);
  };

  // Remove tax from selected taxes
  const handleRemoveTax = (taxToRemove: string) => {
    setTaxes(taxes.filter((tax) => tax !== taxToRemove));
  };

  // Filtered brands based on search query
  const filteredBrands = brands.filter(
    (brand) =>
      brand.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.brandShortCode.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleTaxChange = (tax: string) => {
    setTaxes((prev) =>
      prev.includes(tax) ? prev.filter((t) => t !== tax) : [...prev, tax],
    );
  };

  const handleDeleteBrand = (index: number) => {
    notify.confirmDelete(() => {
      // Here you would add API call to delete brand
      setBrands((prev) => prev.filter((_, i) => i !== index));
      notify.success("Brand deleted successfully!");
    });
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
              value={selectedCompany}
              onChange={(e) => {
                setSelectedCompany(e.target.value);
              }}
            >
              <option value="">Select Company</option>
              {companies.map((company) => (
                <option key="companyId" value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            <FormField
              type="text"
              placeholder="Enter Brand Name"
              name="brandName"
              label="Brand Name"
              register={register}
              errorMessage={errors.brandName?.message}
            />
            <FormField
              type="text"
              placeholder="Enter Brand Short Code"
              name="brandShortCode"
              label="Brand Short Code"
              register={register}
              errorMessage={errors.brandShortCode?.message}
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
              name="weight"
              label="KG Per Bag"
              register={register}
              errorMessage={errors.weight?.message}
            />

            <FormField
              type="number"
              placeholder="Enter Amount"
              name="commission"
              label="Commission Per Bag"
              register={register}
              errorMessage={errors.commission?.message}
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
              {taxTypes.map((tax) => (
                <option key={tax} value={tax} disabled={taxes.includes(tax)}>
                  {tax}
                </option>
              ))}
            </select>

            {/* Display selected taxes */}
            {isBrandDataLoading && <div className="skeleton h-28 w-full"></div>}
            {taxes.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {taxes.map((tax) => (
                  <div key={tax} className="badge badge-info gap-2">
                    {tax}
                    <button
                      className="btn-xs btn-circle"
                      onClick={() => {
                        handleRemoveTax(tax);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="block mb-2 font-medium">
              Add Freight & Given to Truck
            </label>
            <div className="overflow-x-auto mb-4">
              <table className="table w-full">
                <thead>
                  <tr className="bg-base-300">
                    <th>Route</th>
                    <th>Freight</th>
                    <th>Given to Truck</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.map((route, index) => (
                    <tr key={index}>
                      <td>{route.code}</td>
                      <td>
                        <input
                          type="number"
                          placeholder="Enter Freight"
                          className="input input-bordered input-sm w-full"
                          value={""}
                          onChange={(e) => {
                            handleRouteInputChange(
                              index,
                              "freight",
                              parseFloat(e.target.value) || 0,
                            );
                          }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          placeholder="Enter Amount"
                          className="input input-bordered input-sm w-full"
                          value={""}
                          onChange={(e) => {
                            handleRouteInputChange(
                              index,
                              "givenToTruck",
                              parseFloat(e.target.value) || 0,
                            );
                          }}
                        />
                      </td>
                    </tr>
                  ))}
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
                <tr
                  key={index}
                  className="border-b border-base-300 text-center"
                >
                  <td>{index + 1}</td>
                  <td>{brand.brandName}</td>
                  <td>{brand.brandShortCode}</td>
                  <td>{brand.companyName}</td>
                  <td>{brand.weight}</td>
                  <td>{brand.commission}</td>
                  <td>{brand.lessCommission ? "Yes" : "No"}</td>
                  <td>{brand.taxes.join(", ")}</td>
                  <td>{brand.routes.length} routes</td>
                  <td className="flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        handleEditBrand(index);
                      }}
                      className="btn btn-sm btn-secondary"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteBrand(index);
                      }}
                      className="btn btn-sm btn-error ml-2"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
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
