<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductCustomerOffer extends Model
{
    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function merchant()
    {
        return $this->belongsTo(User::class, 'merchant_id');
    }

    public function productCustomer()
    {
        return $this->belongsTo(ProductCustomer::class);
    }
}
