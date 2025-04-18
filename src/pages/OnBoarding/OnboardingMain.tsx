import React, { useState } from "react";
import OrganizationDetails from "./OrganizationDetails";
import BranchDetails from "./BranchDetails";
import SessionSetup from "./SessionSetup";

interface OnboardingProps {
  onComplete: (data: OnboardingData) => void;
}

export interface OnboardingData {
  organization: {
    name: string;
    email: string;
    phone: string;
    address: string;
    logo?: File | null;
    website?: string;
  };
  branches: {
    id: string;
    name: string;
    address: string;
    phone: string;
    isMainCampus: boolean;
  }[];
  sessions: {
    branchId: string;
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
  }[];
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [data, setData] = useState<OnboardingData>({
    organization: {
      name: "",
      email: "",
      phone: "",
      address: "",
      logo: null,
      website: "",
    },
    branches: [
      {
        id: "1",
        name: "Main Campus",
        address: "",
        phone: "",
        isMainCampus: true,
      },
    ],
    sessions: [],
  });

  const updateOrganization = (
    organizationData: OnboardingData["organization"],
  ) => {
    setData({ ...data, organization: organizationData });
  };

  const updateBranches = (branchesData: OnboardingData["branches"]) => {
    setData({ ...data, branches: branchesData });
  };

  const updateSessions = (sessionsData: OnboardingData["sessions"]) => {
    setData({ ...data, sessions: sessionsData });
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(data);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 py-12 px-4 sm:px-6 lg:px-8 mt-0">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">
            Welcome to Ebridge
          </h1>
          <p className="text-base-content mt-2">
            Let's set up your school management system
          </p>
        </div>

        <div className="bg-base-100 shadow-xl rounded-lg overflow-hidden">
          <div className="p-6">
            {/* Stepper */}
            <ul className="steps steps-horizontal w-full mb-8">
              <li className={`step ${currentStep >= 1 ? "step-primary" : ""}`}>
                Organization
              </li>
              <li className={`step ${currentStep >= 2 ? "step-primary" : ""}`}>
                Branches
              </li>
              <li className={`step ${currentStep >= 3 ? "step-primary" : ""}`}>
                Sessions
              </li>
            </ul>

            {/* Step Content */}
            <div className="mt-8">
              {currentStep === 1 && (
                <OrganizationDetails
                  organizationData={data.organization}
                  updateOrganization={updateOrganization}
                />
              )}
              {currentStep === 2 && (
                <BranchDetails
                  branchesData={data.branches}
                  updateBranches={updateBranches}
                />
              )}
              {currentStep === 3 && (
                <SessionSetup
                  sessionsData={data.sessions}
                  branches={data.branches}
                  updateSessions={updateSessions}
                />
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-10">
              <button
                className="btn btn-outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                Back
              </button>

              <button className="btn btn-primary" onClick={handleNext}>
                {currentStep === 3 ? "Complete" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
