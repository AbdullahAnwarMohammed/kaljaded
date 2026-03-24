<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\User\Product\ProductResource;
use App\Models\Order;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    use ApiResponseTrait;

    public function latestSales()
    {
        $sales = Order::with(['category', 'subcategory', 'subsubcategory', 'merchant'])
            ->orderBy('id', 'desc')
            ->limit(10)
            ->get();

        return $this->successResponse(ProductResource::collection($sales), 'messages.successfully');
    }
}
