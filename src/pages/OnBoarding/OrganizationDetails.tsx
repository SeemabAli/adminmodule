/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, type ChangeEvent } from "react";
import { type OnboardingData } from "./OnboardingMain";

interface OrganizationDetailsProps {
  organizationData: OnboardingData["organization"];
  updateOrganization: (data: OnboardingData["organization"]) => void;
}

const OrganizationDetails: React.FC<OrganizationDetailsProps> = ({
  organizationData,
  updateOrganization,
}) => {
  const [logo, setLogo] = useState<File | null>(organizationData.logo ?? null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    updateOrganization({
      ...organizationData,
      [name]: value,
    });
  };

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setLogo(file);
      updateOrganization({
        ...organizationData,
        logo: file,
      });

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Organization Details</h2>
      <p className="text-center text-base-content/70">
        Tell us about your educational institution
      </p>

      <div className="divider"></div>

      <div className="flex flex-col items-center mb-6">
        <div className="avatar">
          <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 flex items-center justify-center bg-base-200">
            {logoPreview ? (
              <img src={logoPreview} alt="Organization logo" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mt-6 ml-6 text-base-content/30"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            )}
          </div>
        </div>
        <div className="mt-4">
          <label className="btn btn-sm btn-outline">
            Upload Logo
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleLogoChange}
            />
          </label>
        </div>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Organization Name*</span>
        </label>
        <input
          type="text"
          name="name"
          value={organizationData.name}
          onChange={handleChange}
          placeholder="Enter your organization name"
          className="input input-bordered w-full"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Email Address*</span>
          </label>
          <input
            type="email"
            name="email"
            value={organizationData.email}
            onChange={handleChange}
            placeholder="contact@example.com"
            className="input input-bordered w-full"
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Phone Number*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={organizationData.phone}
            onChange={handleChange}
            placeholder="+1 (123) 456-7890"
            className="input input-bordered w-full"
            required
          />
        </div>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Website</span>
        </label>
        <input
          type="url"
          name="website"
          value={organizationData.website}
          onChange={handleChange}
          placeholder="https://example.com"
          className="input input-bordered w-full"
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Address*</span>
        </label>
        <textarea
          name="address"
          value={organizationData.address}
          onChange={handleChange}
          className="textarea textarea-bordered h-24"
          placeholder="Full address"
          required
        ></textarea>
      </div>
    </div>
  );
};

export default OrganizationDetails;
