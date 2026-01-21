<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\User\MerchantResource;
use App\Http\Resources\Api\User\Product\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use App\Models\User;
use App\Traits\ApiResponseTrait;
use App\Traits\ApiPaginationTrait;
use Carbon\Carbon;

class MerchantController extends Controller
{
    use ApiResponseTrait, ApiPaginationTrait;


    public function index(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 100);
            $search = $request->get('search', null);
            $city_id = $request->get('city_id', null);

            // قاعدة query للتجار فقط (role 4 or 5)
            $query = User::whereIn('role', [4, 5])
                ->whereHas('products')
                ->orderBy('id', 'desc');
            
            if ($city_id) {
                $query->where('city_id', $city_id);
            }

            // إضافة البحث لو موجود
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name_vendor', 'like', "%{$search}%")
                        ->orWhere('phone_vendor', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%");
                });
            }

            // جلب النتائج مع pagination
            $merchants = $query->paginate($perPage);

            $resource = MerchantResource::collection($merchants);
            // تنسيق pagination
            $paginatedData = $this->paginateResponse($merchants, $resource);
            // إرجاع الرد بنجاح
            return $this->successResponse($paginatedData, 'merchants.fetched_successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('merchants.fetch_failed', 500);
        }
    }

    public function products(Request $request, $id)
    {
        try {
            $perPage = $request->get('per_page', 10);
            $search = $request->get('q'); 

            $merchant = User::where('id', $id)
                ->where(function ($query) {
                    $query->where('role', 4)
                        ->orWhere('role', 5);
                })
                ->first();

            if (!$merchant) {
                return $this->errorResponse('merchant.not_found', 404);
            }

            $products = Product::where('iduserinsert', $merchant->id)
                ->where(function ($q) {
                    $q->where(function ($subQ) {
                        // Condition 1: fast_by is NOT 1 (Normal product)
                        $subQ->where('fast_by', '!=', 1)
                             ->orWhereNull('fast_by');
                    })->orWhere(function ($subQ) {
                        // Condition 2: fast_by IS 1 AND date is within last hour
                        $subQ->where('fast_by', 1)
                             ->where('date', '>=', Carbon::now('Africa/Cairo')->subHour());
                    });
                })
                ->when($search, function ($query, $search) {
                    $query->where(function ($q) use ($search) {
                        $q->where('name', 'LIKE', "%$search%")
                          ->orWhere('nameen', 'LIKE', "%$search%")
                          ->orWhere('description', 'LIKE', "%$search%")
                          ->orWhere('descriptionen', 'LIKE', "%$search%");
                    });
                })
                ->paginate($perPage);

            $resource = ProductResource::collection($products);
            $paginatedData = $this->paginateResponse($products, $resource);

            return $this->successResponse($paginatedData, 'products.fetched_successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('products.fetch_failed', 500);
        }
    }


    public function show($id)
    {
        try {
            $merchant = User::where('id', $id)
                ->where(function ($query) {
                    $query->where('role', 4)
                        ->orWhere('role', 5);
                })
                ->first();

            if (!$merchant) {
                return $this->errorResponse('merchant.not_found', 404);
            }

            return $this->successResponse(
                new MerchantResource($merchant),
                'merchant.fetched_successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse('merchant.fetch_failed', 500);
        }
    }
}
