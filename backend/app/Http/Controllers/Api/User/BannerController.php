<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\User\Banner\BannerResource;
use App\Models\Banner;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    use ApiResponseTrait;
    public function all(Request $request)
    {
        $categories = Banner::all();
        return $this->successResponse(BannerResource::collection($categories), "messages.successfully");
    }

    public function migrateData()
    {
        $banners = Banner::all();
        foreach ($banners as $banner) {
            $banner->update([
                'title_en' => $banner->title,
                'descrption_en' => $banner->description,
                'body_en' => $banner->body,
            ]);
        }
        return $this->successResponse(null, "Data migrated successfully");
    }
}
