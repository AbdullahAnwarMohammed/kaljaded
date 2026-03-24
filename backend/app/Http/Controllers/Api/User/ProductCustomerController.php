<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\User\Product\ProductCustomerResource;
use App\Models\ProductCustomer;
use App\Models\User;
use App\Services\FirebaseService; // Import the service
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ProductCustomerController extends Controller
{
    use ApiResponseTrait;

    protected $firebaseService;

    public function __construct(FirebaseService $firebaseService)
    {
        $this->firebaseService = $firebaseService;
    }

    public function index(Request $request)
    {
        $user = Auth::user();
        $query = ProductCustomer::where('user_id', $user->id)
            // ->where('auction_status', 1)
            // ->where('is_sold', 0)
            ->where('created_at', '>=', now()->subDay())
            ->with(['category', 'details'])
            ->withCount('offers')
            ->latest();

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Global count of all active auctions in the system to show in the UI badge
        $activeCount = ProductCustomer::where('is_sold', 0)
            ->where('auction_status', 1)
            ->where('created_at', '>=', now()->subDay())
            ->count();

        $products = $query->paginate(10);
            
        return $this->successResponse(
            array_merge(
                ProductCustomerResource::collection($products)->response()->getData(true),
                ['active_count' => $activeCount]
            ),
            'User products retrieved successfully'
        );
    }

    public function show($id)
    {
        $product = ProductCustomer::where('id', $id)
            ->where('user_id', Auth::id())
            ->with(['category', 'details', 'offers.merchant']) // Eager load details and offers with merchant
            ->first();

        if (!$product) {
            return $this->errorResponse('Product not found or unauthorized', 404);
        }


        $this->recordView($product);

        return $this->successResponse(
            new ProductCustomerResource($product),
            'Product details retrieved successfully'
        );
    }

    private function recordView($product)
    {
        $userId = auth()->guard('sanctum')->id();
        $ip = request()->ip();

        // Check if this IP has already viewed this product
        $existingView = $product->views()
            ->where('ip_address', $ip)
            ->first();

        if ($existingView) {
            // If we now have a user_id but the existing record didn't, update it
            if ($userId && !$existingView->user_id) {
                $existingView->update(['user_id' => $userId]);
            }
        } else {
            // New view from this IP
            // Increment public view counter
            $product->increment('view');

            // Log the view
            $product->views()->create([
                'ip_address' => $ip,
                'user_id' => $userId,
            ]);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'nullable',
            'name' => 'required|string|max:255',
            'isactive' => 'nullable|integer',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric',
            'sub_sub_category_id' => 'nullable|integer',
            'category_id' => 'nullable|integer',
            'sub_category_id' => 'nullable|integer',
            'view' => 'nullable|integer',
            'color' => 'nullable|string',
            'images' => 'nullable|array',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:10240',
            'serialnumber' => 'nullable|string',
            'memorysize' => 'nullable|string',
            'note' => 'nullable|string',
            'gift' => 'nullable|string',
            'product_active_new' => 'nullable|integer',
            'fast_by' => 'nullable|integer',
            'slug' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse($validator->errors()->first(), 422);
        }

        try {
            $data = $request->except([
                'images',
                'device_box', 'device_usage', 'device_opened', 'device_clean',
                'device_display', 'device_body', 'device_battery', 'device_sensors',
                'device_wifi', 'device_bluetooth', 'device_gps', 'device_camera',
                'device_button', 'device_speaker', 'device_fingerprint', 'device_condition'
            ]);
            
            // Set user_id if not provided
            if (!$request->user_id && Auth::check()) {
                $data['user_id'] = Auth::id();
            }
            
        if ($request->hasFile('images')) {
            $paths = [];
            foreach ($request->file('images') as $image) {
                $filename = time() . '_' . $image->getClientOriginalName();
                $image->move(public_path('uploads/product_customers'), $filename);
                $paths[] = 'uploads/product_customers/' . $filename;
            }
            $data['images'] = implode(',', $paths);
        }

            $data['slug'] = Str::slug($request->name);
            $productCustomer = ProductCustomer::create($data);

            // Save details if product is used (product_active_new == 0)
            if (isset($data['product_active_new']) && $data['product_active_new'] == 0) {
                \App\Models\ProductCustomerDetail::create([
                    'product_customer_id' => $productCustomer->id,
                    'device_box' => $request->device_box,
                    'device_usage' => $request->device_usage,
                    'device_opened' => $request->device_opened,
                    'device_clean' => $request->device_clean,
                    'device_display' => $request->device_display,
                    'device_body' => $request->device_body,
                    'device_battery' => $request->device_battery,
                    'device_wifi' => $request->device_wifi,
                    'device_bluetooth' => $request->device_bluetooth,
                    'device_gps' => $request->device_gps,
                    'device_sensors' => $request->device_sensors,
                    'device_camera' => $request->device_camera,
                    'device_button' => $request->device_button,
                    'device_speaker' => $request->device_speaker,
                    'device_fingerprint' => $request->device_fingerprint,
                    'device_condition' => $request->device_condition,
                ]);
            }

            // --- Send Notification to Roles 4 and 5 (Mobile only) ---
            try {
                // Get tokens for users with role 4 or 5 AND device_type = 'Mobile'
                $tokens = \App\Models\UserFcmToken::where('device_type', 'Mobile')
                    ->whereHas('user', function ($query) {
                        $query->whereIn('role', [4, 5]);
                    })
                    ->pluck('token')
                    ->toArray();

                $tokens = array_unique($tokens);
                
                if (!empty($tokens)) {
                    $title = "تم إضافة منتج جديد";
                    $body = "قام المستخدم " . (Auth::user()->name ?? 'مستخدم') . " بإضافة منتج جديد: " . $productCustomer->name;
                    $dataPayload = [
                        'product_id' => (string)$productCustomer->id,
                        'type' => 'new_product'
                    ];

                    // $this->firebaseService->sendToTokens($tokens, $title, $body, $dataPayload);
                }

            } catch (\Exception $e) {
                // Log notification failure but don't fail the request
                \Illuminate\Support\Facades\Log::error("Failed to send new product notification: " . $e->getMessage());
            }
            // ------------------------------------------

            return $this->successResponse(
                new ProductCustomerResource($productCustomer),
                'Product customer data saved successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to save data: ' . $e->getMessage(), 500);
        }
    }
    public function updateOfferStatus(Request $request, $offerId)
    {
        $offer = \App\Models\ProductCustomerOffer::findOrFail($offerId);
        
        // Authorization check: Ensure the authenticated user owns the product associated with this offer
        $product = ProductCustomer::where('id', $offer->product_customer_id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$product) {
            return $this->errorResponse('Unauthorized or Product not found', 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:0,1,2', // 0: Pending/Undo, 1: Accept, 2: Reject
        ]);

        if ($validator->fails()) {
            return $this->errorResponse($validator->errors()->first(), 422);
        }

        $offer->status = $request->status;
        $offer->save();

        // is_sold logic removed per user request

        return $this->successResponse(
            new \App\Http\Resources\Api\User\Product\ProductCustomerOfferResource($offer),
            'Offer status updated successfully'
        );
    }

    public function offers($id)
    {
        $product = ProductCustomer::where('id', $id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$product) {
            return $this->errorResponse('Product not found or unauthorized', 404);
        }

        $offers = \App\Models\ProductCustomerOffer::where('product_customer_id', $id)
            ->with(['merchant.city'])
            ->latest()
            ->paginate(5);

        return $this->successResponse(
            \App\Http\Resources\Api\User\Product\ProductCustomerOfferResource::collection($offers)->response()->getData(true),
            'Product offers retrieved successfully'
        );
    }

    public function toggleAuctionStatus($id)
    {
        $product = ProductCustomer::where('id', $id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$product) {
            return $this->errorResponse('Product not found or unauthorized', 404);
        }

        $product->auction_status = !$product->auction_status;
        $product->save();

        return $this->successResponse(
            new ProductCustomerResource($product),
            'Auction status updated successfully'
        );
    }
}
