import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./layouts/Navbar";
import Footer from "./layouts/Footer";
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
import { LandingPage } from "./pages/Hero";
import { Toaster } from "react-hot-toast";

const AppRouter = () => {
  return (
    <div>
      <Toaster
        position="top-center"
        reverseOrder={false}
      />


      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow p-4 pb-0 pt-16">
            <Routes>
              {/* Accounts Section */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/accounts/company-accounts" element={<CompanyAccounts />} />
              <Route path="/accounts/employees" element={<Employees />} />
              <Route path="/accounts/bank-accounts" element={<BankAccounts />} />
              <Route path="/accounts/truck-information" element={<TruckInformation />} />
              <Route path="/accounts/delivery-routes" element={<DeliveryRoutes />} />
              <Route path="/accounts/tax-accounts" element={<TaxAccounts />} />
              <Route path="/accounts/factory-expenses" element={<FactoryExpenses />} />
              <Route path="/accounts/truck-other-expenses" element={<TruckOtherExpenses />} />

              {/* Brands Section */}
              <Route path="/brands" element={<Brands />} />

              {/* Truck Route Section */}
              <Route path="/truck-route" element={<TruckRoute />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </div>
  );
};

export default AppRouter;
