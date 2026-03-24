<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $guarded = [];


    protected $imagePrefix = 'https://kaljaded.com/';

    // تحويل السلسلة إلى مصفوفة
    protected function getImagesArray(): array
    {
        if (!$this->images) {
            return [];
        }

        // Try JSON first
        $decoded = json_decode($this->images, true);
        if (is_array($decoded)) {
            return $decoded;
        }

        // Fallback to CSV
        return explode(',', $this->images);
    }

    // أول صورة
    public function getFirstImageAttribute()
    {
        $images = $this->getImagesArray();
        if (count($images) > 0) {
            $img = $images[0];
            // If it's already a full URL, return it
            if (filter_var($img, FILTER_VALIDATE_URL)) {
                return $img;
            }
            return $this->imagePrefix . ltrim($img, '/');
        }
        return null;
    }

    // كل الصور
    public function getAllImagesAttribute()
    {
        $images = $this->getImagesArray();
        return array_map(function ($img) {
            if (filter_var($img, FILTER_VALIDATE_URL)) {
                return $img;
            }
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

    public function merchant()
    {
        return $this->belongsTo(User::class, 'iduserinsert');
    }
}
