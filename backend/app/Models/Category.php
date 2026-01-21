<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $table = 'categories';
    public $timestamps = false;

    protected $fillable = [
        'name',
        'nameen',
        'image',
        'slug',
        'description',
        'description_en',
        'status',
        'order'
    ];

    /**
     * رابط الصورة
     */
    public function getImageUrlAttribute()
    {
        return $this->image ? 'https://kaljaded.com/' . $this->image : null;
    }

    /**
     * جميع المنتجات التابعة لهذا التصنيف
     */
    public function products()
    {
        return $this->hasMany(Product::class, 'category_id');
    }

    /**
     * جميع SubCategories المرتبطة
     */
    public function subcategories()
    {
        return $this->hasMany(SubCategory::class, 'category_id')
            ->whereRaw("FIND_IN_SET(?, category_id)", [$this->id]);
    }
    public function subcategoriesList()
    {
        return SubCategory::all()->filter(function ($sub) {
            $ids = $sub->category_id ? explode(',', $sub->category_id) : [];
            return in_array($this->id, $ids);
        });
    }
}
