import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import MainLayout from "./MainLayout";
import EmptyLayout from "./EmptyLayout";
import GuestRoute from "./routes/GuestRoute";
import PaymentSuccess from "./Pages/PaymentSuccess";
import PaymentFailure from "./Pages/PaymentFailure";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.css";
// Fix for lazy loading CSS issue
import "./Pages/ProductByCategory.css";
import { LoadingProvider } from "./context/LoadingContext";
import Spinner from "./components/Spinner";
import { CartProvider } from "./context/CartContext";

// Lazy loading components
const Home = lazy(() => import("./Pages/Home"));
const ProductByCategory = lazy(() => import("./Pages/ProductByCategory"));
const Cart = lazy(() => import("./Pages/Cart"));
const Fav = lazy(() => import("./Pages/Fav"));
const LoginCustomer = lazy(() => import("./Pages/LoginCustomer"));
const RegisterCustomer = lazy(() => import("./Pages/RegisterCustomer"));
const RegisterVendor = lazy(() => import("./Pages/RegisterVendor"));
const ContactUs = lazy(() => import("./Pages/ContactUs"));
const ProductDeatils = lazy(() => import("./Pages/ProductDeatils"));
const Merchant = lazy(() => import("./Pages/Merchant/Merchant"));
const MerchantDetail = lazy(() =>
  import("./Pages/MerchantDetail/MerchantDetail")
);
const CheckoutTabs = lazy(() => import("./Pages/Checkout/CheckoutTabs"));
const AboutUs = lazy(() => import("./Pages/AboutUs"));
const PrivacyPolicy = lazy(() => import("./Pages/PrivacyPolicy"));
const RequestProduct = lazy(() => import("./Pages/RequestProduct"));

function App() {
  return (
    <LoadingProvider>
      <Spinner />
      <CartProvider>
        <Router>
          <Suspense fallback={<Spinner />}>
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
                path="/category/:slug"
                element={
                  <EmptyLayout>
                    <ProductByCategory />
                  </EmptyLayout>
                }
              />
              <Route
                path="/products"
                element={
                  <EmptyLayout>
                    <ProductByCategory />
                  </EmptyLayout>
                }
              />

              {/* الأقساط فقط */}
              <Route
                path="/category/installments/:slug?"
                element={
                  <MainLayout>
                    <ProductByCategory isInstallment={true} />
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
                path="/merchants/:id"
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

              {/* Checkout Page */}
              <Route
                path="/checkout"
                element={
                  <EmptyLayout>
                    <CheckoutTabs />
                  </EmptyLayout>
                }
              />

              <Route
                path="/product/:id/:slug"
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
                  <EmptyLayout>
                    <ContactUs />
                  </EmptyLayout>
                }
              />

              <Route
                path="/about-us"
                element={
                  <EmptyLayout>
                    <AboutUs />
                  </EmptyLayout>
                }
              />

              <Route
                path="/privacy-policy"
                element={
                  <EmptyLayout>
                    <PrivacyPolicy />
                  </EmptyLayout>
                }
              />

              <Route
                path="/request-product"
                element={
                  <MainLayout>
                    <RequestProduct />
                  </MainLayout>
                }
              />


              <Route
                path="/payment-success"
                element={
                  <EmptyLayout>
                    <PaymentSuccess />
                  </EmptyLayout>
                }
              />

              <Route
                path="/payment-failure"
                element={
                  <EmptyLayout>
                    <PaymentFailure />
                  </EmptyLayout>
                }
              />

            </Routes>
          </Suspense>
        </Router>
      </CartProvider>
    </LoadingProvider>
  );
}

export default App;
