<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Services\DeemaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;


class PaymentDemaController extends Controller
{
    protected DeemaService $deema;

    public function __construct(DeemaService $deema)
    {
        $this->deema = $deema;
    }

    public function checkout(Request $request)
    {
        $user = $request->user(); // مستخدم Sanctum

        $request->validate([
            'productid' => 'required|exists:products,id',
            'customer_name' => 'required|string',
            'customer_phone' => 'required|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'useraddress' => 'nullable|string',
        ]);

        $product = Product::findOrFail($request->productid);
        $amount = $product->price;
        $merchantOrderId = 'ORD-' . $product->id;

        Cache::put(
            'deema_order_' . $merchantOrderId,
            [
                'merchant_order_id' => $merchantOrderId,
                'user_id'           => $user->id,
                'product_id'        => $product->id,
                'amount'            => $amount,
                'customer_name'     => $request->customer_name,
                'customer_phone'    => $request->customer_phone,
                'latitude'          => $request->latitude,
                'longitude'         => $request->longitude,
                'useraddress'       => $request->useraddress,
                'typepay'           => 'deema',
            ],
            now()->addMinutes(30)
        );

        $classBaseUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');

        $data = [
            "amount" => $amount,
            "currency_code" => "KWD",
            "merchant_order_id" => $merchantOrderId,
            "merchant_urls" => [
                "success" => $classBaseUrl . "/payment-success",
                "failure" => $classBaseUrl . "/payment-failed",
            ],
        ];

        $response = $this->deema->createOrder($data);
        if (isset($response['data']['order_reference'])) {
            Cache::put(
                'deema_order_' . $response['data']['order_reference'],
                Cache::get('deema_order_' . $merchantOrderId),
                now()->addMinutes(30)
            );
        }

        return response()->json($response);
    }

    // callback عند نجاح الدفع
    public function success(Request $request)
    {
        $reference = $request->reference ?? $request->order_reference;
        \Log::info("Payment Success Callback Reference: " . $reference);

        if (!$reference) {
            return response()->json(['message' => 'No reference provided'], 400);
        }

        // Verify status with Deema
        $statusResponse = $this->deema->getOrderStatus($reference);
        \Log::info('DEEMA STATUS RESPONSE', (array)$statusResponse);

        $status = strtoupper($statusResponse['data']['status'] ?? '');
        if (!in_array($status, ['APPROVED', 'CAPTURED'])) {
            return response()->json(['message' => 'Payment not approved'], 400);
        }

        // Retrieve cached order data
        $cached = Cache::get('deema_order_' . $reference);
        if (!$cached) {
            return response()->json(['message' => 'Order expired from cache'], 410);
        }

        $merchantOrderId = $cached['merchant_order_id'];

        // Prevent duplicate orders
        if (Order::where('merchant_order_id', $merchantOrderId)->exists()) {
            return response()->json(['message' => 'Order already created']);
        }

        $product = Product::find($cached['product_id']);
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        try {
            Order::create([
                'productid'            => $product->id,

                // Use cached user data (Buyer info)
                'userid'               => $cached['user_id'],
                'username'             => $cached['customer_name'],
                'userphone'            => $cached['customer_phone'],
                'latitude'             => $cached['latitude'],
                'longitude'            => $cached['longitude'],
                'useraddress'          => $cached['useraddress'],

                'totalprice'           => $product->price,
                'typepay'              => 'installment',
                'order_source'         => 'Web',
                'status'               => 1,
                'date_receipt'         => now(),
                'merchant_order_id'    => $merchantOrderId,
                
                // Product Data Snapshot
                'name'                 => $product->name,
                'nameen'               => $product->name_en,
                'isactive'             => $product->isactive,
                'description'          => $product->description,
                'descriptionen'        => $product->description_en,
                'price'                => $product->price,
                'price_old'            => $product->old_price,
                'price_sale'           => $product->sale_price,
                'price_active'         => $product->active_price,
                'sub_sub_category_id'  => $product->sub_sub_category_id,
                'category_id'          => $product->category_id,
                'sub_category_id'      => $product->sub_category_id,
                'rating'               => $product->rating,
                'view'                 => $product->view,
                'images'               => $product->images,
                'date'                 => now(),
                'barcode'              => $product->barcode,
                'serialnumber'         => $product->serial_number,
                
                // Deema/Customer specific
                'customer_name'        => $cached['customer_name'] ?? null,
                'customer_phone'       => $cached['customer_phone'] ?? null,
                
                // Fill other nullable fields as needed by your schema or keep null
                'userinsert'           => $product->userinsert,
                'iduserinsert'         => $product->iduserinsert,
                'iduserupdate'         => $product->iduserupdate,
                'number'               => $product->number,
                'memorysize'           => $product->memory_size,
                'ramsize'              => $product->ram_size,
                'colorar'              => $product->color_arabic,
                'coloren'              => $product->color_english,
                'device_status'        => $product->device_status,
                'device_clean'         => $product->device_clean,
                'device_body'          => $product->device_body,
                'device_display'       => $product->device_display,
                'device_button'        => $product->device_button,
                'device_camera'        => $product->device_camera,
                'device_wifi_blu'      => $product->device_wifi_blu,
                'device_battery'       => $product->device_battery,
                'device_fingerprint'   => $product->device_fingerprint,
                'device_speaker'       => $product->device_speaker,
                'device_box'           => $product->device_box,
                'note'                 => $product->note,
                'gift'                 => $product->gift,
                'fast_by'              => $product->fast_by,
                'slug'                 => $product->slug,
                'customer_approved'    => $product->customer_approved ?? 0,
                'customer_approved_name' => $product->customer_approved_name,
                'product_active_new'     => $product->product_active_new ?? true,
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Deema Callback Order Create Error: " . $e->getMessage());
            return response()->json(['message' => 'Order creation failed'], 500);
        }

        // Cleanup Cache
        Cache::forget('deema_order_' . $reference);
        Cache::forget('deema_order_' . $merchantOrderId);
        $product->delete();

        return response()->json([
            'message' => 'Payment success & order created',
            'order_id' => $merchantOrderId
        ]);
    }

    public function failure(Request $request)
    {
        $reference = $request->reference;

        if (!$reference) {
            return response()->json([
                'message' => 'Payment failed, no reference provided',
            ], 400);
        }

        $orderStatus = $this->deema->getOrderStatus($reference);

        return response()->json([
            'message' => 'Payment failed',
            'reference' => $reference,
            'order_status' => $orderStatus,
        ], 400);
    }

    // استعلام حالة الدفع
    public function status(Request $request)
    {
        $request->validate([
            'order_reference' => 'required'
        ]);

        return response()->json(
            $this->deema->getOrderStatus($request->order_reference)
        );
    }
}
