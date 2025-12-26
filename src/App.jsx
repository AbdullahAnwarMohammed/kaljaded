import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import MainLayout from "./MainLayout";
import EmptyLayout from "./EmptyLayout";

import Home from "./Pages/Home";
import ProductByCategory from "./Pages/ProductByCategory";
import Cart from "./Pages/Cart";
import Fav from "./Pages/Fav";
import LoginCustomer from "./Pages/LoginCustomer";

import RegisterCustomer from "./Pages/RegisterCustomer";
import RegisterVendor from "./Pages/RegisterVendor";
import ContactUs from "./Pages/ContactUs";

import ProductDeatils from "./Pages/ProductDeatils";

import GuestRoute from "./routes/GuestRoute";

import Merchant from "./Pages/Merchant/Merchant";
import MerchantDetail from "./Pages/MerchantDetail/MerchantDetail";


import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.css";
import { LoadingProvider } from "./context/LoadingContext";
import Spinner from "./components/Spinner";
import { FavoritesProvider } from "./context/FavoritesContext";
import { CartProvider } from "./context/CartContext";



function App() {

  return (
    <LoadingProvider>
      <Spinner />
      <CartProvider>
          <Router>
            <Routes>
              <Route
                path="/"
                element={
                  <MainLayout>
                    <Home />
                  </MainLayout>
                }
              />
              <Route
                path="/installments"
                element={
                  <MainLayout>
                    <ProductByCategory installmentOnly />
                  </MainLayout>
                }
              />

              <Route
                path="/installments/:slug"
                element={
                  <MainLayout>
                    <ProductByCategory installmentOnly />
                  </MainLayout>
                }
              />
              <Route
                path="/category/:slug"
                element={
                  <MainLayout>
                    <ProductByCategory />
                  </MainLayout>
                }
              />
              <Route
                path="/merchants"
                element={
                  <MainLayout>
                    <Merchant />
                  </MainLayout>
                }
              />
              <Route
                path="/merchants/:slug"
                element={
                  <MainLayout>
                    <MerchantDetail />
                  </MainLayout>
                }
              />
              {/** 🛒 صفحة السلة محمية */}
              <Route
                path="/carts"
                element={
                  <MainLayout>
                    <Cart />
                  </MainLayout>
                }
              />

              <Route
                path="/favs"
                element={
                  <MainLayout>
                    <Fav />
                  </MainLayout>
                }
              />

              <Route
                path="/product/:slug"
                element={
                  <MainLayout>
                    <ProductDeatils />
                  </MainLayout>
                }
              />


              {/* الصفحات بدون Header/Footer */}
              <Route
                path="/login-customer"
                element={
                  <GuestRoute>
                    <EmptyLayout>
                      <LoginCustomer />
                    </EmptyLayout>
                  </GuestRoute>
                }
              />

              <Route
                path="/register-customer"
                element={
                  <GuestRoute>
                    <EmptyLayout>
                      <RegisterCustomer />
                    </EmptyLayout>
                  </GuestRoute>
                }
              />

              <Route
                path="/register-vendor"
                element={
                  <GuestRoute>
                    <EmptyLayout>
                      <RegisterVendor />
                    </EmptyLayout>
                  </GuestRoute>
                }
              />

              <Route
                path="/contact-us"
                element={
                  <MainLayout>
                    <ContactUs />
                  </MainLayout>
                }
              />

            </Routes>
          </Router>
      </CartProvider>
    </LoadingProvider>
  );
}

export default App;
