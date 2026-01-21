<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $guarded = [];

    // Disable created_at and updated_at
    public $timestamps = false;
}
