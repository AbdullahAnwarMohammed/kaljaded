import React, { useState, useEffect } from 'react';
import { FaUser, FaMapMarkerAlt, FaBuilding, FaHome, FaRoad, FaChartPie, FaLayerGroup } from 'react-icons/fa';
import { getCities, getAreas } from '../../api/locationApi';
import LocationPicker from './LocationPicker';
import { useTranslation } from 'react-i18next';

const AddressForm = ({ formData, handleChange, onNext, onLocationUpdate }) => {
    const { t, i18n } = useTranslation();
    const [cities, setCities] = useState([]);
    const [areas, setAreas] = useState([]);
    const [showMap, setShowMap] = useState(false);

    useEffect(() => {
        getCities().then(res => {
            if(res.data.success) {
                setCities(res.data.data);
            }
        }).catch(err => console.error("Error fetching cities", err));
    }, []);

    useEffect(() => {
        if (formData.city) {
             getAreas(formData.city).then(res => {
                if(res.data.success) {
                    setAreas(res.data.data);
                }
             }).catch(err => console.error("Error fetching areas", err));
        } else {
            setAreas([]);
        }
    }, [formData.city]);

    const handleCityChange = (e) => {
        handleChange(e);
        const selectedCity = cities.find(c => c.id == e.target.value);
        if (selectedCity) {
            handleChange({ target: { name: 'cityName', value: i18n.language === 'en' ? selectedCity.name_en : selectedCity.name_ar } });
        } else {
            handleChange({ target: { name: 'cityName', value: '' } });
        }
        handleChange({ target: { name: 'area', value: '' } });
        handleChange({ target: { name: 'areaName', value: '' } });
    };

    const handleAreaChange = (e) => {
        handleChange(e);
        const selectedArea = areas.find(a => a.id == e.target.value);
        if (selectedArea) {
            handleChange({ target: { name: 'areaName', value: i18n.language === 'en' ? selectedArea.name_en : selectedArea.name_ar } });
        } else {
            handleChange({ target: { name: 'areaName', value: '' } });
        }
    };

    return (
        <>
            <div className="form-card">
                <div className="form-group">
                    <div className="phone-input-group">
                        <div className="country-code">
                            <img src="https://flagcdn.com/w20/kw.png" alt="Kuwait" width="20" />
                            <span>+965</span>
                        </div>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="96555665455+"
                            className="text-right"
                            dir="ltr"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <div className="input-with-icon">
                         <FaUser className="input-icon" />
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder={t('username')}
                            className="form-control-custom"
                        />
                    </div>
                </div>

                    <div className="form-section-title">
                    {t('address_title')}
                </div>

                <div className="form-group">
                    <select 
                        name="city" 
                        value={formData.city} 
                        onChange={handleCityChange} 
                        className="form-control-custom"
                    >
                        <option value="">{t('city')}</option>
                        {cities.map(city => (
                            <option key={city.id} value={city.id}>
                                {i18n.language === 'en' ? city.name_en : city.name_ar}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <select 
                        name="area" 
                        value={formData.area} 
                        onChange={handleAreaChange} 
                        className="form-control-custom"
                        disabled={!formData.city}
                    >
                        <option value="">{t('area')}</option>
                        {areas.map(area => (
                            <option key={area.id} value={area.id}>
                                {i18n.language === 'en' ? area.name_en : area.name_ar}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <div className="input-with-icon">
                        <FaChartPie className="input-icon" />
                        <input
                            type="text"
                            name="block"
                            value={formData.block}
                            onChange={handleChange}
                            placeholder={t('block_placeholder')}
                            className="form-control-custom"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <div className="input-with-icon">
                        <FaRoad className="input-icon" />
                        <input
                            type="text"
                            name="street"
                            value={formData.street}
                            onChange={handleChange}
                            placeholder={t('street_placeholder')}
                            className="form-control-custom"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <div className="input-with-icon">
                        <FaBuilding className="input-icon" />
                        <input
                            type="text"
                            name="building"
                            value={formData.building}
                            onChange={handleChange}
                            placeholder={t('building_placeholder')}
                            className="form-control-custom"
                        />
                    </div>
                </div>

                <div className="row" style={{ display: 'flex', gap: '10px' }}>
                    <div className="form-group col-6" style={{ flex: 1 }}>
                        <div className="input-with-icon">
                            <FaLayerGroup className="input-icon" />
                            <input
                                type="text"
                                name="floor"
                                value={formData.floor}
                                onChange={handleChange}
                                placeholder={t('floor_placeholder')}
                                className="form-control-custom"
                            />
                        </div>
                    </div>
                    <div className="form-group col-6" style={{ flex: 1 }}>
                        <div className="input-with-icon">
                            <FaHome className="input-icon" />
                            <input
                                type="text"
                                name="apartment"
                                value={formData.apartment}
                                onChange={handleChange}
                                placeholder={t('apartment_placeholder')}
                                className="form-control-custom"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-group text-center ">
                    <button 
                        className="btn btn-link text-dark" 
                        style={{ textDecoration: 'none' }}
                        onClick={() => setShowMap(true)}
                    >
                        <FaMapMarkerAlt size={20} className="mx-2" />
                        {t('locate_me')}
                    </button>
                    {formData.latitude && formData.longitude && (
                        <div className="text-success small mt-1">
                            {t('location_selected')}
                        </div>
                    )}
                </div>

                   <button className="btn-next" onClick={onNext}>
                {t('next')}
            </button>
            </div>

         

            {showMap && (
                <LocationPicker 
                    isOpen={showMap} 
                    onClose={() => setShowMap(false)} 
                    initialLat={formData.latitude}
                    initialLng={formData.longitude}
                    onSelect={(location) => {
                        onLocationUpdate(location.lat, location.lng);
                    }}
                />
            )}
        </>
    );
};

export default AddressForm;
