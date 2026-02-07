<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductCustomer extends Model
{
    protected $table = 'products_customer';

    protected $guarded = [];

    protected $casts = [
        'is_sold' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function offers()
    {
        return $this->hasMany(ProductCustomerOffer::class, 'product_customer_id');
    }

    public function details()
    {
        return $this->hasOne(ProductCustomerDetail::class, 'product_customer_id');
    }
    public function views()
    {
        return $this->morphMany(ProductView::class, 'visitable');
    }
}
