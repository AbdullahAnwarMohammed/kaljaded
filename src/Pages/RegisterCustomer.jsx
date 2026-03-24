import React, { useState } from 'react'
import Logo from "../assets/logo.png";
import { Link } from "react-router-dom";
import { RiArrowRightLine, RiUser3Line, RiLock2Line, RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import "./RegisterCustomer.css";
import Api from "../Services/Api";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const RegisterCustomer = () => {
    const { t } = useTranslation();

    const navigate = useNavigate();
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        password_confirmation: ""
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Change handler
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" }); // clear error when user types
    };

    // Validation function
    const validate = () => {
        let newErrors = {};

        // اسم
        if (!form.name.trim()) {
            newErrors.name = "الاسم مطلوب";
        }

        // بريد
        if (!form.email.trim()) {
            newErrors.email = "البريد الإلكتروني مطلوب";
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            newErrors.email = "صيغة البريد الإلكتروني غير صحيحة";
        }

        // هاتف كويتي
        const kuwaitPhoneRegex = /^[24569]\d{7}$/;
        if (!form.phone.trim()) {
            newErrors.phone = "رقم الهاتف مطلوب";
        } else if (!kuwaitPhoneRegex.test(form.phone)) {
            newErrors.phone = "رقم الهاتف يجب أن يكون كويتياً من 8 أرقام";
        }

        // كلمة المرور
        if (!form.password.trim()) {
            newErrors.password = "كلمة المرور مطلوبة";
        }

        // تأكيد كلمة المرور
        if (form.password !== form.password_confirmation) {
            newErrors.password_confirmation = "كلمتا المرور غير متطابقتين";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            setLoading(true);

            const response = await Api.post("/register", form);

            // Correcting data access: response.data is { success: true, message: "...", data: { user: ..., token: ... } }
            const apiData = response.data.data;

            if (apiData) {
                localStorage.setItem("customer_token", apiData.token);
                localStorage.setItem("customer", JSON.stringify(apiData.user));
            }

            navigate("/");

        } catch (error) {
            if (error.response && error.response.status === 422) {
                // هنا بنجيب أخطاء الـ validation من السيرفر
                const serverErrors = error.response.data.errors;
                let formattedErrors = {};

                // تحويل المصفوفة لكل حقل إلى نص
                for (let key in serverErrors) {
                    formattedErrors[key] = serverErrors[key][0];
                }

                setErrors(formattedErrors);
            } else {
                console.log(error);
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="register-customer-page">
            <header>
                <Link to="/" className='icon-back'>
                    <RiArrowRightLine />
                </Link>
                <h6>{t("register_customer_title")}</h6>
            </header>

            <img src={Logo} className='logo' alt="Logo" />

            <div className="app-register">
                <h3>{t("create_account")}</h3>
                {errors.general && <div className="general-error">{errors.general}</div>}

                <form onSubmit={handleSubmit}>

                    {/* البريد الإلكتروني */}
                    <div className="form-group">
                        <div className="input-wrapper">
                            <RiUser3Line className="field-icon" />
                            <input
                                type="email"
                                name="email"
                                placeholder={t("email")}
                                value={form.email}
                                onChange={handleChange}
                                className={`form-control ${errors.email ? "input-error" : ""}`}
                            />
                        </div>
                        {errors.email && <div className="error-msg">{errors.email}</div>}
                    </div>

                    {/* اسم المستخدم */}
                    <div className="form-group">
                        <div className="input-wrapper">
                            <RiUser3Line className="field-icon" />
                            <input
                                type="text"
                                name="name"
                                placeholder={t("username")}
                                value={form.name}
                                onChange={handleChange}
                                className={`form-control ${errors.name ? "input-error" : ""}`}
                            />
                        </div>
                        {errors.name && <div className="error-msg">{errors.name}</div>}
                    </div>

                    {/* الهاتف */}
                    <div className={`form-group phone-field ${errors.phone ? "input-error" : ""}`}>
                        <div className="country">
                            <img src="https://flagcdn.com/w40/kw.png" alt="Kuwait" />
                            <span>+965</span>
                        </div>

                        <input
                            type="text"
                            name="phone"
                            placeholder={t("phone")}
                            value={form.phone}
                            onChange={handleChange}
                            className="form-control phone-input"
                        />
                    </div>
                    {errors.phone && <div className="error-msg">{errors.phone}</div>}

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
                        {errors.password && <div className="error-msg">{errors.password}</div>}
                    </div>

                    {/* تأكيد كلمة المرور */}
                    <div className="form-group">
                        <div className="input-wrapper">
                            <RiLock2Line className="field-icon" />
                            <input
                                type={showConfirmPass ? "text" : "password"}
                                name="password_confirmation"
                                placeholder={t("confirm_password")}
                                value={form.password_confirmation}
                                onChange={handleChange}
                                className={`form-control ${errors.password_confirmation ? "input-error" : ""}`}
                            />
                            <span className="show-pass" onClick={() => setShowConfirmPass(!showConfirmPass)}>
                                {showConfirmPass ? <RiEyeOffLine /> : <RiEyeLine />}
                            </span>
                        </div>
                        {errors.password_confirmation && <div className="error-msg">{errors.password_confirmation}</div>}
                    </div>

                    <div className="form-group">
                        <button type='submit' disabled={loading}>
                            {loading ? t("register_loading") : t("register_btn")}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )

};

export default RegisterCustomer;
