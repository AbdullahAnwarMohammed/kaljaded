<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubCategory extends Model
{
    public $timestamps = true;

    protected $fillable = [
        'name',
        'nameen',
        'image',
        'category_id'
    ];

    /**
     * جميع المنتجات التابعة لهذا SubCategory
     */
    public function products()
    {
        return $this->hasMany(Product::class, 'sub_category_id');
    }

    public function getCategoryIdsAttribute()
    {
        return $this->category_id ? explode(',', $this->category_id) : [];
    }


    /**
     * التصنيف الرئيسي الذي ينتمي له
     */
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    /**
     * رابط الصورة
     */
    public function getImageUrlAttribute()
    {
        return $this->image ? 'https://kaljaded.com/uploads/' . $this->image : null;
    }

    /**
     * جميع SubSubCategories التابعة لهذا SubCategory
     */
    public function subSubCategories()
    {
        return $this->hasMany(SubSubCategory::class, 'sub_category_id');
    }
}
