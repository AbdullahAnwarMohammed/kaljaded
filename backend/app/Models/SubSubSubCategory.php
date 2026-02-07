<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubSubSubCategory extends Model
{
    protected $table = 'sub_sub_sub_categories';
    public $timestamps = false; // Assuming based on other models, verify if needed

    protected $fillable = [
        'name',
        'nameen',
        'price',
        'parent_id',
        'percentage'
    ];

    public function parent()
    {
        return $this->belongsTo(SubSubCategory::class, 'parent_id');
    }
}
