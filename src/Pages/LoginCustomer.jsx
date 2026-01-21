import React, { useState } from 'react'
import Logo from "../assets/logo.png";
import "./LoginCustomer.css";
import { Link, useNavigate } from "react-router-dom";
import { RiArrowRightLine, RiUser3Line, RiLock2Line, RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import Api from "../Services/Api";
import { mergeGuestCart, getCart } from "../api/cartApi";
import { useTranslation } from "react-i18next";

import { useCart } from "../context/CartContext";

const Login = () => {

  const navigate = useNavigate();
  const { fetchCart, setCart } = useCart(); // Access cart context
  const [showPass, setShowPass] = useState(false);

  const [form, setForm] = useState({
    name_or_phone: "",
    password: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Handle change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // Validation
  const validate = () => {
    let newErrors = {};

    if (!form.name_or_phone.trim()) {
      newErrors.name_or_phone = "البريد الإلكتروني مطلوب";
    }

    if (!form.password.trim()) {
      newErrors.password = "كلمة المرور مطلوبة";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit login
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      const response = await Api.post("/login", form);
      localStorage.setItem("customer_token", response.data.data.token);
      localStorage.setItem("customer", JSON.stringify(response.data.data.user));
      try {
        await mergeGuestCart();
        // Clear old state (optional but safe) and fetch merged cart
        setCart(null);
        await fetchCart();
      } catch (mergeError) {
        console.error("Failed to merge guest cart:", mergeError.response?.data || mergeError.message);
        // Even if merge fails, we should fetch the user's cart
        await fetchCart();
      }
      navigate("/");
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: "حدث خطأ أثناء تسجيل الدخول" });
      }
    } finally {
      setLoading(false);
    }
  };


  const { t } = useTranslation();

  return (
    <div className="login-customer-page">

      <Link to="/" className='icon-back'>
        <RiArrowRightLine />
      </Link>

      <img src={Logo} className='logo' alt="" />

      <div className="app-login">

        <h3>{t("login_title")}</h3>
        {errors.general && <div className="general-error">{errors.general}</div>}


        <form onSubmit={handleSubmit}>

          {/* البريد أو الهاتف */}
          <div className="form-group">
            <div className="input-wrapper">
              <RiUser3Line className="field-icon" />
              <input
                type="text"
                name="name_or_phone"
                placeholder={t("email_or_phone")}
                value={form.name_or_phone}
                onChange={handleChange}
                className={`form-control ${errors.name_or_phone ? "input-error" : ""}`}
              />
            </div>
            {errors.name_or_phone && <div className='error-msg'>{errors.name_or_phone}</div>}
          </div>

          {/* كلمة المرور */}
          <div className="form-group">
            <div className="input-wrapper">
              <RiLock2Line className="field-icon" />
              <input
                type={showPass ? "text" : "password"}
                name="password"
                placeholder={t("password")}
                value={form.password}
                onChange={handleChange}
                className={`form-control ${errors.password ? "input-error" : ""}`}
              />
              <span className="show-pass" onClick={() => setShowPass(!showPass)}>
                {showPass ? <RiEyeOffLine /> : <RiEyeLine />}
              </span>
            </div>
            {errors.password && <div className='error-msg'>{errors.password}</div>}
          </div>

          <div className="form-group">
            <button type='submit' disabled={loading}>
              {loading ? t("login_loading") : t("login_btn")}
            </button>
          </div>

        </form>

        <h3>{t("or")}</h3>

        <Link to="/register-customer" className="register-customer-btn">
          {t("register_customer")}
        </Link>

        {/* <div className="register-customer-vendor">
          <span>{t("register_vendor_text")}</span>
          <Link to="/register-vendor">{t("register_vendor_link")}</Link>
        </div> */}

      </div>
    </div>
  )

}

export default Login;
