import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import MainLayout from "./MainLayout";
import EmptyLayout from "./EmptyLayout";
import GuestRoute from "./routes/GuestRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
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
import { useEffect } from "react";
import { onMessageListener } from "./firebase-config";
import { showNotificationPermissionPopup } from "./utils/notificationHelper";

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
const CompleteProfile = lazy(() => import("./Pages/CompleteProfile"));
const Profile = lazy(() => import("./Pages/Profile"));
const Notifications = lazy(() => import("./Pages/Notifications"));
const AuthCallback = lazy(() => import("./Pages/AuthCallback"));
const AccessoryDetails = lazyWithRetry(() => import("./Pages/AccessoryDetails"));
const NotFound = lazy(() => import("./Pages/NotFound"));

import EnrollmentCheck from "./components/EnrollmentCheck";

function App() {
  useEffect(() => {
    // Check if user is logged in before requesting token
    const token = localStorage.getItem("customer_token");
    if (token) {
      showNotificationPermissionPopup();
    }

    onMessageListener()
      .then((payload) => {
        console.log("Foreground message received:", payload);
        // You can use a custom alert or toast here
      })
      .catch((err) => console.log("failed: ", err));
  }, []);

  return (
    <LoadingProvider>
      <Spinner />
      <CartProvider>
        <Router basename={window.location.pathname.startsWith("/dist") ? "/dist/" : "/"}>
              <EnrollmentCheck />
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

              {/* Accessory Details Route */}
              <Route
                path="/accessory/:identifier"
                element={
                  <MainLayout>
                    <AccessoryDetails />
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
                path="/complete-profile"
                element={
                    <EmptyLayout>
                      <CompleteProfile />
                    </EmptyLayout>
                }
              />

              <Route
                path="/auth/callback"
                element={
                    <EmptyLayout>
                      <AuthCallback />
                    </EmptyLayout>
                }
              />

              <Route
                path="/profile"
                element={
                    <EmptyLayout>
                      <Profile />
                    </EmptyLayout>
                }
              />

              <Route
              path="/notifications"
              element={
                  <EmptyLayout>
                    <Notifications />
                  </EmptyLayout>
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
                  <ProtectedRoute>
                    <MainLayout>
                      <RequestProduct />
                    </MainLayout>
                  </ProtectedRoute>
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
                  <ProtectedRoute>
                    <EmptyLayout>
                       <ProductCustomerDetails />
                    </EmptyLayout>
                  </ProtectedRoute>
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
              <Route path="*" element={<EmptyLayout><NotFound /></EmptyLayout>} />

            </Routes>
          </Suspense>
        </Router>
      </CartProvider>
    </LoadingProvider>
  );
}

export default App;
