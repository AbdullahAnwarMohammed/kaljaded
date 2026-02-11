import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import MainLayout from "./MainLayout";
import EmptyLayout from "./EmptyLayout";
import GuestRoute from "./routes/GuestRoute";
import PaymentSuccess from "./Pages/PaymentSuccess";
import PaymentFailure from "./Pages/PaymentFailure";
import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.css";
// Fix for lazy loading CSS issue
import "./Pages/ProductByCategory.css";
import { LoadingProvider } from "./context/LoadingContext";
import Spinner from "./components/Spinner";
import { CartProvider } from "./context/CartContext";

import { lazyWithRetry } from "./utils/lazyWithRetry";

// Static import for Home to ensure faster LCP and header visibility
import Home from "./Pages/Home";

// Lazy loading components
// const Home = lazyWithRetry(() => import("./Pages/Home")); // Converted to static
const ProductByCategory = lazyWithRetry(() => import("./Pages/ProductByCategory"));
const Cart = lazyWithRetry(() => import("./Pages/Cart"));
const Fav = lazyWithRetry(() => import("./Pages/Fav"));
const LoginCustomer = lazyWithRetry(() => import("./Pages/LoginCustomer"));
// const RegisterCustomer = lazyWithRetry(() => import("./Pages/RegisterCustomer"));
const RegisterVendor = lazyWithRetry(() => import("./Pages/RegisterVendor"));
const ContactUs = lazyWithRetry(() => import("./Pages/ContactUs"));
const ProductDeatils = lazyWithRetry(() => import("./Pages/ProductDeatils"));
const Merchant = lazyWithRetry(() => import("./Pages/Merchant/Merchant"));
const MerchantDetail = lazyWithRetry(() =>
  import("./Pages/MerchantDetail/MerchantDetail")
);
const CheckoutTabs = lazyWithRetry(() => import("./Pages/Checkout/CheckoutTabs"));
const AboutUs = lazyWithRetry(() => import("./Pages/AboutUs"));
const PrivacyPolicy = lazyWithRetry(() => import("./Pages/PrivacyPolicy"));
const RequestProduct = lazyWithRetry(() => import("./Pages/RequestProduct"));
const AddDevice = lazy(() => import("./Pages/AddDevice"));
const ProductCustomerDetails = lazy(() => import("./Pages/ProductCustomerDetails"));
const SiteStats = lazy(() => import("./components/SiteStats/SiteStats"));

function App() {
  return (
    <LoadingProvider>
      <Spinner />
      <CartProvider>
        <Router basename={window.location.pathname.startsWith("/dist") ? "/dist/" : "/"}>
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
                  <EmptyLayout>
                    <MerchantDetail />
                  </EmptyLayout>
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
              
              {/* Short Link Route */}
              <Route
                path="/p/:id"
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
                path="/add-device"
                element={
                  <EmptyLayout>
                     <Suspense fallback={<Spinner />}>
                        <AddDevice />
                     </Suspense>
                  </EmptyLayout>
                }
              />

              <Route
                path="/product-customer/:id"
                element={
                  <EmptyLayout>
                     <ProductCustomerDetails />
                  </EmptyLayout>
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
                path="/payment-failed"
                element={
                  <EmptyLayout>
                    <PaymentFailure />
                  </EmptyLayout>
                }
              />


              {/* Fallback route */}
              <Route path="*" element={<MainLayout><Home /></MainLayout>} />

            </Routes>
          </Suspense>
        </Router>
      </CartProvider>
    </LoadingProvider>
  );
}

export default App;
