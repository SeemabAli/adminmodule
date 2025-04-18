import { Toaster } from "react-hot-toast";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router";
import { RootLayout } from "@/common/layouts/rootLayout/RootLayout";
import { AuthLayout } from "@/common/layouts/authLayout/AuthLayout";
import { RequireAuth } from "@/core/auth/components/RequireAuth";
import { PersistentLogin } from "@/core/auth/components/PersistentLogin";
import { ROLES } from "@/common/constants/roles.constants";
import { SignInPage } from "@/core/auth/pages/SigninPage";
import { UnauthorizedPage } from "@/pages/unAuthorized/UnAuthorizedPage";
import OnboardingMain from "@/pages/OnBoarding/OnboardingMain";

// Pages
import InsertClassPage from "@/pages/addclass";
import AddStaffPage from "@/pages/addstaff";
import AddSubjectPage from "@/pages/addsubject";
import Admission from "@/pages/admission";
import AttendanceMain from "@/pages/Attendance/AttendanceMain";
import ClassListingPage from "@/pages/class";
import DiaryPage from "@/pages/Diary";
import UpdateClassPage from "@/pages/editclass";
import EditSubjectPage from "@/pages/editsubject";
import ExamManagement from "@/pages/EMS";
import GradesPage from "@/pages/grades";
import StaffListingPage from "@/pages/staff";
import StudentListing from "@/pages/Students";
import SubjectListingPage from "@/pages/Subjects";
import OnboardingCheck from "@/pages/OnBoarding/OnboardingCheck";

const router = createBrowserRouter(
  createRoutesFromElements([
    // Public Routes
    <Route path="/login" element={<AuthLayout />} key="auth">
      <Route index element={<SignInPage />} />
    </Route>,

    <Route path="/" element={<RootLayout />} key="main">
      <Route path="unauthorized" element={<UnauthorizedPage />} />

      <Route element={<PersistentLogin />}>
        {/* Onboarding Route */}
        <Route
          element={
            <RequireAuth
              allowedRoles={[ROLES.ADMIN, ROLES.OWNER, ROLES.ACCOUNTANT]}
            />
          }
        >
          <Route
            path="onboarding"
            element={
              <OnboardingMain
                onComplete={(data) => {
                  console.log("Onboarding completed:", data);
                }}
              />
            }
          />
        </Route>

        <Route
          element={
            <RequireAuth
              allowedRoles={[
                ROLES.OWNER,
                ROLES.ADMIN,
                ROLES.EMPLOYEE,
                ROLES.ACCOUNTANT,
              ]}
            />
          }
        >
          {/* OnboardingCheck wraps routes to ensure OWNER completes onboarding */}
          <Route element={<OnboardingCheck />}>
            {/* Class Management */}
            <Route path="add-class" element={<InsertClassPage />} />
            <Route path="update-class/:classID" element={<UpdateClassPage />} />
            <Route path="class" element={<ClassListingPage />} />

            {/* Staff Management */}
            <Route path="add-staff" element={<AddStaffPage />} />
            <Route path="staff" element={<StaffListingPage />} />

            {/* Subject Management */}
            <Route path="subject" element={<SubjectListingPage />} />
            <Route path="add-subject" element={<AddSubjectPage />} />
            <Route
              path="update-subject/:subjectID"
              element={<EditSubjectPage />}
            />

            {/* Exams */}
            <Route path="exam-board" element={<ExamManagement />} />
            <Route path="exams-details" element={<GradesPage />} />
            <Route path="exams-detail/:examsID" element={<GradesPage />} />

            {/* Attendance */}
            <Route path="attendance" element={<AttendanceMain />} />

            {/* Diary */}
            <Route path="diary" element={<DiaryPage />} />

            {/* Students */}
            <Route path="students" element={<StudentListing />} />
            <Route path="admission" element={<Admission />} />
          </Route>
        </Route>
      </Route>
    </Route>,
  ]),
);

const App = () => {
  return (
    <div>
      <Toaster />
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
