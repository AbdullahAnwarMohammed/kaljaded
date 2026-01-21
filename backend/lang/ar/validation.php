<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Validation Language Lines (Arabic)
    |--------------------------------------------------------------------------
    */

    'accepted' => 'يجب قبول حقل :attribute.',
    'accepted_if' => 'يجب قبول حقل :attribute عندما يكون :other يساوي :value.',
    'active_url' => 'حقل :attribute يجب أن يكون رابطًا صالحًا.',
    'after' => 'حقل :attribute يجب أن يكون تاريخًا بعد :date.',
    'after_or_equal' => 'حقل :attribute يجب أن يكون تاريخًا بعد أو يساوي :date.',
    'alpha' => 'حقل :attribute يجب أن يحتوي على حروف فقط.',
    'alpha_dash' => 'حقل :attribute يجب أن يحتوي فقط على حروف، أرقام، شرطات وشرطات سفلية.',
    'alpha_num' => 'حقل :attribute يجب أن يحتوي فقط على حروف وأرقام.',
    'any_of' => 'حقل :attribute غير صالح.',
    'array' => 'حقل :attribute يجب أن يكون مصفوفة.',
    'ascii' => 'حقل :attribute يجب أن يحتوي فقط على أحرف أبجدية رقمية ورموز أحادية البايت.',
    'before' => 'حقل :attribute يجب أن يكون تاريخًا قبل :date.',
    'before_or_equal' => 'حقل :attribute يجب أن يكون تاريخًا قبل أو يساوي :date.',
    'between' => [
        'array' => 'حقل :attribute يجب أن يحتوي على عدد عناصر بين :min و :max.',
        'file' => 'حجم ملف :attribute يجب أن يكون بين :min و :max كيلوبايت.',
        'numeric' => 'حقل :attribute يجب أن يكون بين :min و :max.',
        'string' => 'حقل :attribute يجب أن يكون بين :min و :max حروف.',
    ],
    'boolean' => 'حقل :attribute يجب أن يكون صحيح أو خطأ.',
    'can' => 'حقل :attribute يحتوي على قيمة غير مسموح بها.',
    'confirmed' => 'تأكيد حقل :attribute غير متطابق.',
    'contains' => 'حقل :attribute يفتقد لقيمة مطلوبة.',
    'current_password' => 'كلمة المرور غير صحيحة.',
    'date' => 'حقل :attribute يجب أن يكون تاريخًا صالحًا.',
    'date_equals' => 'حقل :attribute يجب أن يكون تاريخًا مساويًا لـ :date.',
    'date_format' => 'حقل :attribute لا يطابق التنسيق :format.',
    'decimal' => 'حقل :attribute يجب أن يحتوي على :decimal منازل عشرية.',
    'declined' => 'حقل :attribute يجب رفضه.',
    'declined_if' => 'حقل :attribute يجب رفضه عندما يكون :other يساوي :value.',
    'different' => 'حقل :attribute و :other يجب أن يكونا مختلفين.',
    'digits' => 'حقل :attribute يجب أن يتكون من :digits أرقام.',
    'digits_between' => 'حقل :attribute يجب أن يكون بين :min و :max أرقام.',
    'dimensions' => 'أبعاد الصورة في حقل :attribute غير صالحة.',
    'distinct' => 'حقل :attribute يحتوي على قيمة مكررة.',
    'doesnt_contain' => 'حقل :attribute يجب ألا يحتوي على أي من القيم التالية: :values.',
    'doesnt_end_with' => 'حقل :attribute يجب ألا ينتهي بأحد القيم التالية: :values.',
    'doesnt_start_with' => 'حقل :attribute يجب ألا يبدأ بأحد القيم التالية: :values.',
    'email' => 'حقل :attribute يجب أن يكون بريدًا إلكترونيًا صالحًا.',
    'ends_with' => 'حقل :attribute يجب أن ينتهي بأحد القيم التالية: :values.',
    'enum' => 'القيمة المحددة في :attribute غير صالحة.',
    'exists' => 'القيمة المحددة في :attribute غير صالحة.',
    'extensions' => 'حقل :attribute يجب أن يكون له أحد الامتدادات التالية: :values.',
    'file' => 'حقل :attribute يجب أن يكون ملفًا.',
    'filled' => 'حقل :attribute يجب أن يحتوي على قيمة.',
    'gt' => [
        'array' => 'حقل :attribute يجب أن يحتوي على أكثر من :value عناصر.',
        'file' => 'حقل :attribute يجب أن يكون أكبر من :value كيلوبايت.',
        'numeric' => 'حقل :attribute يجب أن يكون أكبر من :value.',
        'string' => 'حقل :attribute يجب أن يكون أكبر من :value حروف.',
    ],
    'gte' => [
        'array' => 'حقل :attribute يجب أن يحتوي على :value عناصر أو أكثر.',
        'file' => 'حقل :attribute يجب أن يكون أكبر من أو يساوي :value كيلوبايت.',
        'numeric' => 'حقل :attribute يجب أن يكون أكبر من أو يساوي :value.',
        'string' => 'حقل :attribute يجب أن يكون أكبر من أو يساوي :value حروف.',
    ],
    'hex_color' => 'حقل :attribute يجب أن يكون لونًا سداسيًا صالحًا.',
    'image' => 'حقل :attribute يجب أن يكون صورة.',
    'in' => 'القيمة المحددة في :attribute غير صالحة.',
    'in_array' => 'حقل :attribute يجب أن يوجد في :other.',
    'in_array_keys' => 'حقل :attribute يجب أن يحتوي على مفتاح واحد على الأقل من: :values.',
    'integer' => 'حقل :attribute يجب أن يكون عددًا صحيحًا.',
    'ip' => 'حقل :attribute يجب أن يكون عنوان IP صالحًا.',
    'ipv4' => 'حقل :attribute يجب أن يكون عنوان IPv4 صالحًا.',
    'ipv6' => 'حقل :attribute يجب أن يكون عنوان IPv6 صالحًا.',
    'json' => 'حقل :attribute يجب أن يكون نص JSON صالح.',
    'list' => 'حقل :attribute يجب أن يكون قائمة.',
    'lowercase' => 'حقل :attribute يجب أن يكون بأحرف صغيرة.',
    'lt' => [
        'array' => 'حقل :attribute يجب أن يحتوي على أقل من :value عناصر.',
        'file' => 'حقل :attribute يجب أن يكون أقل من :value كيلوبايت.',
        'numeric' => 'حقل :attribute يجب أن يكون أقل من :value.',
        'string' => 'حقل :attribute يجب أن يكون أقل من :value حروف.',
    ],
    'lte' => [
        'array' => 'حقل :attribute يجب ألا يحتوي على أكثر من :value عناصر.',
        'file' => 'حقل :attribute يجب أن يكون أقل من أو يساوي :value كيلوبايت.',
        'numeric' => 'حقل :attribute يجب أن يكون أقل من أو يساوي :value.',
        'string' => 'حقل :attribute يجب أن يكون أقل من أو يساوي :value حروف.',
    ],
    'mac_address' => 'حقل :attribute يجب أن يكون عنوان MAC صالح.',
    'max' => [
        'array' => 'حقل :attribute يجب ألا يحتوي على أكثر من :max عناصر.',
        'file' => 'حقل :attribute يجب ألا يكون أكبر من :max كيلوبايت.',
        'numeric' => 'حقل :attribute يجب ألا يكون أكبر من :max.',
        'string' => 'حقل :attribute يجب ألا يكون أكبر من :max حروف.',
    ],
    'max_digits' => 'حقل :attribute يجب ألا يحتوي على أكثر من :max أرقام.',
    'mimes' => 'حقل :attribute يجب أن يكون ملفًا من النوع: :values.',
    'mimetypes' => 'حقل :attribute يجب أن يكون ملفًا من النوع: :values.',
    'min' => [
        'array' => 'حقل :attribute يجب أن يحتوي على الأقل :min عناصر.',
        'file' => 'حقل :attribute يجب ألا يقل عن :min كيلوبايت.',
        'numeric' => 'حقل :attribute يجب ألا يقل عن :min.',
        'string' => 'حقل :attribute يجب ألا يقل عن :min حروف.',
    ],
    'min_digits' => 'حقل :attribute يجب أن يحتوي على الأقل :min أرقام.',
    'missing' => 'حقل :attribute يجب أن يكون مفقودًا.',
    'missing_if' => 'حقل :attribute يجب أن يكون مفقودًا عندما يكون :other يساوي :value.',
    'missing_unless' => 'حقل :attribute يجب أن يكون مفقودًا إلا إذا كان :other يساوي :value.',
    'missing_with' => 'حقل :attribute يجب أن يكون مفقودًا عندما يكون :values موجودًا.',
    'missing_with_all' => 'حقل :attribute يجب أن يكون مفقودًا عندما تكون :values موجودة.',
    'multiple_of' => 'حقل :attribute يجب أن يكون من مضاعفات :value.',
    'not_in' => 'القيمة المحددة في :attribute غير صالحة.',
    'not_regex' => 'تنسيق :attribute غير صالح.',
    'numeric' => 'حقل :attribute يجب أن يكون رقمًا.',
    'password' => [
        'letters' => 'حقل :attribute يجب أن يحتوي على حرف واحد على الأقل.',
        'mixed' => 'حقل :attribute يجب أن يحتوي على حرف كبير وحرف صغير على الأقل.',
        'numbers' => 'حقل :attribute يجب أن يحتوي على رقم واحد على الأقل.',
        'symbols' => 'حقل :attribute يجب أن يحتوي على رمز واحد على الأقل.',
        'uncompromised' => 'تم العثور على :attribute في تسريب بيانات. يرجى اختيار قيمة مختلفة.',
    ],
    'present' => 'حقل :attribute يجب أن يكون موجودًا.',
    'present_if' => 'حقل :attribute يجب أن يكون موجودًا عندما يكون :other يساوي :value.',
    'present_unless' => 'حقل :attribute يجب أن يكون موجودًا إلا إذا كان :other يساوي :value.',
    'present_with' => 'حقل :attribute يجب أن يكون موجودًا عندما يكون :values موجودًا.',
    'present_with_all' => 'حقل :attribute يجب أن يكون موجودًا عندما تكون :values موجودة.',
    'prohibited' => 'حقل :attribute محظور.',
    'prohibited_if' => 'حقل :attribute محظور عندما يكون :other يساوي :value.',
    'prohibited_if_accepted' => 'حقل :attribute محظور عندما يتم قبول :other.',
    'prohibited_if_declined' => 'حقل :attribute محظور عندما يتم رفض :other.',
    'prohibited_unless' => 'حقل :attribute محظور إلا إذا كان :other في :values.',
    'prohibits' => 'حقل :attribute يمنع وجود :other.',
    'regex' => 'تنسيق حقل :attribute غير صالح.',
    'required' => 'حقل :attribute مطلوب.',
    'required_array_keys' => 'حقل :attribute يجب أن يحتوي على مفاتيح: :values.',
    'required_if' => 'حقل :attribute مطلوب عندما يكون :other يساوي :value.',
    'required_if_accepted' => 'حقل :attribute مطلوب عندما يتم قبول :other.',
    'required_if_declined' => 'حقل :attribute مطلوب عندما يتم رفض :other.',
    'required_unless' => 'حقل :attribute مطلوب إلا إذا كان :other في :values.',
    'required_with' => 'حقل :attribute مطلوب عندما يكون :values موجودًا.',
    'required_with_all' => 'حقل :attribute مطلوب عندما تكون :values موجودة.',
    'required_without' => 'حقل :attribute مطلوب عندما لا يكون :values موجودًا.',
    'required_without_all' => 'حقل :attribute مطلوب عندما لا تكون أي من :values موجودة.',
    'same' => 'حقل :attribute يجب أن يطابق :other.',
    'size' => [
        'array' => 'حقل :attribute يجب أن يحتوي على :size عناصر.',
        'file' => 'حجم ملف :attribute يجب أن يكون :size كيلوبايت.',
        'numeric' => 'حقل :attribute يجب أن يكون :size.',
        'string' => 'حقل :attribute يجب أن يكون :size حروف.',
    ],
    'starts_with' => 'حقل :attribute يجب أن يبدأ بأحد القيم التالية: :values.',
    'string' => 'حقل :attribute يجب أن يكون نصًا.',
    'timezone' => 'حقل :attribute يجب أن يكون منطقة زمنية صالحة.',
    'unique' => 'قيمة :attribute مستخدمة بالفعل.',
    'uploaded' => 'فشل رفع :attribute.',
    'uppercase' => 'حقل :attribute يجب أن يكون بأحرف كبيرة.',
    'url' => 'حقل :attribute يجب أن يكون رابطًا صالحًا.',
    'ulid' => 'حقل :attribute يجب أن يكون ULID صالح.',
    'uuid' => 'حقل :attribute يجب أن يكون UUID صالح.',

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Language Lines
    |--------------------------------------------------------------------------
    */

    'custom' => [
        'attribute-name' => [
            'rule-name' => 'رسالة مخصصة',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Attributes
    |--------------------------------------------------------------------------
    */

    'attributes' => [],

];
