<?php

namespace App\Http\Resources\Api\User\Product;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    //

    public function toArray($request)
    {
        $lang = $request->header('language', 'ar');

        return [
            'id' => $this->id,
            'name' => $this->name,
            'price' => $this->price,
            'price_old' => $this->price_old,
            'price_sale' => $this->price_sale,
            'image'  => $this->first_image,
            'images' => $this->all_images,
            'views' => $this->view,
            'gift' => $this->gift,
            'device_clean' => $this->device_clean,
            'price_active' => $this->price_active,
            'slug' => $this->slug,
            'device_box' => $this->device_box,
            'memorysize' => $this->memorysize,
            'device_wifi_blu' => $this->device_wifi_blu,
            'device_camera' => $this->device_camera,
            'device_button' => $this->device_button,
            'device_battery' => $this->device_battery,
            'device_speaker' => $this->device_speaker,
            'device_fingerprint' => $this->device_fingerprint, 
            'color' => $lang == 'ar' ?  $this->colorar : $this->coloren ,
            'ramsize' => $this->ramsize,
            'category' => $this->category ? [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ] : null,
            'subcategory' => $this->subcategory ? [
                'id' => $this->subcategory->id,
                'name' => $this->subcategory->name,
                'slug' => $this->subcategory->slug,
            ] : null,
            'subsubcategory' => $this->subsubcategory ? [
                'id' => $this->subsubcategory->id,
                'name' => $this->subsubcategory->name,
                'slug' => $this->subsubcategory->slug,
            ] : null,
            'fast_by' => $this->fast_by,
            'date' => $this->date,
            'note' => $this->note,
            'merchant_id' => $this->iduserinsert,
            'merchant_name' => $this->merchant ? ($this->merchant->name_vendor ?? $this->merchant->name) : 'K.D',
            'merchant_slug' => $this->merchant ? $this->merchant->slug : null,
            'server_time' => now()->format('Y-m-d H:i:s'),
        ];
    }
}
    