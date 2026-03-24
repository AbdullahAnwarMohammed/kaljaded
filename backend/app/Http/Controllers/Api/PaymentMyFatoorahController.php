<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\FavoriteItem;
use App\Services\MyFatoorahService;
use App\Services\WaSenderApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class PaymentMyFatoorahController extends Controller
{
    protected MyFatoorahService $myFatoorah;
    protected WaSenderApiService $waSender;

    public function __construct(MyFatoorahService $myFatoorah, WaSenderApiService $waSender)
    {
        $this->myFatoorah = $myFatoorah;
        $this->waSender = $waSender;
    }

    // Initiate Checkout
    // Initiate Checkout
    public function checkout(Request $request)
    {
        $user = $request->user();
        $request->validate([
            'payment_method' => 'required|in:knet,apple,cod,myfatoorah',
            'phone' => 'nullable|string'
        ]);

        $cart = Cart::where('user_id', $user->id)->where('status', 'active')->with('items.product')->first();
        if (!$cart || $cart->items->isEmpty()) {
            return response()->json(['success' => false, 'message' => 'Cart is empty'], 400);
        }
        
        $amount = $cart->total(); 
        if ($amount <= 0) {
             return response()->json(['success' => false, 'message' => 'Invalid total amount'], 400);
        }

        $paymentMethod = $request->payment_method;
        $gatewayPaymentMethodId = $request->input('gateway_id');

        // Determine DB Type
        if ($gatewayPaymentMethodId == 1) {
            $typePayDB = 'knet';
        } elseif ($gatewayPaymentMethodId == 2) {
            $typePayDB = 'visa'; 
        } else {
             $typePayDB = match($paymentMethod) {
                'cod' => 'delivery',
                'apple' => 'apple_pay', 
                default => 'myfatoorah'
            };
        }   
      $merchantOrderId = 'ORD-' . Str::uuid();

        // Handle COD immediately (no change needed essentially, but we can clean it up)
        if ($paymentMethod === 'cod') {
             // For COD, we still create the order immediately as there is no callback
             // ... [Logic for COD remains if needed, or we can unify. Keeping it simple for now]
             // Re-implementing simplified COD logic for safety if user relies on it:
             /* 
                COD LOGIC HERE IF NEEDED. 
                For now, assuming focus is on MyFatoorah Online Payment Refactor.
                I will include the DB transaction for COD only here to maintain existing functionality.
             */
             DB::beginTransaction();

             try {
                $createdOrderIds = [];

                foreach ($cart->items as $item) {
                    $product = $item->product;
                    if (!$product) continue;
                    $order = Order::create([
                        'merchant_order_id'          => $merchantOrderId,
                        'productid'                  => $product->id,
                        'userid'                     => $user->id,
                        'username'                   => $request->name ?? $user->name ?? '',
                        'userphone'                  => $request->phone ?? $user->phone ?? '',
                        'latitude'                   => $request->latitude ?? $user->latitude ?? 0,
                        'longitude'                  => $request->longitude ?? $user->longitude ?? 0,
                        'useraddress'                => ("المدينة: " . ($request->cityName ?? $user->city_id ?? '') . ", المنطقة: " . ($request->areaName ?? $user->area_id ?? '') . ", قطعة: " . ($request->block ?? $user->block ?? '') . ", شارع: " . ($request->street ?? $user->street ?? '') . ", قسيمة/بناية: " . ($request->building ?? $user->building ?? '')),
                        'totalprice'                 => ($item->price * $item->quantity) ?? 0,
                        'typepay'                    => 'delivery',
                        'order_source'               => 'Web',
                        'status'                     => 1, // COD is active immediately
                        'date_receipt'               => '',
                        'name'                       => $product->name ?? '',
                        'nameen'                     => $product->nameen ?? $product->name_en ?? '',
                        'isactive'                   => $product->isactive ?? 1,
                        'description'                => $product->description ?? '',
                        'descriptionen'              => $product->descriptionen ?? $product->description_en ?? '',
                        'price'                      => $product->price ?? 0,
                        'price_old'                  => $product->price_old ?? 0,
                        'price_sale'                 => $product->price_sale ?? 0,
                        'price_active'               => $product->price_active ?? 0,
                        'sub_sub_category_id'        => $product->sub_sub_category_id ?? 0,
                        'category_id'                => $product->category_id ?? 0,
                        'sub_category_id'            => $product->sub_category_id ?? 0,
                        'rating'                     => $product->rating ?? 0,
                        'view'                       => $product->view ?? 0,
                        'images'                     => $product->images ?? '',
                        'date'                       => now(),
                        'userinsert'                 => $product->userinsert ?? '',
                        'iduserinsert'               => $product->iduserinsert ?? 0,
                        'iduserupdate'               => $product->iduserupdate ?? 0,
                        'barcode'                    => $product->barcode ?? '',
                        'number'                     => $product->number ?? '',
                        'serialnumber'               => $product->serialnumber ?? '',
                        'memorysize'                 => $product->memorysize ?? '',
                        'ramsize'                    => $product->ramsize ?? '',
                        'colorar'                    => $product->colorar ?? '',
                        'coloren'                    => $product->coloren ?? '',
                        'device_status'              => $product->device_status ?? '',
                        'device_clean'               => $product->device_clean ?? '',
                        'device_body'                => $product->device_body ?? '',
                        'device_display'             => $product->device_display ?? '',
                        'device_button'              => $product->device_button ?? '',
                        'device_camera'              => $product->device_camera ?? '',
                        'device_wifi_blu'            => $product->device_wifi_blu ?? '',
                        'device_battery'             => $product->device_battery ?? '',
                        'device_fingerprint'         => $product->device_fingerprint ?? '',
                        'device_speaker'             => $product->device_speaker ?? '',
                        'device_box'                 => $product->device_box ?? '',
                        'note'                       => "Cart-" . $cart->id . "-" . time(),
                        'gift'                       => $product->gift ?? '',
                        'customer_name'              => $request->name ?? $user->name ?? '',
                        'customer_phone'             => $request->phone ?? $user->phone ?? '',
                        'customer_price'             => $product->customer_price ?? 0,
                        'customer_approved'          => $product->customer_approved ?? 0,
                        'customer_approved_name'     => $product->customer_approved_name ?? '',
                        'vender_money_received'      => $product->vender_money_received ?? '',
                        'vender_money_received_name' => $product->vender_money_received_name ?? '',
                        'product_active_new'         => $product->product_active_new ?? 0,
                        'fast_by'                    => $product->fast_by ?? 0,
                        'slug'                       => $product->slug ?? '',
                    ]);
                    $createdOrderIds[] = $order->id;
                    
                    // Delete from all carts and favorites before deleting product
                    CartItem::where('product_id', $product->id)->delete();
                    FavoriteItem::where('product_id', $product->id)->delete();
                    
                    $product->delete();
                }
                $cart->items()->delete();
                DB::commit();

                // Send WhatsApp Notification to Customer
                $customerPhone = $request->phone ?? $user->phone ?? null;
                if ($customerPhone) {
                    $message = "شكراً لطلبك من *كالجديد*! 🔔\n\n";
                    $message .= "تم استلام طلبك (الدفع عند الاستلام) بنجاح وجاري معالجته.\n\n";
                    $message .= "📍 *تفاصيل الطلب:*\n";
                    $message .= "• *مرجع الطلب:* {$merchantOrderId}\n";
                    $message .= "• *العنوان:* " . ("City: " . ($request->cityName ?? $user->city_id ?? '') . ", Area: " . ($request->areaName ?? $user->area_id ?? '')) . "\n\n";
                    $message .= "📦 *المنتجات:*\n";
                    
                    foreach ($cart->items as $item) {
                        if ($item->product) {
                            $message .= "- {$item->product->name} (Qty: {$item->quantity}) - " . ($item->price * $item->quantity) . " K.D\n";
                        }
                    }
                    
                    $message .= "\n💰 *الإجمالي:* {$amount} K.D\n\n";
                    $message .= "شكراً لثقتك بنا! نتمنى لك يوماً سعيداً.";
                    $this->waSender->sendTextMessage($customerPhone, $message);
                }

                return response()->json(['success' => true, 'url' => null]); 
             } catch (\Exception $e) {
                 DB::rollBack();
                 return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
             }
        }

        // --- MyFatoorah Online Payment Refactor ---


        // Prepare Cache Data
        $cacheData = [
            'merchant_order_id' => $merchantOrderId,
            'user_id'           => $user->id,
            'cart_id'           => $cart->id,
            'amount'            => $amount,
            'type_pay'          => $typePayDB,
            'customer_name'     => $request->name ?? $user->name,
            'customer_phone'    => $request->phone ?? $user->phone,
            'customer_email'    => $user->email ?? '',
            'user_address_str'  => "المدينة: " . ($request->cityName ?? $user->city_id) . 
                                   ", المنطقة: " . ($request->areaName ?? $user->area_id) .
                                   ", قطعة: " . ($request->block ?? $user->block) .
                                   ", شارع: " . ($request->street ?? $user->street) .
                                   ", قسيمة/بناية: " . ($request->building ?? $user->building),
            'latitude'          => $request->latitude ?? $user->latitude,
            'longitude'         => $request->longitude ?? $user->longitude,
            'items'             => [],
            'created_at'        => now(),
        ];

        // Snapshot items
        foreach ($cart->items as $item) {
            $product = $item->product;
            if ($product) {
                $cacheData['items'][] = [
                    'product_id' => $product->id,
                    'price'      => $item->price,
                    'quantity'   => $item->quantity,
                    // Store minimal needed to recreate or fetch fresh? 
                    // Fetching fresh in callback is safer for integrity, but if price changes?
                    // We'll stick to fetching product by ID in callback to ensure data consistency, 
                    // but we trust the price we charged.
                ];
            }
        }

        // Cache for 30 minutes
        \Illuminate\Support\Facades\Cache::put('myfatoorah_order_' . $merchantOrderId, $cacheData, now()->addMinutes(30));

        // Prepare Gateway Payload
        $data = [
            "CustomerName"       => $cacheData['customer_name'],
            "NotificationOption" => "LNK",
            "InvoiceValue"       => $amount, 
            "CallBackUrl"        => route('myfatoorah.callback'), 
            "ErrorUrl"           => route('myfatoorah.failure'),
            "Language"           => "en",
            "CustomerEmail"      => $cacheData['customer_email'],
            "DisplayCurrencyIso" => "EGP",
            "CustomerReference"  => $merchantOrderId, // Use UUID
            "UserDefinedField"   => $merchantOrderId,
        ];

        if ($gatewayPaymentMethodId) {
            $data['PaymentMethodId'] = $gatewayPaymentMethodId;
        }

        try {
            if ($gatewayPaymentMethodId) {
                $response = $this->myFatoorah->executePayment($data);
                if (isset($response['IsSuccess']) && $response['IsSuccess'] === true && isset($response['Data']['PaymentURL'])) {
                     return response()->json(['success' => true, 'url' => $response['Data']['PaymentURL']]);
                }
            } else {
                $response = $this->myFatoorah->sendPayment($data);
                if (isset($response['IsSuccess']) && $response['IsSuccess'] === true && isset($response['Data']['InvoiceURL'])) {
                    return response()->json(['success' => true, 'url' => $response['Data']['InvoiceURL']]);
                }
            }

            return response()->json(['success' => false, 'message' => $response['Message'] ?? 'Gateway Error']);

        } catch (\Exception $e) {
             return response()->json(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    // Handle Callback (Success)
    public function callback(Request $request)
    {
        $paymentId = $request->input('paymentId');
        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');

        if (!$paymentId) {
             return redirect()->away("$frontendUrl/payment-failed?error=no_payment_id");
        }

        $response = $this->myFatoorah->getPaymentStatus($paymentId);

        if (!isset($response['IsSuccess']) || !$response['IsSuccess'] || !isset($response['Data']['InvoiceStatus'])) {
             return redirect()->away("$frontendUrl/payment-failed?error=invalid_status_response");
        }

        // Get Reference (UUID)
        $merchantOrderId = $response['Data']['UserDefinedField'] ?? $response['Data']['CustomerReference'] ?? null;

        if (!$merchantOrderId) {
             return redirect()->away("$frontendUrl/payment-failed?error=no_reference");
        }

        // Check if Paid
        if ($response['Data']['InvoiceStatus'] !== 'Paid') {
             return redirect()->away("$frontendUrl/payment-failed?status=" . $response['Data']['InvoiceStatus']);
        }

        // Retrieve from Cache
        $cacheData = \Illuminate\Support\Facades\Cache::get('myfatoorah_order_' . $merchantOrderId);

        if (!$cacheData) {
            // Edge case: Cache expired, but payment paid. 
            // In a real prod environment, you might log this heavily or have a backup mechanism.
            // For now, fail safely.
            Log::error("MyFatoorah Cache Expired for Paid Order: $merchantOrderId");
            return redirect()->away("$frontendUrl/payment-failed?error=order_expired");
        }

        // Prevent Duplicate: Check if order with this merchant_order_id exists
        // Since we might have multiple items, we check usage of this merchant_order_id
        if (Order::where('merchant_order_id', $merchantOrderId)->exists()) {
             // Already processed
             $firstOrder = Order::where('merchant_order_id', $merchantOrderId)->first();
             return redirect()->away("$frontendUrl/payment-success?order_id=" . $firstOrder->id);
        }

        // Create Orders
        $createdFirstId = null;
        $orderNote = "Cart-" . $cacheData['cart_id'] . "-" . time();

        DB::beginTransaction();
        try {
            foreach ($cacheData['items'] as $itemData) {
                $product = Product::find($itemData['product_id']);
                if (!$product) continue;

                $order = Order::create([
                    'merchant_order_id'          => $merchantOrderId,
                    'productid'                  => $product->id,
                    'userid'                     => $cacheData['user_id'] ?? 0,
                    'username'                   => $cacheData['customer_name'] ?? '',
                    'userphone'                  => $cacheData['customer_phone'] ?? '',
                    'latitude'                   => $cacheData['latitude'] ?? 0,
                    'longitude'                  => $cacheData['longitude'] ?? 0,
                    'useraddress'                => $cacheData['user_address_str'] ?? '',
                    'totalprice'                 => ($itemData['price'] * $itemData['quantity']) ?? 0,
                    'typepay'                    => $cacheData['type_pay'] ?? '',
                    'order_source'               => 'Web',
                    'status'                     => 1, // PAID
                    'date_receipt'               => now(),
                    'name'                       => $product->name ?? '',
                    'nameen'                     => $product->nameen ?? '',
                    'isactive'                   => $product->isactive ?? 1,
                    'description'                => $product->description ?? '',
                    'descriptionen'              => $product->descriptionen ?? '',
                    'price'                      => $product->price ?? 0,
                    'price_old'                  => $product->price_old ?? 0,
                    'price_sale'                 => $product->price_sale ?? 0,
                    'price_active'               => $product->price_active ?? 0,
                    'sub_sub_category_id'        => $product->sub_sub_category_id ?? 0,
                    'category_id'                => $product->category_id ?? 0,
                    'sub_category_id'            => $product->sub_category_id ?? 0,
                    'rating'                     => $product->rating ?? 0,
                    'view'                       => $product->view ?? 0,
                    'images'                     => $product->images ?? '',
                    'date'                       => $product->date ?? now(),
                    'userinsert'                 => $product->userinsert ?? '',
                    'iduserinsert'               => $product->iduserinsert ?? 0,
                    'iduserupdate'               => $product->iduserupdate ?? 0,
                    'barcode'                    => $product->barcode ?? '',
                    'number'                     => $product->number ?? '',
                    'serialnumber'               => $product->serialnumber ?? '',
                    'memorysize'                 => $product->memorysize ?? '',
                    'ramsize'                    => $product->ramsize ?? '',
                    'colorar'                    => $product->colorar ?? '',
                    'coloren'                    => $product->coloren ?? '',
                    'device_status'              => $product->device_status ?? '',
                    'device_clean'               => $product->device_clean ?? '',
                    'device_body'                => $product->device_body ?? '',
                    'device_display'             => $product->device_display ?? '',
                    'device_button'              => $product->device_button ?? '',
                    'device_camera'              => $product->device_camera ?? '',
                    'device_wifi_blu'            => $product->device_wifi_blu ?? '',
                    'device_battery'             => $product->device_battery ?? '',
                    'device_fingerprint'         => $product->device_fingerprint ?? '',
                    'device_speaker'             => $product->device_speaker ?? '',
                    'device_box'                 => $product->device_box ?? '',
                    'note'                       => $orderNote, // System Note with Cart ID
                    'gift'                       => $product->gift ?? '',
                    'customer_name'              => $cacheData['customer_name'] ?? '',
                    'customer_phone'             => $cacheData['customer_phone'] ?? '',
                    'customer_price'             => $product->customer_price ?? 0,
                    'customer_approved'          => $product->customer_approved ?? 0,
                    'customer_approved_name'     => $product->customer_approved_name ?? '',
                    'vender_money_received'      => $product->vender_money_received ?? '',
                    'vender_money_received_name' => $product->vender_money_received_name ?? '',
                    'product_active_new'         => $product->product_active_new ?? 0,
                    'fast_by'                    => $product->fast_by ?? 0,
                    'slug'                       => $product->slug ?? '',
                ]);

                if (!$createdFirstId) $createdFirstId = $order->id;

                // Delete from all carts and favorites before deleting product
                CartItem::where('product_id', $product->id)->delete();
                FavoriteItem::where('product_id', $product->id)->delete();

                $product->delete();
            }

            // Clear Cart
            Cart::where('id', $cacheData['cart_id'])->delete(); // Or items()->delete()

            DB::commit();

            // Clear Cache
            \Illuminate\Support\Facades\Cache::forget('myfatoorah_order_' . $merchantOrderId);

            // Send WhatsApp Notification to Customer
            $customerPhone = $cacheData['customer_phone'] ?? null;
            if ($customerPhone) {
                $message = "شكراً لطلبك من *كالجديد*! 🔔\n\n";
                $message .= "تم استلام طلبك (دفع أونلاين) بنجاح وجاري معالجته.\n\n";
                $message .= "📍 *التفاصيل:*\n";
                $message .= "• *مرجع الدفع:* {$paymentId}\n";
                $message .= "• *العنوان:* " . ($cacheData['user_address_str'] ?? 'غير معروف') . "\n\n";
                $message .= "📦 *المنتجات:*\n";
                
                foreach ($cacheData['items'] as $itemData) {
                    $p = Product::find($itemData['product_id']);
                    if ($p) {
                        $message .= "- {$p->name} (Qty: {$itemData['quantity']}) - " . ($itemData['price'] * $itemData['quantity']) . " K.D\n";
                    }
                }
                
                $message .= "\n💰 *الإجمالي:* {$cacheData['amount']} K.D\n\n";
                $message .= "شكراً لثقتك بنا! نتمنى لك يوماً سعيداً.";
                $this->waSender->sendTextMessage($customerPhone, $message);
            }

            return redirect()->away("$frontendUrl/payment-success?order_id=" . $createdFirstId);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("MyFatoorah Order Creation Failed: " . $e->getMessage());
            return redirect()->away("$frontendUrl/payment-failed?error=creation_failed");
        }
    }

    // Handle Failure
    public function failure(Request $request)
    {
        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');
        
        // Attempt to clean up order if paymentId is present
        $paymentId = $request->input('paymentId');
        if ($paymentId) {
            try {
                $response = $this->myFatoorah->getPaymentStatus($paymentId);
                $orderId = $response['Data']['UserDefinedField'] ?? $response['Data']['CustomerReference'] ?? null;
                
                if ($orderId) {
                    $order = Order::find($orderId);
                    if ($order) {
                        if ($order->note && str_starts_with($order->note, "Cart-")) {
                            Order::where('note', $order->note)->delete();
                        } else {
                            $order->delete();
                        }
                    }
                }
            } catch (\Exception $e) {
                // Ignore errors during failure cleanup
                Log::error("Failed to cleanup order in failure callback: " . $e->getMessage());
            }
        }

        return redirect()->away("$frontendUrl/payment-failed?error=payment_failed_callback");
    }

    // Check Status API
    public function status(Request $request)
    {
        $paymentId = $request->input('paymentId') ?? $request->input('invoiceId');

        if (!$paymentId) {
            return response()->json(['message' => 'Payment ID is required'], 400);
        }

        $response = $this->myFatoorah->getPaymentStatus($paymentId);

        return response()->json($response);
    }
   
    // Get Payment Methods (Filtered)
    public function getPaymentMethods(Request $request)
    {
        $user = $request->user('sanctum'); // Try to get user if authenticated
        $amount = 0;

        if ($user) {
             $cart = Cart::where('user_id', $user->id)
                         ->where('status', 'active')
                         ->first();
             if ($cart) {
                 $amount = $cart->total();
             }
        }
        
        if ($amount <= 0) {
             $amount = $request->input('amount', 0);
        }

        // If still 0, maybe default to 10 just to get the methods (some gateways require > 0)
        if ($amount <= 0) $amount = 10; 

        $currency = $request->input('currency', 'KWD');

        $response = $this->myFatoorah->initiatePayment($amount, $currency);

        if (!isset($response['IsSuccess']) || !$response['IsSuccess']) {
             return response()->json(['success' => false, 'message' => $response['Message'] ?? 'Failed to fetch methods']);
        }

        $methods = $response['Data']['PaymentMethods'] ?? [];
        
        $filteredMethods = array_filter($methods, function($method) {
            $name = strtoupper($method['PaymentMethodEn']);
            return str_contains($name, 'KNET') || str_contains($name, 'VISA') || str_contains($name, 'MASTER');
        });

        return response()->json([
            'success' => true,
            'data' => [
                'PaymentMethods' => array_values($filteredMethods)
            ]
        ]);
    }
}
