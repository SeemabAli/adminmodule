import { Toaster } from "react-hot-toast";
import { RootLayout } from "./layouts/root/RootLayout";
import { AuthLayout } from "./layouts/auth/Auth";
import Login from "./pages/auth/Login";
import CompanyAccounts from "./pages/Accounts/CompanyAccounts";
import Employees from "./pages/Accounts/Employees";
import BankAccounts from "./pages/Accounts/BankAccounts";
import TruckInformation from "./pages/Accounts/TruckInformation";
import DeliveryRoutes from "./pages/Accounts/DeliveryRoutes";
import TaxAccounts from "./pages/Accounts/TaxAccounts";
import FactoryExpenses from "./pages/Accounts/FactoryExpenses";
import TruckOtherExpenses from "./pages/Accounts/TruckOtherExpenses";
import Brands from "./pages/Brands/Brands";
import TruckRoute from "./pages/TruckRoute/TruckRoute";
import Customer from "./pages/Accounts/Customer";
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from "react-router";
import Home from "@/pages/home/Home";



const router = createBrowserRouter(
  createRoutesFromElements([

    <Route path="/" element={<RootLayout />} >
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
    </Route >,

    <Route path="/login" element={<AuthLayout />}>
      <Route index element={<Login />} />
    </Route>
  ])
)


export const App = () => {
  return (
    <div>
      <Toaster />
      <RouterProvider router={router} />
    </div>
  )
}