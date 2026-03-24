<?php

namespace App\Http\Resources\Api\User\Product;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\Api\User\Product\ProductCustomerOfferResource;

class ProductCustomerResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'name' => $this->name,
            'isactive' => $this->isactive,
            'description' => $this->description,
            'price' => $this->price,
            'sub_sub_category_id' => $this->sub_sub_category_id,
            'category_id' => $this->category_id,
            'sub_category_id' => $this->sub_category_id,
            'view' => $this->view,
            'color' => $this->color,
            'images' => $this->images,
            'serialnumber' => $this->serialnumber,
            'memorysize' => $this->memorysize,
            'note' => $this->note,
            'gift' => $this->gift,
            'product_active_new' => $this->product_active_new,
            'fast_by' => $this->fast_by,
            'slug' => $this->slug,
            'category' => $this->category ? [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ] : null,
            'offers_count' => $this->offers_count ?? 0,
            'details' => $this->whenLoaded('details'),
            'offers' => ProductCustomerOfferResource::collection($this->whenLoaded('offers')),
            'created_at' => $this->created_at,
            'expires_at' => $this->created_at ? $this->created_at->addDay() : null,
            'time_ago' => $this->created_at ? $this->created_at->diffForHumans() : null,
            'updated_at' => $this->updated_at,
            'is_sold' => (boolean) $this->is_sold,
            'auction_status' => (boolean) $this->auction_status,
        ];
    }
}
