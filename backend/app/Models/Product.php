<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name',
        'nameen',
        'isactive',
        'description',
        'descriptionen',
        'price',
        'price_old',
        'price_sale',
        'price_active',
        'category',
        'type',
        'product_category',
        'rating',
        'view',
        'images',
        'date',
        'userinsert',
        'iduserinsert',
        'iduserupdate',
        'barcode',
        'number',
        'serialnumber',
        'memorysize',
        'ramsize',
        'colorar',
        'coloren',
        'device_status',
        'device_clean',
        'device_body',
        'device_display',
        'device_button',
        'device_camera',
        'device_wifi_blu',
        'device_battery',
        'device_fingerprint',
        'device_speaker',
        'device_box',
        'note',
        'gift',
        'customer_name',
        'customer_phone',
        'customer_price',
        'customer_approved',
        'customer_approved_name',
        'product_active_new'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'price_old' => 'decimal:2',
        'price_sale' => 'decimal:2',
    ];


    protected $imagePrefix = 'https://kaljaded.com/';

    // تحويل السلسلة إلى مصفوفة
    protected function getImagesArray(): array
    {
        if (!$this->images) {
            return [];
        }
        return explode(',', $this->images);
    }

    // أول صورة
    public function getFirstImageAttribute()
    {
        $images = $this->getImagesArray();
        if (count($images) > 0) {
            return $this->imagePrefix . ltrim($images[0], '/');
        }
        return null;
    }

    // كل الصور
    public function getAllImagesAttribute()
    {
        $images = $this->getImagesArray();
        return array_map(function ($img) {
            return $this->imagePrefix . ltrim($img, '/');
        }, $images);
    }


    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function subcategory()
    {
        return $this->belongsTo(SubCategory::class, 'sub_category_id');
    }

    public function subsubcategory()
    {
        return $this->belongsTo(SubSubCategory::class, 'sub_sub_category_id');
    }
}
