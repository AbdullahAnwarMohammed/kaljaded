import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaChevronLeft, FaArrowRight } from 'react-icons/fa'; // Assuming RTL, arrow might need flip
import { BsCheckCircleFill } from 'react-icons/bs'; 
import Api from '../Services/Api';
import Swal from 'sweetalert2';
import './AddDevice.css';

const AddDevice = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const isRTL = i18n.language === 'ar';
    const [condition, setCondition] = useState('new'); // 'new', 'used'
    const [showUsedWarning, setShowUsedWarning] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    
    // Navigation State
    const [view, setView] = useState('main'); // 'main', 'category', 'brand', 'type', 'preview'
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    
    // Type Selection State
    const [types, setTypes] = useState([]);
    const [loadingTypes, setLoadingTypes] = useState(false);
    const [typeHistory, setTypeHistory] = useState([]); // Stack to track history for back navigation: [{ title: '...', data: [...] }]
    const [colorInput, setColorInput] = useState('');

    // Device Data State
    const [deviceNotes, setDeviceNotes] = useState('');
    const [gifts, setGifts] = useState('');
    const [serialNumber, setSerialNumber] = useState('');
    const [showScanner, setShowScanner] = useState(false);
    const scannerRef = useRef(null);

    // Device Test State
    const [deviceTests, setDeviceTests] = useState({
        box: null,
        usage: null,
        screen: null,
        body: null,
        battery: null,
        opened: null,
        sensors: null,
        wifi: null,
        bluetooth: null,
        gps: null,
        camera: null,
        buttons: null,
        speaker: null,
        fingerprint: null,
        condition: null
    });
    const [gameCondition, setGameCondition] = useState(null);
    const [activeTestItem, setActiveTestItem] = useState(null); // 'box', 'usage', etc.

    // Selected Data
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [selectedMemory, setSelectedMemory] = useState(null);
    const [typePath, setTypePath] = useState([]); // Store names of selected types/specs for display
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedImages, setSelectedImages] = useState([]); // Array of { id, file, url }
    // Device Data usually just inputs, maybe check if filled? For now let's assume it depends on images.

    useEffect(() => {
        if (showScanner) {
            const scanner = new Html5QrcodeScanner(
                'reader', 
                { 
                    fps: 10, 
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                    showTorchButtonIfSupported: true,
                    showZoomSliderIfSupported: true,
                },
                /* verbose= */ false
            );

            scanner.render((decodedText) => {
                setSerialNumber(decodedText);
                setShowScanner(false);
                scanner.clear();
            }, (error) => {
                // Ignore scanner errors
            });

            // Manual translation for library buttons
            const translateButtons = () => {
                const interval = setInterval(() => {
                    const permissionBtn = document.getElementById('html5-qrcode-button-camera-permission');
                    const fileSelectionBtn = document.getElementById('html5-qrcode-button-file-selection');
                    const stopBtn = document.getElementById('html5-qrcode-button-camera-stop');
                    const startBtn = document.getElementById('html5-qrcode-button-camera-start');

                    if (permissionBtn) permissionBtn.innerText = t('request_camera_permission') || 'السماح بالكاميرا';
                    if (fileSelectionBtn) fileSelectionBtn.innerText = t('scan_image_file') || 'مسح من صورة';
                    if (stopBtn) stopBtn.innerText = t('stop_scanning') || 'إيقاف المسح';
                    if (startBtn) startBtn.innerText = t('start_scanning') || 'بدء المسح';

                    if (permissionBtn || fileSelectionBtn) {
                        // Keep Running for a few more seconds to catch UI state changes
                    }
                }, 300);

                setTimeout(() => clearInterval(interval), 10000); // Stop looking after 10s
            };

            translateButtons();

            return () => {
                scanner.clear().catch(error => console.error("Failed to clear scanner", error));
            };
        }
    }, [showScanner]);

    const handleBack = () => {
        if (view === 'category' || view === 'brand') {
            setView('main');
        } else if (view === 'type') {
            if (typeHistory.length > 0) {
                // Go back up one level in type hierarchy
                const prev = typeHistory[typeHistory.length - 1];
                setTypes(prev.data);
                setTypeHistory(prevHistory => prevHistory.slice(0, -1));
                setTypePath(prevPath => prevPath.slice(0, -1)); // Remove last step from breadcrumb
            } else {
                setView('main');
                setTypePath([]); // Reset path when leaving type view entirely
            }
        } else if (view === 'color') {
            setView('main');
        } else if (view === 'images') {
            setView('main');
        } else if (view === 'device_data') {
            setView('main');
        } else if (view === 'device_test') {
            setView('main');
        } else if (view === 'test_detail') {
            setView('device_test');
            setActiveTestItem(null);
        } else if (view === 'preview') {
            setView('main');
        } else {
            navigate(-1);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const newImages = files.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file: file,
            url: URL.createObjectURL(file)
        }));

        setSelectedImages(prev => [...prev, ...newImages]);
    };

    const removeImage = (id) => {
        setSelectedImages(prev => {
            const filtered = prev.filter(img => img.id !== id);
            // Cleanup URLs to avoid memory leaks
            const removed = prev.find(img => img.id === id);
            if (removed) URL.revokeObjectURL(removed.url);
            return filtered;
        });
    };

    const fetchCategories = async () => {
        setLoadingCategories(true);
        try {
            const res = await Api.get("/categories", { cache: true });
            if (res.data.success) {
                setCategories(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoadingCategories(false);
        }
    };

    const fetchTypes = async (brandId) => {
        setLoadingTypes(true);
        // Clear history when starting fresh type fetch
        setTypeHistory([]); 
        try {
            const catIdParam = selectedCategory?.id ? `?category_id=${selectedCategory.id}` : '';
            const res = await Api.get(`/sub-sub-categories/${brandId}${catIdParam}`, { cache: true });
            if (res.data.success) {
                setTypes(res.data.data);
            } else {
                setTypes([]);
            }
        } catch (error) {
            console.error("Error fetching types:", error);
            setTypes([]);
        } finally {
            setLoadingTypes(false);
        }
    };

    const fetchSubTypes = async (parentId, parentName) => {
        setLoadingTypes(true);
        try {
            const res = await Api.get(`/sub-sub-categories/${parentId}/children`, { cache: true });
            if (res.data.success && res.data.data.length > 0) {
                // Push current state to history before updating
                setTypeHistory(prev => [...prev, { data: types }]);
                setTypes(res.data.data);
                return true; // Found children
            }
            return false; // No children
        } catch (error) {
            console.error("Error fetching sub-types:", error);
            return false;
        } finally {
            setLoadingTypes(false);
        }
    };

    const handleSubmit = () => {
        setView('preview');
        window.scrollTo(0, 0);
    };

    const finalSubmit = async () => {
        const result = await Swal.fire({
            title: 'تأكيد الإضافة',
            text: 'هل أنت متأكد من إضافة الجهاز للبيع كمزاد؟',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0e0f3a',
            cancelButtonColor: '#d33',
            confirmButtonText: 'نعم، أضف كـ مزاد',
            cancelButtonText: 'تراجع',
            reverseButtons: true
        });

        if (!result.isConfirmed) return;

        setIsSubmitting(true);
        const formData = new FormData();
        
        // Try to get user data from localStorage
        const customerData = localStorage.getItem('customer');
        let userId = localStorage.getItem('user_id');
        
        if (!userId && customerData) {
            try {
                const customer = JSON.parse(customerData);
                userId = customer.id;
            } catch (e) {
                console.error("Error parsing customer data", e);
            }
        }
        
        if (userId) formData.append('user_id', userId);

        const productName = `${selectedBrand?.name || ''} ${selectedType?.name || ''}`.trim() || t('product');
        formData.append('name', productName);
        formData.append('isactive', 1);
        formData.append('description', deviceNotes);
        formData.append('price', 0);
        formData.append('category_id', selectedCategory?.id || '');
        formData.append('sub_category_id', selectedBrand?.id || '');
        formData.append('sub_sub_category_id', selectedType?.id || '');
        formData.append('view', 0);
        formData.append('color', selectedColor?.name || '');
        formData.append('serialnumber', serialNumber);
        formData.append('memorysize', selectedMemory || '');
        formData.append('note', deviceNotes);
        formData.append('gift', gifts);
        formData.append('product_active_new', condition === 'new' ? 1 : 0);
        formData.append('fast_by', 0);

        if (condition === 'used') {
            formData.append('device_box', deviceTests.box?.id === 'available' ? '1' : '0');
            formData.append('device_usage', deviceTests.usage?.label || ''); 
            formData.append('device_opened', deviceTests.opened?.id === 'opened_maintenance' ? '1' : '0'); // Assuming 1 is opened
            formData.append('device_clean', deviceTests.screen?.label || ''); // Mapping screen to device_clean/display?
            formData.append('device_display', deviceTests.screen?.label || '');
            formData.append('device_body', deviceTests.body?.label || '');
            formData.append('device_battery', deviceTests.battery || '');
            formData.append('device_sensors', deviceTests.sensors?.id === 'working' ? '1' : '0');
            formData.append('device_wifi', deviceTests.wifi?.id === 'working' ? '1' : '0');
            formData.append('device_bluetooth', deviceTests.bluetooth?.id === 'working' ? '1' : '0');
            formData.append('device_gps', deviceTests.gps?.id === 'working' ? '1' : '0');
            formData.append('device_camera', deviceTests.camera?.id === 'working' ? '1' : '0');
            formData.append('device_button', deviceTests.buttons?.id === 'working' ? '1' : '0');
            formData.append('device_speaker', deviceTests.speaker?.id === 'working' ? '1' : '0'); 
            formData.append('device_fingerprint', deviceTests.fingerprint?.id === 'working' ? '1' : '0');
            formData.append('device_condition', deviceTests.condition?.label || '');
        }

        if (selectedImages && selectedImages.length > 0) {
            selectedImages.forEach((img) => {
                if (img.file) {
                    formData.append('images[]', img.file);
                }
            });
        }

        try {
            const res = await Api.post('/products-customer', formData);
            if (res.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: t('success_submit') || 'تم إضافة الجهاز بنجاح',
                    showConfirmButton: false,
                    timer: 1500
                });
                navigate('/request-product');
            }
        } catch (error) {
            console.error("Error submitting product:", error);
            Swal.fire({
                icon: 'error',
                title: t('error_submit') || 'حدث خطأ أثناء الإرسال',
                text: error.response?.data?.message
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMenuItemClick = (item) => {
        if (item.disabled) return;

        if (item.id === 'category') {
            setView('category');
            if (categories.length === 0) {
                fetchCategories();
            }
        } else if (item.id === 'brand') {
            setView('brand');
        } else if (item.id === 'type') {
            setView('type');
            if (types.length === 0 && selectedBrand) {
                fetchTypes(selectedBrand.id);
            }
            if (!selectedType) {
                setTypePath([]); // Restart path if no final type selected yet? 
                // Or just keep it. If they click 'type' again, they might want to start over.
            }
        } else if (item.id === 'color') {
            setView('color');
        } else if (item.id === 'images') {
            setView('images');
        } else if (item.id === 'device_test') {
            setView('device_test');
        } else if (item.id === 'game_condition') {
            setActiveTestItem('game_condition');
            setView('test_detail');
        } else if (item.id === 'device_data') {
            setView('device_data');
        } else {
            // Placeholder for other steps
             console.log(`Clicked ${item.id}`);
        }
    };
    
    const handleConditionChange = (newCondition) => {
        if (newCondition === 'used') {
            setShowUsedWarning(true);
        } else {
            setCondition('new');
        }
    };

    const isGamesCategory = () => {
        if (!selectedCategory) return false;
        const name = selectedCategory.name?.toLowerCase() || '';
        const slug = selectedCategory.slug?.toLowerCase() || '';
        // Check for both 'ألعاب' and 'العاب' to be safe
        return name.includes('ألعاب') || name.includes('العاب') || name.includes('video games') || name.includes('games') || slug.includes('all-products-games') || slug.includes('games');
    };

    const confirmUsedCondition = () => {
        if (isChecked) {
            setCondition('used');
            setShowUsedWarning(false);
            setIsChecked(false); 
        }
    };

    const cancelUsedCondition = () => {
        setShowUsedWarning(false);
        setIsChecked(false);
    };

    const confirmTypeSelection = (finalTypeObj, path, memoryValue = null) => {
        const fullLabel = path.join(' - ');
        setSelectedType({ ...finalTypeObj, name: fullLabel });
        setSelectedMemory(memoryValue);
        setSelectedColor(null);
        setSelectedImages([]);
        setView('main');
    };

    const fetchSubSubSubCategories = async (parentId) => {
        setLoadingTypes(true);
        try {
            const res = await Api.get(`/sub-sub-sub-categories/${parentId}`, { cache: true });
            if (res.data.success && res.data.data.length > 0) {
                 // Push current state to history
                 setTypeHistory(prev => [...prev, { data: types }]);
                 // Mark these as leaf nodes so they don't drill down further
                 setTypes(res.data.data.map(item => ({ ...item, isLeaf: true }))); 
                 return true;
            }
            return false;
        } catch (error) {
            console.error("Error fetching sub-sub-sub-categories:", error);
            return false;
        } finally {
            setLoadingTypes(false);
        }
    };

    const handleTypeSelect = async (typeObj) => {
        const newPath = [...typePath, typeObj.name];
        setTypePath(newPath);

        // 1. If it's already a leaf node (from sub-sub-sub-categories), select it
        if (typeObj.isLeaf) {
            confirmTypeSelection(typeObj, newPath, typeObj.name);
            return;
        }

        // 2. Check for recursive SubSubCategory children (Models/Sub-models)
        const hasChildren = await fetchSubTypes(typeObj.id, typeObj.name);
        if (hasChildren) return;

        // 3. If no children, check for SubSubSubCategories (Capacities/Specs)
        const hasSpecs = await fetchSubSubSubCategories(typeObj.id);
        if (hasSpecs) return;

        // 4. If neither, this is a leaf node. Select it.
        confirmTypeSelection(typeObj, newPath);
    };

    const getCategoryTestItems = () => {
        const catName = selectedCategory?.name?.toLowerCase() || '';
        const catSlug = selectedCategory?.slug?.toLowerCase() || '';

        // Helper to check category
        const is = (key) => catName.includes(key) || catSlug.includes(key);

        const common = [
            { id: 'box', label: t('box') || 'كارتون' },
            { id: 'usage', label: t('usage_duration') || 'مدة استخدام الجهاز' },
            { id: 'opened', label: t('maintenance_status') || 'حالة الجهاز مفتوح ام لا' },
            { id: 'cleanliness', label: t('cleanliness') || 'نظافة شاشة وجسم الجهاز' },
        ];

        // 1. Watches (الساعات)
        if (is('watch') || is('ساعة') || is('ساعات')) {
            return [
                { id: 'box', label: t('box') || 'كارتون' },
                { id: 'usage', label: t('usage_duration') || 'مدة استخدام الجهاز' },
                { id: 'cleanliness', label: t('cleanliness') || 'نظافة شاشة وجسم الجهاز' },
                { id: 'battery', label: t('battery_capacity') || 'قدرة البطارية' },
                { id: 'buttons', label: t('buttons') || 'الأزرار واللمس' },
                { id: 'sensors', label: t('sensors') || 'السنسرات' }
            ];
        }

        // 2. Accessories (اكسسوارات)
        if (is('accessory') || is('accessories') || is('access') || is('اكسسوار')) {
             return [
                 { id: 'box', label: t('box') || 'كارتون' },
                 { id: 'usage', label: t('usage_duration') || 'مدة استخدام الجهاز' },
                 { id: 'cleanliness', label: t('cleanliness') || 'نظافة شاشة وجسم الجهاز' }
             ];
        }

         // 3. Games (العاب) - If we use this view for games
        if (is('game') || is('ألعاب') || is('العاب')) {
             return [
                { id: 'box', label: t('box') || 'كارتون' },
                { id: 'condition', label: t('device_status') || 'حالة الجهاز' }
             ];
        }

        // 4. Default: Phones, Tablets (هواتف، تابلت)
        return [
            ...common,
            { id: 'battery', label: t('battery_capacity') || 'قدرة البطارية' },
            { id: 'wifi', label: t('wifi') || 'الواي فاي' },
            { id: 'bluetooth', label: t('bluetooth') || 'البلوتوث' },
            { id: 'gps', label: t('gps') || 'GPS' },
            { id: 'sensors', label: t('sensors') || 'السنسرات' },
            { id: 'camera', label: t('sensors_functions') || 'وظائف حساسات الكاميرا' },
            { id: 'buttons', label: t('power_button') || 'زر التشغيل-رفع/خفض الصوت' },
            { id: 'speaker', label: t('external_speaker') || 'السماعة الخارجية' },
            { id: 'fingerprint', label: t('fingerprints') || 'البصمات : بصمة الوجه' },
        ];
    };

    const menuItems = [
        { 
            id: 'category', 
            label: selectedCategory ? selectedCategory.name : (t('category') || 'الفئة'),
            disabled: false, // First step always active
            isCompleted: !!selectedCategory
        },
        { 
            id: 'brand', 
            label: selectedBrand ? selectedBrand.name : (t('brand') || 'الماركة'),
            disabled: !selectedCategory,
            isCompleted: !!selectedBrand
        },
        { 
            id: 'type', 
            label: selectedType ? selectedType.name : (t('type') || 'النوع'),
            disabled: !selectedBrand,
            isCompleted: !!selectedType
        },
        { 
            id: 'color', 
            label: selectedColor ? selectedColor.name : (t('color') || 'اللون'),
            disabled: !selectedType, // Assuming type must be picked first
             isCompleted: !!selectedColor
        },
        { 
            id: 'images', 
            label: (selectedImages && selectedImages.length > 0) ? (t('images_selected') || 'تم تحديد الصور') : (t('images') || 'الصور'),
            disabled: !selectedColor,
            isCompleted: (selectedImages && selectedImages.length > 0)
        },

        // Only show Device Test if Used
        ...(condition === 'used' ? [{
            id: 'device_test',
            label: t('device_test') || 'اختبار الجهاز',
            disabled: !(selectedImages && selectedImages.length > 0),
            isCompleted: getCategoryTestItems().every(item => {
                if (item.id === 'cleanliness') return deviceTests.screen && deviceTests.body;
                return deviceTests[item.id];
            })
        }] : []),
        { 
            id: 'device_data', 
            label: t('device_data') || 'بيانات الجهاز',
            disabled: condition === 'used' 
                ? !getCategoryTestItems().every(item => {
                    if (item.id === 'cleanliness') return deviceTests.screen && deviceTests.body;
                    return deviceTests[item.id];
                })
                : !(selectedImages && selectedImages.length > 0), 
            isCompleted: !!deviceNotes.trim()
        },
    ];

    const allStepsCompleted = menuItems.every(item => item.isCompleted);


    const testItemOptions = {
        box: [
            { id: 'not_available', label: t('no_box') || 'بدون كارتون' },
            { id: 'available', label: t('with_box') || 'مع كارتون' }
        ],
        usage: [
            { id: '1_3_days', label: t('1_to_3_days') || 'يوم الى 3 أيام' },
            { id: '4_10_days', label: t('4_to_10_days') || '4 أيام الى 10 أيام' },
            { id: '10d_1m', label: t('10d_to_1m') || 'أكثر من 10 أيام الى شهر' },
            { id: '1_3m', label: t('1_to_3m') || 'أكثر من شهر الى 3 أشهر' },
            { id: '3m_1y', label: t('3m_to_1y') || 'أكثر من 3 أشهر الى سنة' },
            { id: '3m_1y', label: t('3m_to_1y') || 'أكثر من 3 أشهر الى سنة' },
            { id: 'more_1y', label: t('more_than_year') || 'أكثر من سنة' }
        ],
        opened: [
            { id: 'not_opened', label: t('not_opened') || 'غير مفتوح / لم يدخل صيانة' },
            { id: 'opened_maintenance', label: t('opened_maintenance') || 'مفتوح / صيانة' }
        ],
        wifi: [
            { id: 'working', label: t('working') || 'تعمل' },
            { id: 'not_working', label: t('not_working') || 'لا تعمل' }
        ],
        sensors: [
            { id: 'working', label: t('working') || 'تعمل' },
            { id: 'not_working', label: t('not_working') || 'لا تعمل' }
        ],
        bluetooth: [
            { id: 'working', label: t('working') || 'تعمل' },
            { id: 'not_working', label: t('not_working') || 'لا تعمل' }
        ],
        gps: [
            { id: 'working', label: t('working') || 'تعمل' },
            { id: 'not_working', label: t('not_working') || 'لا تعمل' }
        ],
        camera: [
            { id: 'working', label: t('working') || 'تعمل' },
            { id: 'not_working', label: t('not_working') || 'لا تعمل' }
        ],
        buttons: [
            { id: 'working', label: t('working') || 'تعمل' },
            { id: 'not_working', label: t('not_working') || 'لا تعمل' }
        ],
        speaker: [
            { id: 'working', label: t('working') || 'تعمل' },
            { id: 'not_working', label: t('not_working') || 'لا تعمل' }
        ],
        fingerprint: [
            { id: 'working', label: t('working') || 'تعمل' },
            { id: 'not_working', label: t('not_working') || 'لا تعمل' }
        ],
        cleanliness: {
            screen: [
                { id: 'no_scratches', label: t('no_scratches') || 'لا توجد أى خدوش' },
                { id: 'minor_scratches', label: t('minor_scratches') || 'خدوش بسيطة غير ظاهرة' }
            ],
            body: [
                { id: 'no_scratches', label: t('no_scratches') || 'لا توجد أى خدوش' },
                { id: 'minor_scratches', label: t('minor_scratches') || 'خدوش بسيطة غير ظاهرة' }
            ]
        },
        battery: [
            { id: '100', label: '100%' },
            { id: '95_99', label: '95% - 99%' },
            { id: '90_94', label: '90% - 94%' },
            { id: 'less_90', label: t('less_than_90') || 'أقل من 90%' }
        ],
        condition: [
            { id: 'like_new', label: t('like_new') || 'كالجديد' },
            { id: 'excellent', label: t('excellent') || 'ممتاز' },
            { id: 'very_good', label: t('very_good') || 'جيد جداً' },
            { id: 'good', label: t('good') || 'جيد' }
        ]
    };

    const renderCategoryView = () => (
        <div className="category-selection-view">
            {loadingCategories ? (
                <div className="loading-spinner-container">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <div className="category-list">
                    {Array.isArray(categories) && categories.map((cat) => (
                        <div key={cat.id} className="category-card" onClick={() => {
                            setSelectedCategory(cat);
                            setSelectedBrand(null); // Reset subsequent steps
                            setSelectedType(null);
                            setSelectedColor(null);
                            setSelectedImages([]); // Reset to empty array
                            setTypes([]); // Clear types
                            setView('main');
                        }}>
                             <span className="category-name">{cat.name}</span>
                             <div className="category-image-wrapper">
                                <img 
                                    src={cat.image} 
                                    alt={cat.name} 
                                    className="category-img" 
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/placeholder-device.png';
                                    }}
                                />
                             </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderBrandView = () => (
        <div className="category-selection-view">
             <div className="category-list">
                {selectedCategory?.subcategories && selectedCategory.subcategories.length > 0 ? (
                    selectedCategory.subcategories.map((brand) => (
                        <div key={brand.id} className="category-card" onClick={() => {
                            console.log("Selected Brand ID:", brand.id);
                            setSelectedBrand(brand);
                            setSelectedType(null); // Reset subsequent
                            setSelectedColor(null);
                            setSelectedImages([]); // Reset to empty array
                            setTypes([]); // Clear possible old types
                            // Fetch types immediately or just let click handler do it? 
                            // Better to just clear and let next step fetch.
                            setView('main');
                        }}>
                             <span className="category-name">{brand.name}</span>
                             <div className="category-image-wrapper">
                                <img 
                                    src={brand.image} 
                                    alt={brand.name} 
                                    className="category-img" 
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/placeholder-device.png';
                                    }}
                                />
                             </div>
                        </div>
                    ))
                ) : (
                    <div className="no-data-message">
                        {t('no_brands_found') || 'لا توجد ماركات متاحة لهذه الفئة'}
                    </div>
                )}
            </div>
        </div>
    );

    const renderTypeView = () => (
         <div className="category-selection-view">
            {loadingTypes ? (
                <div className="loading-spinner-container">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">{t('loading') || 'Loading...'}</span>
                    </div>
                </div>
            ) : (
                <div className="category-list">
                    {types && types.length > 0 ? (
                        types.map((typeObj) => (
                            <div key={typeObj.id} className="category-card text-only" onClick={() => handleTypeSelect(typeObj)}>
                                 <span className="category-name">{typeObj.name}</span>
                            </div>
                        ))
                    ) : (
                        <div className="no-data-message">
                             {t('no_types_found') || 'لا توجد أنواع متاحة لهذه الماركة'}
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    const renderColorView = () => (
        <div className="color-selection-view">
            <div className="color-input-container">
                <input 
                    type="text" 
                    className="color-text-input"
                    placeholder={t('enter_color') || 'اللون مثل (اسود)'}
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    autoFocus
                />
            </div>
            
            <button 
                className={`btn-confirm-color ${colorInput.trim() ? 'active' : 'disabled'}`}
                disabled={!colorInput.trim()}
                onClick={() => {
                    setSelectedColor({ name: colorInput.trim() });
                    setView('main');
                }}
            >
                {t('next') || 'التالي'}
            </button>
        </div>
    );

    const renderImagesView = () => (
        <div className="images-selection-view">
            <div className="upload-main-container">
                <label htmlFor="device-image-input" className="upload-card">
                    <div className="upload-icon-container">
                        <div className="icon-plus-box">
                            <span className="plus-sign">+</span>
                        </div>
                        <div className="icon-camera-mini">
                            <div className="camera-body">
                                <div className="camera-lens"></div>
                            </div>
                            <div className="camera-top"></div>
                        </div>
                    </div>
                    <span className="upload-label">{t('images') || 'الصور'}</span>
                </label>
                <input 
                    id="device-image-input"
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                />
            </div>

            <div className="images-preview-grid">
                {Array.isArray(selectedImages) && selectedImages.map((img) => (
                    <div key={img.id} className="preview-item">
                        <img src={img.url} alt="preview" className="preview-img" />
                        <button className="btn-remove-img" onClick={() => removeImage(img.id)}>
                            <div className="remove-icon-box">
                                <span className="remove-x">×</span>
                            </div>
                        </button>
                    </div>
                ))}
            </div>

            <button 
                className={`btn-confirm-images ${selectedImages.length > 0 ? 'active' : 'disabled'}`}
                disabled={selectedImages.length === 0}
                onClick={() => setView('main')}
            >
                {t('next') || 'التالي'}
            </button>
        </div>
    );

    const renderDeviceDataView = () => (
        <div className="device-data-view">
            {/* Read-only title */}
             <div className="readonly-device-type">
                {selectedType ? selectedType.name : (t('not_selected') || 'لم يتم الاختيار')}
            </div>

            <div className="form-group">
                <label className="input-label-header">{t('device_notes_rec') || 'ملاحظات الجهاز (موصى به)'}</label>
                <span className="input-hint">{t('notes_hint') || 'مثلا: الجهاز نظيف جدا - شبه الجديد - 10 دورات شحن فقط'}</span>
                <textarea 
                    className="device-textarea"
                    placeholder={t('device_notes') || 'ملاحظات الجهاز'}
                    value={deviceNotes}
                    onChange={(e) => setDeviceNotes(e.target.value)}
                />
            </div>

            <div className="form-group">
                <span className="input-hint">{t('gifts_hint') || 'مثلا: كفر + ستكر'}</span>
                <textarea 
                    className="device-textarea"
                    placeholder={t('with_gift') || 'مع هدية'}
                    value={gifts}
                    onChange={(e) => setGifts(e.target.value)}
                />
            </div>




            <div className="serial-input-container">
            <div 
                className={`barcode-icon ${showScanner ? 'active' : ''}`}
                onClick={() => setShowScanner(!showScanner)}
                style={{ cursor: 'pointer' }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
            </div>
            <input 
                type="text"
                className="serial-input"
                placeholder={t('device_serial') || 'سيريال الجهاز'}
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
            />
        </div>

        {showScanner && (
            <div className="scanner-container-wrapper">
                <div className="scanner-header">
                    <span>{t('scan_serial') || 'مسح السيريال'}</span>
                    <button onClick={() => setShowScanner(false)}>×</button>
                </div>
                <div id="reader" style={{ width: '100%' }}></div>
                <p className="scanner-hint">{t('scan_hint') || 'وجه الكاميرا نحو السيريال أو اختر صورة'}</p>
            </div>
        )}

            <button 
                className={`btn-confirm-data ${deviceNotes.trim() ? 'active' : 'disabled'}`}
                disabled={!deviceNotes.trim()}
                onClick={() => setView('main')}
            >
                {t('confirm') || 'تأكيد'}
            </button>
        </div>
    );



    const renderPreviewView = () => {
        const productName = `${selectedBrand?.name || ''} ${selectedType?.name || ''}`.trim() || t('product');
        
        return (
            <div className="device-preview-view">
                <div className="preview-image-section">
                    <img 
                        src={selectedImages[0]?.url || '/placeholder-device.png'} 
                        alt="Product Preview" 
                        className="main-preview-image"
                    />
                    <div className="preview-badge-new">{condition === 'new' ? 'جديد' : 'مستعمل'}</div>
                   
                </div>

                <div className="preview-details-container">
                    <h2 className="preview-product-name">{productName}</h2>
                    
                    <div className="preview-specs-chips">
                        <div className="spec-chip">
                            <span>{selectedColor?.name || 'غير محدد'}</span>
                        </div>
                        {selectedMemory && (
                            <div className="spec-chip">
                                <span>{selectedMemory}</span>
                            </div>
                        )}
                        <div className="spec-chip">
                            <span>{condition === 'new' ? t('new') : 'مع كرتون'}</span>
                        </div>
                    </div>

                    <div className="preview-inspector-notes">
                        <h4 className="notes-header-title">{t('inspector_notes') || 'تعليق الفاحص'}</h4>
                        <div className="notes-content-box">
                            <p>{deviceNotes || t('no_notes')}</p>
                        </div>
                    </div>

                    {gifts && (
                        <div className="preview-inspector-notes" style={{marginTop: '15px'}}>
                            <h4 className="notes-header-title">{t('gifts') || 'الهدايا وملحقات إضافية'}</h4>
                            <div className="notes-content-box" >
                                <p>{gifts}</p>
                            </div>
                        </div>
                    )}

                    <div className="preview-action-footer">
                        <button 
                            className="btn-final-confirm" 
                            onClick={finalSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (t('submitting') || 'جاري الإضافة...') : (t('confirm_add_device') || 'إضافة الجهاز')}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderDeviceTestView = () => (
        <div className="device-test-view">
            <div className="device-menu-list">
                {getCategoryTestItems().map((item) => {
                    const isCompleted = item.id === 'cleanliness' 
                        ? (deviceTests.screen !== null && deviceTests.body !== null)
                        : deviceTests[item.id] !== null;

                    return (
                        <div 
                            key={item.id} 
                            className={`device-menu-item test-item ${isCompleted ? 'completed' : ''}`}
                            onClick={() => {
                                setActiveTestItem(item.id);
                                setView('test_detail');
                            }}
                        >
                            <FaChevronLeft className="item-arrow" size={16} /> 
                            <span className="item-label">{item.label}</span>
                            <div className={`test-status-circle ${isCompleted ? 'active' : ''}`}>
                                 {isCompleted && <div className="inner-dot" />}
                            </div>
                        </div>
                    );
                })}
            </div>

            <button 
                className={`btn-confirm-test ${getCategoryTestItems().every(item => {
                    if (item.id === 'cleanliness') return deviceTests.screen && deviceTests.body;
                    return deviceTests[item.id] !== null;
                }) ? 'active' : 'disabled'}`}
                disabled={!getCategoryTestItems().every(item => {
                    if (item.id === 'cleanliness') return deviceTests.screen && deviceTests.body;
                    return deviceTests[item.id] !== null;
                })}
                onClick={() => setView('main')}
            >
                {t('next') || 'التالي'}
            </button>
        </div>
    );

    const renderTestDetailView = () => {
        console.log('Active Test Item:', activeTestItem);
        console.log('Options Condition:', testItemOptions?.condition);
        
        if (activeTestItem === 'condition') {
            const options = Array.isArray(testItemOptions?.condition) ? testItemOptions.condition : [];
            return (
                <div className="test-detail-view">
                    <h4 className="detail-title">{t('device_status') || 'حالة الجهاز'}</h4>
                    <div className="options-list">
                        {options.map((opt, index) => (
                            <div 
                                key={opt.id} 
                                className={`option-card numbered ${deviceTests.condition?.id === opt.id ? 'selected' : ''}`}
                                onClick={() => {
                                    setDeviceTests(prev => ({ ...prev, condition: opt }));
                                    setView('device_test');
                                    setActiveTestItem(null);
                                }}
                            >
                                <span className="option-label">{opt.label}</span>
                                <div className="option-index-circle">
                                    {index + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        if (activeTestItem === 'cleanliness') {
            return (
                <div className="test-detail-view cleanliness-grid">
                    <h4 className="detail-title">{t('cleanliness_screen') || 'نظافة شاشة الجهاز'}</h4>
                    <div className="options-list">
                        {testItemOptions.cleanliness.screen.map((opt, index) => (
                            <div 
                                key={opt.id} 
                                className={`option-card numbered ${deviceTests.screen?.id === opt.id ? 'selected' : ''}`}
                                onClick={() => setDeviceTests(prev => ({ ...prev, screen: opt }))}
                            >
                                <span className="option-label">{opt.label}</span>
                                <div className="option-index-circle">{index + 1}</div>
                            </div>
                        ))}
                    </div>

                    <h4 className="detail-title" style={{ marginTop: '40px' }}>{t('cleanliness_body') || 'جسم الجهاز'}</h4>
                    <div className="options-list">
                        {testItemOptions.cleanliness.body.map((opt, index) => (
                            <div 
                                key={opt.id} 
                                className={`option-card numbered ${deviceTests.body?.id === opt.id ? 'selected' : ''}`}
                                onClick={() => setDeviceTests(prev => ({ ...prev, body: opt }))}
                            >
                                <span className="option-label">{opt.label}</span>
                                <div className="option-index-circle">{index + 1}</div>
                            </div>
                        ))}
                    </div>

                    <button 
                        className={`btn-confirm-test ${deviceTests.screen && deviceTests.body ? 'active' : 'disabled'}`}
                        style={{ marginTop: '40px' }}
                        disabled={!(deviceTests.screen && deviceTests.body)}
                        onClick={() => {
                            setView('device_test');
                            setActiveTestItem(null);
                        }}
                    >
                        {t('confirm') || 'تأكيد'}
                    </button>
                </div>
            );
        }

        if (activeTestItem === 'battery') {
            return (
                <div className="test-detail-view battery-input-view">
                    <h4 className="detail-title">{t('battery_capacity') || 'قدرة البطارية'}</h4>
                    <div className="battery-input-container">
                        <label className="battery-input-subtitle">{t('battery_consumption_rate') || 'البطارية ونسبة الاستهلاك'}</label>
                        <input 
                            type="number"
                            className="battery-percentage-input"
                            placeholder="80"
                            value={deviceTests.battery || ''}
                            onChange={(e) => setDeviceTests(prev => ({ ...prev, battery: e.target.value }))}
                        />
                    </div>

                    <button 
                        className={`btn-confirm-test ${deviceTests.battery ? 'active' : 'disabled'}`}
                        style={{ marginTop: 'auto', marginBottom: '40px' }}
                        disabled={!deviceTests.battery}
                        onClick={() => {
                            setView('device_test');
                            setActiveTestItem(null);
                        }}
                    >
                        {t('next') || 'التالي'}
                    </button>
                </div>
            );
        }

        const options = testItemOptions[activeTestItem] || [];
        const activeItemObj = getCategoryTestItems().find(i => i.id === activeTestItem);
        const currentTitle = activeItemObj ? activeItemObj.label : (t('device_test') || 'اختبار الجهاز');

        return (
            <div className="test-detail-view">
                <h4 className="detail-title">{currentTitle}</h4>
                <div className="options-list">
                    {options.map((opt, index) => (
                        <div 
                            key={opt.id} 
                            className={`option-card numbered ${deviceTests[activeTestItem]?.id === opt.id ? 'selected' : ''}`}
                            onClick={() => {
                                setDeviceTests(prev => ({ ...prev, [activeTestItem]: opt }));
                                setView('device_test');
                                setActiveTestItem(null);
                            }}
                        >
                            <span className="option-label">{opt.label}</span>
                            <div className="option-index-circle">
                                {index + 1}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="add-device-wrapper">
            {/* Warning Modal */}
            {showUsedWarning && (
                <div className="warning-modal-overlay">
                    <div className="warning-modal-content">
                        {/* Warning Icon */}
                        <div className="warning-icon-container">
                            <span className="warning-triangle">⚠️</span>
                        </div>
                        
                        <h4 className="warning-title">{t('used_warning_title') || 'تنبيه قبل إضافة منتج مستعمل'}</h4>
                        
                        <div className="warning-box">
                            <p className="warning-text">
                                {t('used_warning_text_1') || 'نحن نهتم بثقة العملاء، لذا لا نعرض أي جهاز تم فتحه من قبل أو تم إصلاح أو تغيير أي قطعة فيه.'}
                            </p>
                            <p className="warning-text-highlight">
                                {t('used_warning_text_2') || 'إذا كان لديك أي شك في حالة الجهاز، من الأفضل التراجع قبل الإضافة.'}
                            </p>
                        </div>

                        <div className="warning-checkbox-container" onClick={() => setIsChecked(!isChecked)}>
                            <div className={`custom-checkbox ${isChecked ? 'checked' : ''}`}>
                                {isChecked && <BsCheckCircleFill color="#435292" size={14} />} 
                                {/* Using CheckCircle as simpler logic, or standard box */}
                            </div>
                            <span className="checkbox-label">{t('confirm_unopened') || 'أأكد أن الجهاز غير مفتوح ولم يتم اصلاح أي جزء فيه.'}</span>
                        </div>

                        <p className="warning-note">
                            {t('agree_conditions_note') || '(بالضغط على التالي فإنك توافق على الشروط أعلاه)'}
                        </p>

                        <button 
                            className={`btn-next ${isChecked ? 'active' : 'disabled'}`} 
                            onClick={confirmUsedCondition}
                            disabled={!isChecked}
                        >
                            {t('next') || 'التالي'}
                        </button>

                        <button className="btn-retreat" onClick={cancelUsedCondition}>
                            {t('retreat_not_sure') || 'تراجع لست متأكد من حالة الجهاز'}
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="add-device-header">
                <button onClick={handleBack} className="header-back-btn">
                     <FaArrowRight size={20} />
                </button>
                <h3>
                    {view === 'category' ? (t('category') || 'الفئة') : 
                     view === 'brand' ? (t('brand') || 'الماركة') : 
                     view === 'type' ? (t('type') || 'النوع') :
                     view === 'color' ? (t('color') || 'اللون') :
                     view === 'images' ? (t('images') || 'الصور') :
                     view === 'device_test' ? (t('device_test') || 'اختبار الجهاز') :
                     view === 'device_data' ? (t('device_data') || 'بيانات الجهاز') :
                     view === 'preview' ? (t('preview') || 'معاينة الجهاز') :
                     (t('add_device') || 'اضافة جهاز')}
                </h3>
                <div style={{ width: 24 }}></div> {/* Spacer for centering */}
            </div>
            
            {view === 'main' ? (
                <>
                    {/* Condition Toggle */}
                    <div className="condition-toggle-container">
                        <div 
                            className={`condition-option ${condition === 'used' ? 'active' : ''}`}
                            onClick={() => handleConditionChange('used')}
                        >
                            <span className="radio-circle">{condition === 'used' && <span className="inner-circle"/>}</span>
                            <span>{t('used') || 'مستعمل'}</span>
                        </div>
                        <div 
                            className={`condition-option ${condition === 'new' ? 'active' : ''}`}
                            onClick={() => handleConditionChange('new')}
                        >
                            <span className="radio-circle">{condition === 'new' && <span className="inner-circle"/>}</span>
                            <span>{t('new') || 'جديد'}</span>
                        </div>
                    </div>

                    {/* Menu List */}
                    <div className="device-menu-list">
                        {menuItems.map((item) => (
                            <div 
                                key={item.id} 
                                className={`device-menu-item ${item.disabled ? 'disabled' : ''} ${item.isCompleted ? 'completed' : ''}`}
                                onClick={() => handleMenuItemClick(item)}
                            >
                                <FaChevronLeft className="item-arrow" size={16} /> 
                                <span className="item-label">{item.label}</span>
                                <div className={`item-status-icon ${item.isCompleted ? 'active' : ''}`}>
                                    {item.isCompleted && <BsCheckCircleFill color="#435292" size={24} />}
                                </div> 
                            </div>
                        ))}
                    </div>

                    {/* Final Submit Button */}
                    <div style={{ padding: '0 20px', marginTop: '30px', marginBottom: '40px' }}>
                        <button 
                            className={`btn-confirm-data ${allStepsCompleted ? 'active' : 'disabled'}`}
                            disabled={!allStepsCompleted}
                            onClick={handleSubmit}
                            style={{ 
                                width: '100%', 
                                padding: '15px', 
                                borderRadius: '15px', 
                                border: 'none', 
                                fontWeight: 'bold', 
                                fontSize: '1.2rem',
                                boxShadow: allStepsCompleted ? '0 4px 15px rgba(67, 82, 146, 0.4)' : 'none'
                             }}
                        >
                            {t('next') || 'التالي'}
                        </button>
                    </div>
                </>
            ) : view === 'category' ? (
                renderCategoryView()
            ) : view === 'brand' ? (
                renderBrandView()
            ) : view === 'type' ? (
                renderTypeView()
            ) : view === 'color' ? (
                renderColorView()
            ) : view === 'images' ? (
                renderImagesView()
            ) : view === 'device_test' ? (
                renderDeviceTestView()
            ) : view === 'test_detail' ? (
                renderTestDetailView()
            ) : view === 'preview' ? (
                renderPreviewView()
            ) : (
                renderDeviceDataView()
            )}
        </div>
    );
};

export default AddDevice;
