<?php

namespace App\Http\Resources\Favorite;

use App\Http\Resources\Api\User\Product\ProductResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FavoriteItemResource extends JsonResource
{

    public function toArray($request)
    {
        return [
            'id'      => $this->id,
            'product' => new ProductResource($this->whenLoaded('product')),
        ];
    }
}
