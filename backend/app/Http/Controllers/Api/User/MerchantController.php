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
use App\Models\Order;
use App\Models\Review;
use Illuminate\Support\Facades\Validator;

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
                             ->where('date', '>=', Carbon::now('Asia/Kuwait')->subHour());
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

    public function sales($id)
    {
        try {
            $count = Order::where('iduserinsert', $id)
                ->where('typepay', '!=', 'delivery')
                ->count();

            return $this->successResponse(['count' => $count], 'sales.fetched_successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('sales.fetch_failed', 500);
        }
    }

    public function checkReviewEligibility(Request $request, $id)
    {
        try {
            $user = auth()->user();
            if (!$user) {
                return $this->successResponse(['allowed' => false, 'message' => 'unauthenticated'], 'eligibility_checked');
            }

            // Check if already reviewed
            $alreadyReviewed = Review::where('user_id', $user->id)
                ->where('merchant_id', $id)
                ->exists();

            if ($alreadyReviewed) {
                return $this->successResponse(['allowed' => false, 'message' => 'already_reviewed'], 'eligibility_checked');
            }

            // Check for any valid order regardless of time
            $latestOrder = Order::where('userid', $user->id)
                ->where('iduserinsert', $id)
                ->where('typepay', '!=', 'delivery')
                ->orderBy('date_receipt', 'desc') // Assuming date_receipt is the column
                ->first();

            if (!$latestOrder) {
                 return $this->successResponse(['allowed' => false, 'message' => 'no_valid_purchase'], 'eligibility_checked');
            }

            // Check time constraint
            $orderDate = Carbon::parse($latestOrder->date_receipt);
            $now = Carbon::now('Africa/Cairo');

            // If order is less than 1 hour old
            if ($orderDate->diffInMinutes($now) < 60) {
                 $secondsPassed = $orderDate->diffInSeconds($now);
                 $remainingSeconds = 3600 - $secondsPassed;

                 // Ensure we don't return negative just in case
                 if ($remainingSeconds > 0) {
                     return $this->successResponse([
                         'allowed' => false,
                         'message' => 'wait_for_cooldown',
                         'remaining_seconds' => $remainingSeconds
                     ], 'eligibility_checked');
                 }
            }

            return $this->successResponse(['allowed' => true, 'message' => 'allowed'], 'eligibility_checked');

        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    public function getReviews(Request $request, $id)
    {
        try {
            $perPage = $request->get('per_page', 10);
            $reviews = Review::where('merchant_id', $id)
                ->with('user:id,name,image_vendor') // Assuming user has name/image
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);

            return $this->successResponse($reviews, 'reviews.fetched_successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('reviews.fetch_failed', 500);
        }
    }

    public function submitReview(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'rating' => 'required|integer|min:1|max:5',
                'comment' => 'nullable|string|max:1000',
                'order_id' => 'nullable|exists:orders,id'
            ]);

            if ($validator->fails()) {
                return $this->errorResponse($validator->errors()->first(), 422);
            }

            $user = auth()->user();

            // Re-check eligibility before submitting
            $alreadyReviewed = Review::where('user_id', $user->id)->where('merchant_id', $id)->exists();
            if ($alreadyReviewed) {
                return $this->errorResponse('review.already_submitted', 400);
            }

            $hasValidOrder = Order::where('userid', $user->id)
                ->where('iduserinsert', $id)
                ->where('typepay', '!=', 'delivery')
                ->where('date_receipt', '<=', Carbon::now('Africa/Cairo')->subHour())
                ->exists();

            if (!$hasValidOrder) {
                return $this->errorResponse('review.not_eligible', 403);
            }

            $review = Review::create([
                'user_id' => $user->id,
                'merchant_id' => $id,
                'rating' => $request->rating,
                'comment' => $request->comment,
                'order_id' => $request->order_id // Optional
            ]);

            return $this->successResponse($review, 'review.submitted_successfully');

        } catch (\Exception $e) {
            return $this->errorResponse('review.submission_failed', 500);
        }
    }
}
