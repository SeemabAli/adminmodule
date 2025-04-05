import { Toaster } from "react-hot-toast";
import CompanyAccounts from "@/pages/Accounts/CompanyAccounts/CompanyAccounts";
import Employees from "@/pages/Accounts/Employees/Employees";
import BankAccounts from "@/pages/Accounts/BankAccounts/BankAccounts";
import DeliveryRoutes from "@/pages/Accounts/DeliveryRoutes/DeliveryRoutes";
import TaxAccounts from "@/pages/Accounts/TaxAccounts/TaxAccounts";
import TruckOtherExpenses from "@/pages/Accounts/TruckOtherExpenses/TruckOtherExpenses";
import Brands from "@/pages/Brands/Brands";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router";
import { Home } from "@/pages/home/Home";
import { RootLayout } from "@/common/layouts/rootLayout/RootLayout";
import { AuthLayout } from "@/common/layouts/authLayout/AuthLayout";
import { SigninPage } from "@/core/auth/pages/SigninPage";
import { RequireAuth } from "@/core/auth/components/RequireAuth";
import { PersistentLogin } from "@/core/auth/components/PersistentLogin";
import { ROLES } from "@/common/constants/roles.constants";
import { UnauthorizedPage } from "@/pages/unAuthorized/UnAuthorizedPage";
import Purchase from "@/pages/Accounts/Purchase/Purchase";

import { TruckInformation } from "@/pages/Accounts/TruckInformation/TruckInformation";
import { FactoryExpenses } from "@/pages/Accounts/FactoryExpenses/FactoryExpenses";
import { Customer } from "@/pages/Accounts/Customer/Customer";
import { TruckRoute } from "@/pages/TruckRoute/TruckRoute";
import { SetPasswordPage } from "@/core/auth/pages/SetPasswordPage";

const router = createBrowserRouter(
  createRoutesFromElements([
    // public routes
    <Route path="/login" element={<AuthLayout />}>
      <Route index element={<SigninPage />} />
    </Route>,

    <Route path="/" element={<RootLayout />}>
      <Route element={<UnauthorizedPage />} path="unauthorized" />
      {/* Employee Routes */}
      <Route element={<RequireAuth allowedRoles={[ROLES.EMPLOYEE]} />}>
        <Route path="set-password" element={<SetPasswordPage />} />
      </Route>
      <Route element={<PersistentLogin />}>
        {/* ADMIN ROUTES */}
        <Route element={<RequireAuth allowedRoles={[ROLES.ADMIN]} />}>
          <Route path="brands" element={<Brands />} />
          <Route path="company-accounts" element={<CompanyAccounts />} />
          <Route path="delivery-routes" element={<DeliveryRoutes />} />
          <Route path="tax-accounts" element={<TaxAccounts />} />
          <Route path="employees" element={<Employees />} />
          <Route path="bank-accounts" element={<BankAccounts />} />
          <Route path="truck-information" element={<TruckInformation />} />
          <Route path="factory-expenses" element={<FactoryExpenses />} />
          <Route path="truck-other-expenses" element={<TruckOtherExpenses />} />
          <Route path="purchase" element={<Purchase />} />
          <Route path="customer" element={<Customer />} />
          <Route path="truck-route" element={<TruckRoute />} />
        </Route>

        {/* Home Access */}
        <Route
          element={
            <RequireAuth
              allowedRoles={[ROLES.OWNER, ROLES.ADMIN, ROLES.EMPLOYEE]}
            />
          }
        >
          <Route index element={<Home />} />
        </Route>

        {/* Customer Access */}
        {/* <Route element={<RequireAuth allowedRoles={[ROLES.OWNER]} />}>
          <Route path="customer" element={<Customer />} />
          <Route path="truck-route" element={<TruckRoute />} />
        </Route> */}
      </Route>
    </Route>,
  ]),
);

export const App = () => {
  return (
    <div>
      <Toaster />
      <RouterProvider router={router} />
    </div>
  );
};
