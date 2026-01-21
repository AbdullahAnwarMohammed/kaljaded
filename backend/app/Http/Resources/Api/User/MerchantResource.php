<?php

namespace App\Http\Resources\Api\User;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MerchantResource extends JsonResource
{

    public function toArray($request)
    {
        return [
            'id'                         => $this->id,
            'name'                       => $this->name_vendor ?? "لا يوجد",
            'email'                      => $this->email,
            'slug'                       => $this->slug,
            'address'                    => $this->address,
            'phone'                      => $this->phone,
            'phone_vendor'               => $this->phone_vendor,
            'latitude'                   => $this->latitude,
            'longitude'                  => $this->longitude,
            'image_vendor' => $this->image_merchant,
            'commercial_Register_No'     => $this->commercial_Register_No,
            'image_commercial_Register_No' => $this->image_commercial_Register_No ? asset('storage/' . $this->image_commercial_Register_No) : null,
            'role'                       => $this->role,
            'price'                      => $this->price,
            'rating'                     => $this->rating ?? 5,
        ];
    }
}
