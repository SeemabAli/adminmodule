import { useState } from "react";
import { notify } from "../../lib/notify";

const CompanyAccounts = () => {
  const [companies, setCompanies] = useState<
    { name: string; address: string }[]
  >([]);
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddCompany = () => {
    if (!companyName.trim() || !companyAddress.trim()) {
      notify.error("Please fill in all fields.");
      return;
    }

    if (editingIndex !== null) {
      const updatedCompanies = [...companies];
      updatedCompanies[editingIndex] = {
        name: companyName,
        address: companyAddress,
      };
      setCompanies(updatedCompanies);
      notify.success("Company updated successfully.");
      setEditingIndex(null);
    } else {
      setCompanies([
        ...companies,
        { name: companyName, address: companyAddress },
      ]);
      notify.success("Company added successfully.");
    }

    setCompanyName("");
    setCompanyAddress("");
  };

  const handleEdit = (index: number) => {
    setCompanyName(companies.find((_, i) => i === index)?.name ?? "");
    setCompanyAddress(companies.find((_, i) => i === index)?.address ?? "");
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block mb-1 font-medium">
            Company Name
            <input
              placeholder="Enter Name"
              value={companyName}
              onChange={(e) => {
                setCompanyName(e.target.value);
              }}
            />
          </label>
          <label className="block mb-1 font-medium">
            Company Address
            <input
              placeholder="Enter Address"
              value={companyAddress}
              onChange={(e) => {
                setCompanyAddress(e.target.value);
              }}
            />
          </label>
        </div>
        <button onClick={handleAddCompany} className="btn btn-info mt-4">
          {editingIndex !== null ? "Update Company" : "Add Company"}
        </button>
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
                      onClick={() => {
                        handleEdit(index);
                      }}
                      className="btn btn-sm btn-secondary"
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
        <p className="text-gray-500 text-center">No companies added yet.</p>
      )}
    </div>
  );
};

export default CompanyAccounts;
