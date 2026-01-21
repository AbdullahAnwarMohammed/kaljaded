<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubSubCategory extends Model
{
    protected $fillable = [
        'name',
        'nameen',
        'category_id',
        'sub_category_id',
        'price',
        'image'
    ];

    /**
     * التصنيف الرئيسي
     */
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    /**
     * SubCategory الأب
     */
    public function subCategory()
    {
        return $this->belongsTo(SubCategory::class, 'sub_category_id');
    }

    /**
     * المنتجات التابعة لهذا SubSubCategory
     */
    public function products()
    {
        return $this->hasMany(Product::class, 'sub_sub_category_id');
    }

    /**
     * رابط الصورة
     */
    public function getImageUrlAttribute()
    {
        return $this->image ? 'https://kaljaded.com/uploads/' . $this->image : null;
    }
}
