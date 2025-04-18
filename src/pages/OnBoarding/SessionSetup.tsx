import React, { useState } from "react";
import { type OnboardingData } from "./OnboardingMain";

interface SessionSetupProps {
  sessionsData: OnboardingData["sessions"];
  branches: OnboardingData["branches"];
  updateSessions: (data: OnboardingData["sessions"]) => void;
}

const SessionSetup: React.FC<SessionSetupProps> = ({
  sessionsData,
  branches,
  updateSessions,
}) => {
  const [activeBranchId, setActiveBranchId] = useState<string>(
    branches[0]?.id ?? "",
  );

  // Filter sessions for the active branch
  const branchSessions = sessionsData.filter(
    (session) => session.branchId === activeBranchId,
  );

  const handleAddSession = () => {
    const newSession = {
      branchId: activeBranchId,
      name: "",
      startDate: "",
      endDate: "",
      isActive: branchSessions.length === 0, // First session for a branch is active by default
    };
    updateSessions([...sessionsData, newSession]);
  };

  const handleRemoveSession = (index: number) => {
    const sessionToRemove = branchSessions[index];
    if (!sessionToRemove) return; // Exit if sessionToRemove is undefined
    const updatedSessions = sessionsData.filter(
      (session) =>
        !(
          session.branchId === sessionToRemove.branchId &&
          session.name === sessionToRemove.name &&
          session.startDate === sessionToRemove.startDate
        ),
    );
    updateSessions(updatedSessions);
  };

  const handleSessionChange = (
    index: number,
    field: string,
    value: string | boolean,
  ) => {
    const sessionToUpdate = branchSessions[index];
    if (!sessionToUpdate) return; // Exit if sessionToUpdate is undefined
    const updatedSessions = sessionsData.map((session) => {
      if (
        session.branchId === sessionToUpdate.branchId &&
        session.name === sessionToUpdate.name &&
        session.startDate === sessionToUpdate.startDate
      ) {
        return { ...session, [field]: value };
      }
      return session;
    });
    updateSessions(updatedSessions);
  };

  const setActiveSession = (index: number) => {
    // Update the active status - only one session can be active per branch
    const sessionToActivate = branchSessions[index];
    if (!sessionToActivate) return; // Exit if sessionToActivate is undefined
    const updatedSessions = sessionsData.map((session) => {
      if (session.branchId === activeBranchId) {
        return {
          ...session,
          isActive:
            sessionToActivate &&
            session.branchId === sessionToActivate.branchId &&
            session.name === sessionToActivate.name &&
            session.startDate === sessionToActivate.startDate,
        };
      }
      return session;
    });
    updateSessions(updatedSessions);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Session Setup</h2>
      <p className="text-center text-base-content/70">
        Configure academic sessions for each branch
      </p>

      <div className="divider"></div>

      <div className="tabs tabs-boxed mb-6">
        {branches.map((branch) => (
          <button
            key={branch.id}
            className={`tab ${activeBranchId === branch.id ? "tab-active" : ""}`}
            onClick={() => {
              setActiveBranchId(branch.id);
            }}
          >
            {branch.name}
            {branch.isMainCampus && (
              <span className="badge badge-sm badge-primary ml-2">Main</span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-base-200 p-4 rounded-lg">
        <h3 className="font-bold mb-4">
          Sessions for{" "}
          {branches.find((b) => b.id === activeBranchId)?.name ?? "Branch"}
        </h3>

        {branchSessions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-base-content/70">No sessions added yet</p>
            <button
              className="btn btn-primary btn-sm mt-4"
              onClick={handleAddSession}
            >
              Add First Session
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {branchSessions.map((session, index) => (
              <div key={index} className="bg-base-100 p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <h4 className="font-semibold">Session {index + 1}</h4>
                    {session.isActive && (
                      <span className="badge badge-success ml-2">Active</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!session.isActive && (
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => {
                          setActiveSession(index);
                        }}
                      >
                        Set Active
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-error btn-outline"
                      onClick={() => {
                        handleRemoveSession(index);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Session Name*</span>
                  </label>
                  <input
                    type="text"
                    value={session.name}
                    onChange={(e) => {
                      handleSessionChange(index, "name", e.target.value);
                    }}
                    placeholder="e.g., 2025-2026, Fall 2025, etc."
                    className="input input-bordered w-full"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Start Date*</span>
                    </label>
                    <input
                      type="date"
                      value={session.startDate}
                      onChange={(e) => {
                        handleSessionChange(index, "startDate", e.target.value);
                      }}
                      className="input input-bordered w-full"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">End Date*</span>
                    </label>
                    <input
                      type="date"
                      value={session.endDate}
                      onChange={(e) => {
                        handleSessionChange(index, "endDate", e.target.value);
                      }}
                      className="input input-bordered w-full"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-center mt-4">
              <button className="btn btn-outline" onClick={handleAddSession}>
                Add Another Session
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionSetup;
