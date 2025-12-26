import React, { useState, useCallback } from 'react'
import { useDropzone } from "react-dropzone";

import "./RegisterVendor.css";
import { Link } from "react-router-dom";
import { RiArrowRightLine, RiUser3Line, RiLock2Line, RiEyeLine, RiEyeOffLine, RiBuilding2Line, RiFileList2Line } 
from "react-icons/ri";
import Logo from "../assets/logo.png";
import Select from 'react-select';
import { IoMdCloudUpload } from "react-icons/io";

const options = [
    { value: 'kuwait', label: 'مدينة الكويت' },
    { value: 'ahmadi', label: 'الأحمدي' },
    { value: 'hawalli', label: 'حولي' },
];

const customStyles = {
    menu: (provided) => ({
        ...provided,
        backgroundColor: "#1a1a1a",
        color: "#fff",
        borderRadius: 10,
        padding: 5,
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected
            ? "#435292"
            : state.isFocused
                ? "#333"
                : "transparent",
        color: "#fff",
        padding: 10,
        cursor: "pointer",
    }),
    control: (provided, state) => ({
        ...provided,
        backgroundColor: "#e9eaec",
        color: "#fff",
        borderColor: state.isFocused ? "#4CAF50" : "#555",
        boxShadow: "none",
        padding: "4px",
    }),
    singleValue: (provided) => ({
        ...provided,
        color: "#555",
    }),
};
const RegisterVendor = () => {

    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    const [preview, setPreview] = useState(null);

    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        setPreview(URL.createObjectURL(file));
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/*": [] },
        multiple: false,
    });
    return (
        <>
            <div className="register-vendor-page">
                <header>
                    <Link to="/" className='icon-back'>
                        <RiArrowRightLine />
                    </Link>
                    <h6>تسجيل حساب جديد تاجر</h6>
                </header>

                <img src={Logo} className='logo' alt="" />

                <div className="app-register">

                    <h3>انشاء حساب جديد</h3>

                    <form>

                        <div className="form-group">

                            <div
                                {...getRootProps()}
                                className="dropzone-box"
                            >
                                <input {...getInputProps()} />

                                {preview ? (
                                    <img src={preview} alt="Preview" className="preview-img" />
                                ) : (
                                    <div>
                                        <IoMdCloudUpload />

                                        <p>اختر صورة اعلان المحل من الخارج أو حمل شعار الشركة</p>
                                    </div>

                                )}
                            </div>
                        </div>

                        {/* اسم المستخدم */}
                        <div className="form-group with-icon">
                            <RiUser3Line className="field-icon" />
                            <input type="text" placeholder='اسم المستخدم' className='form-control' />
                        </div>

                        {/* رقم الهاتف + علم الكويت + كود +965 */}
                        <div className="form-group phone-field">
                            <div className="country">
                                <img src="https://flagcdn.com/w40/kw.png" alt="Kuwait" />
                                <span>+965</span>
                            </div>

                            <input
                                type="text"
                                placeholder='رقم الجوال'
                                className='form-control phone-input'
                            />
                        </div>

                        {/* كلمة المرور */}
                        <div className="form-group with-icon">
                            <RiLock2Line className="field-icon" />

                            <input
                                type={showPass ? "text" : "password"}
                                placeholder='كلمة المرور'
                                className='form-control'
                            />

                            <span className="show-pass" onClick={() => setShowPass(!showPass)}>
                                {showPass ? <RiEyeOffLine /> : <RiEyeLine />}
                            </span>
                        </div>



                        {/* تأكيد كلمة المرور */}
                        <div className="form-group with-icon">
                            <RiLock2Line className="field-icon" />

                            <input
                                type={showConfirmPass ? "text" : "password"}
                                placeholder='تاكيد كلمة المرور'
                                className='form-control'
                            />

                            <span className="show-pass" onClick={() => setShowConfirmPass(!showConfirmPass)}>
                                {showConfirmPass ? <RiEyeOffLine /> : <RiEyeLine />}
                            </span>
                        </div>

                        <div className="form-group with-icon">
                            <RiBuilding2Line className="field-icon" />
                            <input
                                type="text"
                                placeholder='اسم النشاط التجاري'
                                className='form-control'
                            />
                        </div>

                        <div className="form-group with-icon">
                            <RiFileList2Line className="field-icon" />
                            <input
                                type="text"
                                placeholder='رقم السجل التجاري'
                                className='form-control'
                            />
                        </div>

                        <div className="form-group">
                            <Select
                                options={options}
                                styles={customStyles}

                                placeholder="اختر المدينة"
                            />
                        </div>

                        <div className="form-group">
                            <button type='submit'>تسجيل حساب جديد</button>
                        </div>
                    </form>

                </div>
            </div>
        </>
    )
}

export default RegisterVendor