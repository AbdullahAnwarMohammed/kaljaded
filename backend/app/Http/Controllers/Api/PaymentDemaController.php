<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\CartItem;
use App\Models\FavoriteItem;
use App\Services\DeemaService;
use App\Services\WaSenderApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;


class PaymentDemaController extends Controller
{
    protected DeemaService $deema;
    protected WaSenderApiService $waSender;

    public function __construct(DeemaService $deema, WaSenderApiService $waSender)
    {
        $this->deema = $deema;
        $this->waSender = $waSender;
    }

    public function checkout(Request $request)
    {
        $user = $request->user(); // مستخدم Sanctum

        $request->validate([
            'productid' => 'nullable|exists:products,id',
            'customer_name' => 'required|string',
            'customer_phone' => 'required|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'useraddress' => 'nullable|string',
        ]);

        $productIds = [];
        $amount = 0;
        $merchantOrderId = '';

        if ($request->productid) {
            $product = Product::findOrFail($request->productid);
            $productIds[] = $product->id;
            $amount = $product->price;
            $merchantOrderId = 'ORD-' . $product->id . '-' . date("Y-m-d-His");
        } else {
            // Get from cart
            $cart = \App\Models\Cart::where('user_id', $user->id)->with('items.product')->first();
            if (!$cart || $cart->items->isEmpty()) {
                return response()->json(['success' => false, 'message' => 'Cart is empty'], 400);
            }
            foreach ($cart->items as $item) {
                if ($item->product) {
                    $productIds[] = $item->product->id;
                    $amount += ($item->price * $item->quantity);
                }
            }
            $merchantOrderId = 'ORD-' . implode('-', $productIds) . '-' . date("Y-m-d-His");
        }
        Cache::put(
            'deema_order_' . $merchantOrderId,
            [
                'merchant_order_id' => $merchantOrderId,
                'user_id'           => $user->id,
                'product_ids'       => $productIds,
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
        Log::info("Payment Success Callback Reference: " . $reference);

        if (!$reference) {
            return response()->json(['message' => 'No reference provided'], 400);
        }

        // Verify status with Deema
        $statusResponse = $this->deema->getOrderStatus($reference);
        Log::info('DEEMA STATUS RESPONSE', (array)$statusResponse);

        $status = strtoupper($statusResponse['data']['status'] ?? '');
        if (!in_array($status, ['APPROVED', 'CAPTURED'])) {
            return response()->json(['message' => 'Payment not approved'], 400);
        }


        // Retrieve cached order data
        $cached = \Illuminate\Support\Facades\Cache::get('deema_order_' . $reference);
        if (!$cached) {
            return response()->json(['message' => 'Order expired from cache'], 410);
        }

        $merchantOrderId = $cached['merchant_order_id'];



        $productIds = $cached['product_ids'] ?? [];
        if (empty($productIds) && isset($cached['product_id'])) {
            $productIds = [$cached['product_id']];
        }

        if (empty($productIds)) {
            return response()->json(['message' => 'No products found in order'], 404);
        }

        try {
            foreach ($productIds as $pId) {
                $product = Product::find($pId);
                if (!$product) continue;

                $productMerchantOrderId = 'ORD-' . $product->id . '-' . date("Y-m-d-His");

                // Prevent duplicate for this specific product
                if (Order::where('productid', $product->id)->where('merchant_order_id', $productMerchantOrderId)->exists()) {
                    continue;
                }

                Order::create([
                    'productid'            => $product->id,

                    // Use cached user data (Buyer info)
                    'order_reference'      => $reference,
                    'userid'               => $cached['user_id'] ?? 0,
                    'username'             => $cached['customer_name'] ?? '',
                    'userphone'            => $cached['customer_phone'] ?? '',
                    'latitude'             => $cached['latitude'] ?? 0,
                    'longitude'            => $cached['longitude'] ?? 0,
                    'useraddress'          => $cached['useraddress'] ?? '',

                    'totalprice'           => $product->price ?? 0,
                    'typepay'              => 'installment',
                    'order_source'         => 'Web',
                    'status'               => 1,
                    'date_receipt'         => '',
                    'merchant_order_id'    => $productMerchantOrderId,
                    
                    // Product Data Snapshot
                    'name'                 => $product->name ?? '',
                    'nameen'               => $product->nameen ?? '',
                    'isactive'             => $product->isactive ?? 1,
                    'description'          => $product->description ?? '',
                    'descriptionen'        => $product->descriptionen ?? '',
                    'price'                => $product->price ?? 0,
                    'price_old'            => $product->price_old ?? 0,
                    'price_sale'           => $product->price_sale ?? 0,
                    'price_active'         => $product->price_active ?? 0,
                    'sub_sub_category_id'  => $product->sub_sub_category_id ?? 0,
                    'category_id'          => $product->category_id ?? 0,
                    'sub_category_id'      => $product->sub_category_id ?? 0,
                    'rating'               => $product->rating ?? 0,
                    'view'                 => $product->view ?? 0,
                    'images'               => $product->images ?? '',
                    'date'                 => now(),
                    'barcode'              => $product->barcode ?? '',
                    'serialnumber'         => $product->serialnumber ?? '',
                    
                    // Deema/Customer specific
                    'customer_name'        => $cached['customer_name'] ?? '',
                    'customer_phone'       => $cached['customer_phone'] ?? '',
                    
                    // Fill other nullable fields as needed by your schema or keep null
                    'userinsert'           => $product->userinsert ?? '',
                    'iduserinsert'         => $product->iduserinsert ?? 0,
                    'iduserupdate'         => $product->iduserupdate ?? 0,
                    'number'               => $product->number ?? '',
                    'memorysize'           => $product->memorysize ?? '',
                    'ramsize'              => $product->ramsize ?? '',
                    'colorar'              => $product->colorar ?? '',
                    'coloren'              => $product->coloren ?? '',
                    'device_status'        => $product->device_status ?? '',
                    'device_clean'         => $product->device_clean ?? '',
                    'device_body'          => $product->device_body ?? '',
                    'device_display'       => $product->device_display ?? '',
                    'device_button'        => $product->device_button ?? '',
                    'device_camera'        => $product->device_camera ?? '',
                    'device_wifi_blu'      => $product->device_wifi_blu ?? '',
                    'device_battery'       => $product->device_battery ?? '',
                    'device_fingerprint'   => $product->device_fingerprint ?? '',
                    'device_speaker'       => $product->device_speaker ?? '',
                    'device_box'           => $product->device_box ?? '',
                    'note'                 => $product->note ?? '',
                    'gift'                 => $product->gift ?? '',
                    'fast_by'              => $product->fast_by ?? 0,
                    'slug'                 => $product->slug ?? '',
                    'customer_approved'    => $product->customer_approved ?? 0,
                    'customer_approved_name' => $product->customer_approved_name ?? '',
                    'product_active_new'     => $product->product_active_new ?? 0,
                ]);

                // Delete from all carts and favorites
                CartItem::where('product_id', $product->id)->delete();
                FavoriteItem::where('product_id', $product->id)->delete();

                $product->delete();
            }

            // Send WhatsApp Notification to Customer
            $customerPhone = $cached['customer_phone'] ?? null;
            if ($customerPhone) {
                $message = "شكراً لطلبك من *كالجديد*! 🔔\n\n";
                $message .= "تم استلام طلبك (تقسيط ديمة) بنجاح وجاري معالجته.\n\n";
                $message .= "📍 *تفاصيل الطلب:*\n";
                $message .= "• *مرجع الدفع:* {$reference}\n";
                $message .= "• *العنوان:* " . ($cached['useraddress'] ?? 'غير معروف') . "\n\n";
                $message .= "📦 *المنتجات:*\n";
                
                foreach ($productIds as $pId) {
                    $p = Product::find($pId);
                    if ($p) {
                        $message .= "- {$p->name} ({$p->price} K.D)\n";
                    }
                }
                
                $message .= "\n💰 *الإجمالي:* {$cached['amount']} K.D\n\n";
                $message .= "شكراً لثقتك بنا! نتمنى لك يوماً سعيداً.";

                $this->waSender->sendTextMessage($customerPhone, $message);
            }

            // Cleanup Cache
            \Illuminate\Support\Facades\Cache::forget('deema_order_' . $reference);
            \Illuminate\Support\Facades\Cache::forget('deema_order_' . $merchantOrderId);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Deema Callback Order Create Error: " . $e->getMessage());
            return response()->json(['message' => 'Order creation failed'], 500);
        }

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

    public function tempDuplicateOrder()
    {
        $sourceOrder = Order::where('productid', 2518)->first();
        if (!$sourceOrder) {
            return response()->json(['message' => 'Source order (productid: 2518) not found'], 404);
        }

        $user = \App\Models\User::find(1612);
        if (!$user) {
            return response()->json(['message' => 'User 1612 not found'], 404);
        }

        $newOrderData = $sourceOrder->toArray();
        
        // Remove primary key and timestamps
        unset($newOrderData['id']);
        unset($newOrderData['created_at']);
        unset($newOrderData['updated_at']);

        // Update fields from User 1612
        $newOrderData['iduserinsert'] = null;
        $newOrderData['userinsert'] = null;
        $newOrderData['order_source'] = null;
        $newOrderData['merchant_order_id'] = 2518;
        $newOrderData['username'] = $user->name;
        $newOrderData['userphone'] = $user->phone;
        $newOrderData['latitude'] = $user->latitude;
        $newOrderData['longitude'] = $user->longitude;

        // Construct useraddress
        $addressParts = [];
        if ($user->block) $addressParts[] = "Block: " . $user->block;
        if ($user->street) $addressParts[] = "Street: " . $user->street;
        if ($user->building) $addressParts[] = "Building: " . $user->building;
        if ($user->floor) $addressParts[] = "Floor: " . $user->floor;
        if ($user->apartment) $addressParts[] = "Apt: " . $user->apartment;
        
        $newOrderData['useraddress'] = implode(', ', $addressParts);

        // Date receipt to now? Or keep original? User said "Rest as I understood from orders productid=2518"
        // Usually duplication implies new order time, but user didn't specify. I'll stick to mostly copying.
        // But usually unique constraints or logic might require new date. I'll set date_receipt to now() to be safe/logical.
        // Actually, user said "Rest as I understood from orders productid=2518".
        // I will keep date_receipt if possible, or set to now() if it makes more sense for a "new" duplicate.
        // Given it's a "duplicate", maybe it should mimic the old one exactly except for the changes?
        // But `date_receipt` is line 134: `now()`.
        // I will set it to `now()` to be clean.
        $newOrderData['date_receipt'] = now();

        $newOrder = Order::create($newOrderData);

        return response()->json([
            'message' => 'Order duplicated successfully',
            'new_order_id' => $newOrder->id,
            'source_order_id' => $sourceOrder->id
        ]);
    }

   
}
