<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    protected $fillable = [
        'image',
        'title',
        'title_en',
        'description',
        'description_en',
        'body',
        'body_en',
        'color',
    ];
    public $timestamps = false;
    public function getImageUrlAttribute()
    {
        return $this->image ? 'https://kaljaded.com/' . $this->image : null;
    }
}
