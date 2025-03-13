import { Header } from "./components/Header";
import Footer from "./components/Footer";
import { Outlet } from "react-router";


export function RootLayout() {
    const handleLogout = () => { }
    return (
        <div className="flex flex-col min-h-screen">
            <Header handleLogout={handleLogout} />
            <main className="flex-1 pt-16">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
