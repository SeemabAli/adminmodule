import { useState } from "react";
import { notify } from "@/lib/notify";
import { FormField } from "@/common/components/ui/form/FormField";
import { useForm } from "react-hook-form";
import { Button } from "@/common/components/ui/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { companySchema, type Company } from "./company.schema";

const CompanyAccounts = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

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
      name: "",
      address: "",
    },
  });

  const handleAddCompany = async (newCompany: Company) => {
    setCompanies([...companies, newCompany]);
    reset();
    return Promise.resolve(newCompany);
  };

  const onCompanyUpdate = async (updatedCompanyIndex: number) => {
    const updatedCompanies = companies.map((company, index) => {
      if (index === updatedCompanyIndex) {
        return getValues();
      }
      return company;
    });

    setCompanies(updatedCompanies);
    setEditingIndex(null);
    reset();
    return Promise.resolve(updatedCompanies);
  };

  const handleEdit = (index: number) => {
    const targetCompany = companies.find((_, i) => i === index);
    // Don't update fields if company is not present in the list of companies
    if (!targetCompany) return;

    setValue("name", targetCompany.name);
    setValue("address", targetCompany.address);
    setFocus("name");
    setEditingIndex(index);
  };

  const handleDelete = (index: number) => {
    setCompanies(companies.filter((_, i) => i !== index));
    notify.success("Company deleted successfully.");
  };

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
            editingIndex !== null
              ? handleSubmit(() => {
                  void onCompanyUpdate(editingIndex);
                })
              : handleSubmit(handleAddCompany)
          }
          shape="info"
          pending={isSubmitting}
          className="mt-4"
        >
          {editingIndex !== null ? "Update Company" : "Add Company"}
        </Button>
      </div>
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
                  key={index}
                  className="border-b border-base-300 text-center"
                >
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{company.name}</td>
                  <td className="p-3">{company.address}</td>
                  <td className="p-3 flex gap-2 justify-center">
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => {
                        handleEdit(index);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        handleDelete(index);
                      }}
                      className="btn btn-sm btn-error"
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
        <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6 text-center text-gray-500">
          No companies added yet.
        </div>
      )}
    </div>
  );
};

export default CompanyAccounts;
