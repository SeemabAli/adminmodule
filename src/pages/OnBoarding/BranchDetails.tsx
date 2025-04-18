import React, { useState } from "react";
import type { OnboardingData } from "@/pages/OnBoarding/OnboardingMain";

interface BranchDetailsProps {
  branchesData: OnboardingData["branches"];
  updateBranches: (data: OnboardingData["branches"]) => void;

  onBranchSelect?: (id: string) => void;
}

const BranchDetails: React.FC<BranchDetailsProps> = ({
  branchesData,
  updateBranches,
}) => {
  const [activeTab, setActiveTab] = useState<string>(
    branchesData[0]?.id ?? "1",
  );

  const handleChange = (id: string, field: string, value: string | boolean) => {
    const updatedBranches = branchesData.map((branch) => {
      if (branch.id === id) {
        return { ...branch, [field]: value };
      }
      return branch;
    });
    updateBranches(updatedBranches);
  };

  const addBranch = () => {
    const newId = (
      Math.max(...branchesData.map((b) => parseInt(b.id)), 0) + 1
    ).toString();
    const newBranch = {
      id: newId,
      name: "",
      address: "",
      phone: "",
      isMainCampus: false,
    };
    updateBranches([...branchesData, newBranch]);
    setActiveTab(newId);
  };

  const removeBranch = (id: string) => {
    // Cannot remove if it's the only branch or if it's the main campus
    const branch = branchesData.find((b) => b.id === id);
    if (branchesData.length <= 1 || branch?.isMainCampus) {
      return;
    }

    const updatedBranches = branchesData.filter((branch) => branch.id !== id);
    updateBranches(updatedBranches);

    // Set active tab to the first branch if the active tab is removed
    if (activeTab === id) {
      setActiveTab(updatedBranches[0]?.id ?? "");
    }
  };

  const setMainCampus = (id: string) => {
    const updatedBranches = branchesData.map((branch) => ({
      ...branch,
      isMainCampus: branch.id === id,
    }));
    updateBranches(updatedBranches);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Branch Details</h2>
      <p className="text-center text-base-content/70">
        Configure your organization's branches
      </p>

      <div className="divider"></div>

      <div>
        <div className="tabs tabs-boxed mb-4">
          {branchesData.map((branch) => (
            <button
              key={branch.id}
              className={`tab ${activeTab === branch.id ? "tab-active" : ""}`}
              onClick={() => {
                setActiveTab(branch.id);
              }}
            >
              {branch.name || `Branch ${branch.id}`}
              {branch.isMainCampus && (
                <span className="badge badge-sm badge-primary ml-2">Main</span>
              )}
            </button>
          ))}
          <button className="tab" onClick={addBranch}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>

        {branchesData.map((branch) => (
          <div
            key={branch.id}
            className={activeTab === branch.id ? "block" : "hidden"}
          >
            <div className="bg-base-200 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-semibold">
                    {branch.isMainCampus ? "Main Campus" : "Branch Campus"}
                  </h3>
                </div>
                <div className="flex gap-2">
                  {!branch.isMainCampus && (
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => {
                        setMainCampus(branch.id);
                      }}
                      title="Set as main campus"
                    >
                      Set as Main
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-error btn-outline"
                    onClick={() => {
                      removeBranch(branch.id);
                    }}
                    disabled={branchesData.length <= 1 || branch.isMainCampus}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Branch Name*</span>
                </label>
                <input
                  type="text"
                  value={branch.name}
                  onChange={(e) => {
                    handleChange(branch.id, "name", e.target.value);
                  }}
                  placeholder="Enter branch name"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Phone Number*</span>
                  </label>
                  <input
                    type="tel"
                    value={branch.phone}
                    onChange={(e) => {
                      handleChange(branch.id, "phone", e.target.value);
                    }}
                    placeholder="+1 (123) 456-7890"
                    className="input input-bordered w-full"
                    required
                  />
                </div>
              </div>

              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">Address*</span>
                </label>
                <textarea
                  value={branch.address}
                  onChange={(e) => {
                    handleChange(branch.id, "address", e.target.value);
                  }}
                  className="textarea textarea-bordered h-24"
                  placeholder="Full address"
                  required
                ></textarea>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <button className="btn btn-outline btn-sm" onClick={addBranch}>
          Add Another Branch
        </button>
      </div>
    </div>
  );
};

export default BranchDetails;
