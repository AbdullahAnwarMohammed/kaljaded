<?php

namespace App\Http\Resources\Api\User\SubCategory;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubCategoryResource extends JsonResource
{

    public function toArray($request)
    {
        $lang = $request->header('language', 'ar');

        return [
            'id' => $this->id,
            'name' => $lang === 'en' ? $this->nameen : $this->name,
            'image' => $this->image_url,
            'category_ids' => $this->category_ids,
            'slug' => $this->slug,
        ];
    }
}
