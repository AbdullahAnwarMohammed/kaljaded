<?php

namespace App\Http\Resources\Api\User\Product;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductCustomerOfferResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'merchant_id' => $this->merchant_id,
            'merchant' => $this->whenLoaded('merchant', function () {
                return [
                    'id' => $this->merchant->id,
                    'name' => $this->merchant->name,
                    'image' => $this->merchant->image, 
                ];
            }),
            'price' => $this->price,
            'status' => (int) $this->status, // ensure int
            'status_label' => $this->status === 1 ? 'accepted' : ($this->status === 2 ? 'rejected' : 'pending'),
            'created_at' => $this->created_at,
            'time_ago' => $this->created_at ? $this->created_at->diffForHumans() : null,
        ];
    }
}
