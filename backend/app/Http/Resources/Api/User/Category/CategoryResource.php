<?php

namespace App\Http\Resources\Api\User\Category;

use App\Http\Resources\Api\User\SubCategory\SubCategoryResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;


class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $lang = $request->header('language', 'ar');

        return [
            'id'   => $this->id,
            'name' => $lang === 'en' ? $this->nameen : $this->name,
            'image' => $this->image_url,
            'slug' => $this->slug,
            'description' => $lang === 'en' ? $this->description_en : $this->description,
            'subcategories' => SubCategoryResource::collection($this->subcategoriesList()),
        ];
    }
}
