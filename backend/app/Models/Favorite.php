<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Favorite extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'guest_token',
    ];

    /**
     * علاقة المفضلة بالمنتجات
     */
    public function items()
    {
        return $this->hasMany(FavoriteItem::class);
    }

    /**
     * الحصول على المنتجات مباشرة (اختياري)
     */
    public function products()
    {
        return $this->belongsToMany(Product::class, 'favorite_items', 'favorite_id', 'product_id');
    }
}
