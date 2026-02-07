<?php

namespace App\Http\Resources\Api\User\SubSubSubCategory;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubSubSubCategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $lang = $request->header('language', 'ar');

        return [
            'id' => $this->id,
            'name' => $lang === 'en' ? $this->nameen : $this->name,
            'price' => $this->price,
            'percentage' => $this->percentage,
            'parent_id' => $this->parent_id,
        ];
    }
}
