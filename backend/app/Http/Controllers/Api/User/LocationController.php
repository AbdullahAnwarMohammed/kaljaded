<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\Area;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    public function getCities()
    {
        $cities = City::where('is_active', true)->get();
        return response()->json([
            'success' => true,
            'data' => $cities
        ]);
    }

    public function getAreas($city_id)
    {
        $areas = Area::where('city_id', $city_id)->where('is_active', true)->get();
        return response()->json([
            'success' => true,
            'data' => $areas
        ]);
    }
}
