<?php

namespace App\Http\Resources\Api\User\Cart;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'     => $this->id,
            'status' => $this->status,

            'items'  => CartItemResource::collection(
                $this->whenLoaded('items')
            ),

            'total'  => $this->total(),
        ];
    }
}
