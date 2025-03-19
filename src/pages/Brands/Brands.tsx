import { useState, useEffect } from "react";
import { notify } from "@/lib/notify";
import { FormField } from "@/common/components/ui/form/FormField";
import { useForm } from "react-hook-form";
import { Button } from "@/common/components/ui/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { brandSchema, type BrandFormData } from "./brand.schema";

type Brand = {
  name: string;
  shortCode: string;
  kgPerBag: number;
  commission: number;
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
  const [brands, setBrands] = useState<Brand[]>([]);
  const [lessCommission, setLessCommission] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [taxes, setTaxes] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isInEditMode, setIsInEditMode] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [routeInputs, setRouteInputs] = useState<
    {
      routeShortCode: string;
      freight: number | null;
      givenToTruck: number | null;
    }[]
  >([]);

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

  // Dummy Data
  const taxTypes = ["WHT", "GST", "Sales Tax", "Income Tax"];
  const routeShortCodes = ["RTE001", "RTE002", "RTE003", "RTE004"];
  const companyNames = ["Company A", "Company B", "Company C", "Company D"];

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

  // Initialize route inputs when moving to step 2
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const newBrand: Brand = {
      name: formValues.brandName,
      shortCode: formValues.brandShortCode,
      kgPerBag: formValues.weight,
      commission: formValues.commission,
      companyName: selectedCompany,
      lessCommission,
      taxes,
      routes: validRoutes as {
        routeShortCode: string;
        freight: number;
        givenToTruck: number;
      }[],
    };

    if (editingIndex !== null) {
      const updatedBrands = [...brands];
      updatedBrands[editingIndex] = newBrand;
      setBrands(updatedBrands);
      setEditingIndex(null);
      setIsInEditMode(false);
    } else {
      setBrands([...brands, newBrand]);
    }

    // Reset Fields & Return to Step 1
    reset();
    setSelectedCompany("");
    setLessCommission(false);
    setTaxes([]);
    setRouteInputs([]);
    setStep(1);
    notify.success(
      isInEditMode
        ? "Brand updated successfully!"
        : "Brand added successfully!",
    );
  };

  // Edit Brand
  const handleEditBrand = (index: number) => {
    setIsInEditMode(true);
    const brand = brands[index];
    if (!brand) return;

    // Set form values
    setValue("brandName", brand.name);
    setValue("brandShortCode", brand.shortCode);
    setValue("weight", brand.kgPerBag);
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
      brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.shortCode.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleTaxChange = (tax: string) => {
    setTaxes((prev) =>
      prev.includes(tax) ? prev.filter((t) => t !== tax) : [...prev, tax],
    );
  };

  const handleDeleteBrand = (index: number) => {
    notify.confirmDelete(() => {
      setBrands((prev) => prev.filter((_, i) => i !== index));
      notify.success("Brand deleted successfully!");
    });
  };

  // Initialize route inputs when switching to step 2
  useEffect(() => {
    if (step === 2 && routeInputs.length === 0) {
      initializeRouteInputs();
    }
  }, [initializeRouteInputs, routeInputs.length, step]);

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
              {companyNames.map((company) => (
                <option key={company} value={company}>
                  {company}
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
                  {routeInputs.map((route, index) => (
                    <tr key={index}>
                      <td>{route.routeShortCode}</td>
                      <td>
                        <input
                          type="number"
                          placeholder="Enter Freight"
                          className="input input-bordered input-sm w-full"
                          value={route.freight ?? ""}
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
                          value={route.givenToTruck ?? ""}
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
                pending={isSubmitting}
                onClick={handleSaveBrand}
              >
                {isInEditMode ? "Update Brand" : "Save Brand"}
              </Button>
            </div>
          </>
        )}
      </div>
      {/* Brands Table */}
      {filteredBrands.length > 0 ? (
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
                  <td>{brand.name}</td>
                  <td>{brand.shortCode}</td>
                  <td>{brand.companyName}</td>
                  <td>{brand.kgPerBag}</td>
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
