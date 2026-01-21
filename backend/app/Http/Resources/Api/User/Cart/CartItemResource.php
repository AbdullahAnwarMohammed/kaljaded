<?php

namespace App\Http\Resources\Api\User\Cart;

use App\Http\Resources\Api\User\Product\ProductResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'       => $this->id,
            'quantity' => $this->quantity,
            'price'    => $this->price,

            'product'  => new ProductResource($this->whenLoaded('product')),
        ];
    }
}
