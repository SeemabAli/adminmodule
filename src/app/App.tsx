import { Toaster } from "react-hot-toast";
import CompanyAccounts from "@/pages/Accounts/CompanyAccounts/CompanyAccounts";
import Employees from "@/pages/Accounts/Employees";
import BankAccounts from "@/pages/Accounts/BankAccounts";
import TruckInformation from "@/pages/Accounts/TruckInformation";
import DeliveryRoutes from "@/pages/Accounts/DeliveryRoutes/DeliveryRoutes";
import TaxAccounts from "@/pages/Accounts/TaxAccounts/TaxAccounts";
import FactoryExpenses from "@/pages/Accounts/FactoryExpenses";
import TruckOtherExpenses from "@/pages/Accounts/TruckOtherExpenses";
import Brands from "@/pages/Brands/Brands";
import TruckRoute from "@/pages/TruckRoute/TruckRoute";
import Customer from "@/pages/Accounts/Customer";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router";
import { Home } from "@/pages/home/Home";
import { Purchase } from "@/pages/Accounts/Purchase";
// import { RequireAuth } from "@/core/auth/components/RequireAuth";
import { RootLayout } from "@/common/layouts/rootLayout/RootLayout";
import { AuthLayout } from "@/common/layouts/authLayout/AuthLayout";
import { SigninPage } from "@/core/auth/pages/SigninPage";

const router = createBrowserRouter(
  createRoutesFromElements([
    <Route path="/" element={<RootLayout />}>
      {/* RequireAuth commented out for checking purposes */}
      {/* <Route element={<RequireAuth />}> */}
      <Route index element={<Home />} />
      <Route path="brands" element={<Brands />} />
      <Route path="company-accounts" element={<CompanyAccounts />} />
      <Route path="employees" element={<Employees />} />
      <Route path="bank-accounts" element={<BankAccounts />} />
      <Route path="truck-information" element={<TruckInformation />} />
      <Route path="delivery-routes" element={<DeliveryRoutes />} />
      <Route path="tax-accounts" element={<TaxAccounts />} />
      <Route path="factory-expenses" element={<FactoryExpenses />} />
      <Route path="truck-other-expenses" element={<TruckOtherExpenses />} />
      <Route path="truck-route" element={<TruckRoute />} />
      <Route path="customer" element={<Customer />} />
      <Route path="purchase" element={<Purchase />} />
      {/* </Route> */}
    </Route>,

    <Route path="/login" element={<AuthLayout />}>
      <Route index element={<SigninPage />} />
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
