<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    protected $fillable = [
        'image',
        'title_ar',
        'description_ar',
        'title_en',
        'description_en',
        'color',
        'body'
    ];

    public function getImageUrlAttribute()
    {
        return $this->image ? 'https://kaljaded.com/' . $this->image : null;
    }
}
