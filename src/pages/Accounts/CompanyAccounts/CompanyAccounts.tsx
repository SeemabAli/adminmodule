/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useEffect, useState } from "react";
import { notify } from "@/lib/notify";
import { FormField } from "@/common/components/ui/form/FormField";
import { useForm } from "react-hook-form";
import { Button } from "@/common/components/ui/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { companySchema, type Company } from "./company.schema";
import {
  createCompany,
  fetchAllCompanies,
  updateCompany,
  deleteCompany,
} from "./company.service";
import { logger } from "@/lib/logger";
import { useService } from "@/common/hooks/custom/useService";
import { ErrorModal } from "@/common/components/Error";
import { TrashIcon } from "@heroicons/react/24/solid";
import { PencilSquareIcon } from "@heroicons/react/24/solid";

const CompanyAccounts = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { error, data, isLoading } = useService(fetchAllCompanies);

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    setValue,
    setFocus,
    getValues,
    reset,
  } = useForm({
    resolver: zodResolver(companySchema),
    defaultValues: {
      id: "",
      name: "",
      address: "",
    },
  });

  const handleAddCompany = async (newCompany: Company) => {
    try {
      await createCompany(newCompany);
      setCompanies([...companies, newCompany]);
      reset();
      notify.success("Company added successfully.");
    } catch (error: unknown) {
      notify.error("Failed to add company.");
      logger.error(error);
    }
  };

  const onCompanyUpdate = async (companyId: string) => {
    try {
      const updatedCompanyData = getValues();
      await updateCompany(companyId, updatedCompanyData);

      const updatedCompanies = companies.map((company) => {
        if (company.id === companyId) {
          return { ...company, ...updatedCompanyData };
        }
        return company;
      });

      setCompanies(updatedCompanies);
      setEditingId(null);
      reset();
      notify.success("Company updated successfully.");
    } catch (error: unknown) {
      notify.error("Failed to update company.");
      logger.error(error);
    }
  };

  const handleEdit = (companyId: string) => {
    const targetCompany = companies.find((company) => company.id === companyId);
    // Don't update fields if company is not present in the list of companies
    if (!targetCompany) return;

    setValue("name", targetCompany.name);
    setValue("address", targetCompany.address);
    setFocus("name");
    setEditingId(companyId);
  };

  const handleDelete = async (companyId: string) => {
    console.log("companyId", companyId);
    try {
      await deleteCompany(companyId);
      setCompanies(companies.filter((company) => company.id !== companyId));
      notify.success("Company deleted successfully.");
    } catch (error: unknown) {
      notify.error("Failed to delete company.");
      logger.error(error);
    }
  };

  useEffect(() => {
    if (data) {
      setCompanies(data);
    }
  }, [data]);

  if (error) {
    return (
      <ErrorModal
        message={
          error instanceof Error
            ? error.message
            : "Failed to fetch companies data"
        }
      />
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Company Accounts</h2>
      <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <FormField
            placeholder="Enter Name"
            name={"name"}
            label={"Company Name"}
            register={register}
            errorMessage={errors.name?.message}
          />
          <FormField
            placeholder="Enter Address"
            name={"address"}
            label={"Company Address"}
            register={register}
            errorMessage={errors.address?.message}
          />
        </div>
        <Button
          onClick={
            editingId !== null
              ? handleSubmit(() => {
                  void onCompanyUpdate(editingId);
                })
              : handleSubmit(handleAddCompany)
          }
          shape="info"
          pending={isSubmitting}
          className="mt-4"
        >
          {editingId !== null ? "Update Company" : "Add Company"}
        </Button>
      </div>
      {isLoading && <div className="skeleton h-28 w-full"></div>}
      {companies.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="table w-full bg-base-200 rounded-lg shadow-md">
            <thead>
              <tr className="bg-base-300 text-base-content text-center">
                <th className="p-3">#</th>
                <th className="p-3">Company Name</th>
                <th className="p-3">Company Address</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company, index) => (
                <tr
                  key={company.id}
                  className="border-b border-base-300 text-center"
                >
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{company.name}</td>
                  <td className="p-3">{company.address}</td>
                  <td className="p-1 flex gap-1 justify-center">
                    <button
                      onClick={() => {
                        company.id && handleEdit(company.id);
                      }}
                      className="flex items-center mt-2 justify-center"
                    >
                      <PencilSquareIcon className="w-5 h-5 text-info" />
                    </button>

                    <button
                      onClick={() => {
                        void handleDelete(company.id ?? "");
                      }}
                      className="flex items-center mt-2 justify-center"
                    >
                      <TrashIcon className="w-5 h-5 text-red-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6 text-center text-gray-500">
          No companies added yet.
        </div>
      )}
    </div>
  );
};

export default CompanyAccounts;
