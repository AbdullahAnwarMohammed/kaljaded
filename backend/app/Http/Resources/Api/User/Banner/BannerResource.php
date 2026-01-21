<?php

namespace App\Http\Resources\Api\User\Banner;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BannerResource extends JsonResource
{

    public function toArray(Request $request): array
    {
        $lang = $request->header('language', 'ar');


        return [
            'id' => $this->id,
            'image' => $this->image_url,
            'title' => $lang == 'ar' ? $this->title_ar : $this->title_en,
            'description' => $lang == 'ar' ? $this->description_ar : $this->description_en,
            'color' => $this->color,
            'body' => $lang == 'ar' ?  $this->body_ar : $this->body_en,
        ];
    }
}
