<?php

namespace App\Http\Resources\Api\User\SubSubCategory;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubSubCategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $lang = $request->header('language', 'ar');

        return [
            'id' => $this->id,
            'name' => $lang === 'en' ? $this->nameen : $this->name,
            'slug' => $this->slug,
            'price' => $this->price,
            'image' => $this->image_url,

            'category_id' => $this->category_id,
            'sub_category_id' => $this->sub_category_id,

            // لو حابب ترجع الداتا كاملة
            'category' => $this->whenLoaded('category', function () use ($lang) {
                return [
                    'id' => $this->category->id,
                    'name' => $lang === 'en'
                        ? $this->category->nameen
                        : $this->category->name,
                    'slug' => $this->category->slug,
                ];
            }),

            'subcategory' => $this->whenLoaded('subcategory', function () use ($lang) {
                return [
                    'id' => $this->subcategory->id,
                    'name' => $lang === 'en'
                        ? $this->subcategory->nameen
                        : $this->subcategory->name,
                    'slug' => $this->subcategory->slug,
                ];
            }),
        ];
    }
}
