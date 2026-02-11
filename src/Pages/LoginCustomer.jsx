import React, { useState, useEffect, useRef } from 'react'
import Logo from "../assets/logo.png";
import "./LoginCustomer.css";
import { Link, useNavigate } from "react-router-dom";
import { RiArrowRightLine, RiUser3Line, RiLock2Line, RiPhoneLine } from "react-icons/ri";
import Api from "../Services/Api";
import { mergeGuestCart } from "../api/cartApi";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";
import Swal from 'sweetalert2';

const Login = () => {

  const navigate = useNavigate();
  const { fetchCart, setCart } = useCart();
  
  // Step 1: Phone, Step 2: OTP
  const [step, setStep] = useState(1);
  
  const [form, setForm] = useState({
    phone: "20",
  });
  
  // OTP State (4 digits)
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef([]);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Timer State
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // Timer Effect
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text").slice(0, 4).split("");
    if (data.every(char => !isNaN(char))) {
        const newOtp = [...otp];
        data.forEach((char, index) => {
            if(index < 4) newOtp[index] = char;
        });
        setOtp(newOtp);
        if (data.length === 4) {
            inputRefs.current[3].focus();
        } else {
             inputRefs.current[data.length].focus();
        }
    }
  };

  const validatePhone = () => {
    if (!form.phone.trim()) {
      setErrors({ phone: "رقم الهاتف مطلوب" });
      return false;
    }
    return true;
  };

  const handleSendOtp = async (e) => {
    if(e) e.preventDefault();
    if (!validatePhone()) return;

    try {
      setLoading(true);
      await Api.post("/send-otp", { phone: form.phone });
      setStep(2);
      setTimer(60);
      setCanResend(false);
      setOtp(["", "", "", ""]);
      setErrors({});
      Swal.fire({
        icon: 'success',
        title: 'تم الإرسال',
        text: 'تم إرسال رمز التحقق بنجاح',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.log(error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        let msg = error.response.data.message;
        if (msg.toLowerCase().includes("please wait")) {
            msg = t("wait_before_resend");
        }
        setErrors({ general: msg });
      } else {
        setErrors({ general: t("otp_error_fail") || "فشل إرسال رمز التحقق" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 4) {
      setErrors({ code: "يرجى إدخال رمز التحقق كاملاً" });
      return;
    }

    try {
      setLoading(true);
      const response = await Api.post("/verify-otp", { phone: form.phone, code });
      
      localStorage.setItem("customer_token", response.data.data.token);
      localStorage.setItem("customer", JSON.stringify(response.data.data.user));
      
      try {
        await mergeGuestCart();
        setCart(null);
        await fetchCart();
      } catch (mergeError) {
        console.error("Failed to merge guest cart:", mergeError);
        await fetchCart();
      }
      
      navigate("/");
    } catch (error) {
        if (error.response?.data?.errors) {
            setErrors(error.response.data.errors);
        } else if (error.response?.data?.message) {
            setErrors({ general: error.response.data.message });
        } else {
            setErrors({ general: "رمز التحقق غير صحيح" });
        }
        Swal.fire({
            icon: 'error',
            title: 'خطأ',
            text: error.response?.data?.message || 'رمز التحقق غير صحيح',
        });
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

        <h3>{step === 1 ? t("login_title") : t("enter_otp")}</h3>
        {step === 2 && <p className="otp-subtitle">{t("otp_subtitle", { phone: form.phone })}</p>}
        {errors.general && <div className="general-error">{errors.general}</div>}

        <form onSubmit={step === 1 ? handleSendOtp : handleVerifyOtp}>

          {step === 1 && (
            <div className="form-group">
                <div className="input-wrapper">
                <RiPhoneLine className="field-icon" />
                <input
                    type="text"
                    name="phone"
                    placeholder={t("phone")}
                    value={form.phone}
                    onChange={handleChange}
                    className={`form-control ${errors.phone ? "input-error" : ""}`}
                />
                </div>
                {errors.phone && <div className='error-msg'>{errors.phone}</div>}

                {timer > 0 && (
                    <div className="otp-timer" style={{color: '#ff6b6b', marginTop: '10px'}}>
                        {t("resend_wait", { seconds: timer })}
                    </div>
                )}
            </div>
          )}

          {step === 2 && (
            <div className="form-group">
                <div className="otp-container" onPaste={handlePaste}>
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            ref={(el) => (inputRefs.current[index] = el)}
                            className={`otp-input ${errors.code ? "input-error" : ""}`}
                        />
                    ))}
                </div>
                {errors.code && <div className='error-msg text-center'>{errors.code}</div>}
                
                <div className="otp-timer">
                    {canResend ? (
                        <button type="button" className="resend-btn" onClick={() => handleSendOtp(null)}>
                            إعادة إرسال الرمز
                        </button>
                    ) : (
                        <span>{t("resend_wait", { seconds: timer })}</span>
                    )}
                </div>

            </div>
          )}

          <div className="form-group">
            <button type='submit' disabled={loading || (step === 1 && timer > 0)}>
              {loading ? t("login_loading") : (step === 1 ? t("submit_send_otp") : t("submit_verify_otp"))}
            </button>
          </div>

          {step === 2 && (
            <div style={{marginTop: '10px', textAlign: 'center'}}>
                <span style={{cursor: 'pointer', color: '#fff', fontSize: '14px',fontWeight:'bold'}} onClick={() => { setStep(1); }}>{t("change_phone")}</span>
            </div>
          )}

        </form>

      </div>
    </div>
  )

}

export default Login;
