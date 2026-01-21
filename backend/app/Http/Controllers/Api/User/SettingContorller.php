<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\User\Setting\SettingResource;
use App\Models\Info;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class SettingContorller extends Controller
{
    use ApiResponseTrait;
    public function __invoke(Request $request)
    {
        $Settings = Info::first();
        return $this->successResponse(new SettingResource($Settings), "messages.successfully");
    }
}
