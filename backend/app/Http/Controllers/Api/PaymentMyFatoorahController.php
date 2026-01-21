<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Cart;
use App\Models\Product;
use App\Services\MyFatoorahService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class PaymentMyFatoorahController extends Controller
{
    protected MyFatoorahService $myFatoorah;

    public function __construct(MyFatoorahService $myFatoorah)
    {
        $this->myFatoorah = $myFatoorah;
    }

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
        $items = $cart->items;
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
        if (!$gatewayPaymentMethodId) {
             $gatewayPaymentMethodId = match($paymentMethod) {
                'knet' => 1,
                'apple' => 24, 
                default => null
            };
        }
        
        $createdOrderIds = [];

        DB::beginTransaction();
        try {
            $groupNote = "Cart-" . $cart->id . "-" . time();
            
            // Status: 1 (Active) for COD, 0 (Pending) for Online
            $initialStatus = ($paymentMethod === 'cod') ? 1 : 0;

            foreach ($items as $item) {
                $product = $item->product;
                if (!$product) continue;
                $order = Order::create([
                    'productid'    => $product->id,
                    'userid'       => $user->id,
                    'totalprice'   => $item->price * $item->quantity,
                    'typepay'      => $typePayDB,
                    'status'       => $initialStatus,
                    'date_receipt' => now(),
                    'username'     => $request->name ?? $user->name,
                    'userphone'    => $request->phone ?? $user->phone,
                    'useraddress'  => "City: " . ($request->cityName ?? $user->city_id) . 
                                      ", Area: " . ($request->areaName ?? $user->area_id) .
                                      ", Block: " . ($request->block ?? $user->block) .
                                      ", Street: " . ($request->street ?? $user->street),
                    'latitude'     => $request->latitude ?? $user->latitude,
                    'longitude'    => $request->longitude ?? $user->longitude,

                    
                    'name'         => $product->name,
                    'nameen'       => $product->name_en,
                    'isactive'     => $product->active ?? 1,
                    'description'  => $product->description,
                    'descriptionen' => $product->description_en,
                    'price'        => $product->price,
                    'sub_sub_category_id' => $product->sub_sub_category_id,
                    'category_id'  => $product->category_id,
                    'sub_category_id' => $product->sub_category_id,
                    'rating'       => $product->rating ?? null,
                    'view'         => $product->view ?? 0,
                    'images'       => $product->images,
                    'date'         => now(),
                    'userinsert'   => $product->userinsert ?? null,
                    'iduserinsert' => $product->iduserinsert ?? null,
                    'iduserupdate' => $product->iduserupdate ?? null,
                    'barcode'      => $product->barcode,
                    'number'       => $product->number ?? null,
                    'serialnumber' => $product->serial_number,
                    'memorysize'   => $product->memory_size,
                    'ramsize'      => $product->ram_size,
                    'colorar'      => $product->color_arabic,
                    'coloren'      => $product->color_english,
                    'device_status' => $product->device_status,
                    'device_clean'  => $product->device_clean,
                    'device_body'   => $product->device_body,
                    'device_display' => $product->device_display,
                    'device_button' => $product->device_button,
                    'device_camera' => $product->device_camera,
                    'device_wifi_blu' => $product->device_wifi_blu,
                    'device_battery'  => $product->device_battery,
                    'device_fingerprint' => $product->device_fingerprint,
                    'device_speaker' => $product->device_speaker,
                    'device_box'    => $product->device_box ?? null,
                    'note'          => $groupNote,
                    'gift'          => $product->gift,
                    'fast_by'          => $product->fast_by,
                    // 'customer_name' => $request->name ?? $user->name, // Already handled in validation/snapshot?
                    'slug'          => $product->slug ?? null,
                    // 'customer_phone' => $request->phone ?? $user->phone, 
                    // 'customer_price' => $item->price * $item->quantity, // Matches totalprice?
                    'customer_approved' => 0,
                    // 'customer_approved_name' => null,
                    'product_active_new' => $product->product_active_new ?? true,
                ]);

                $createdOrderIds[] = $order->id;
            }

            // Only clear cart if COD
            if ($paymentMethod === 'cod') {
                $cart->items()->delete();
            }
            
            DB::commit();
            if ($paymentMethod === 'cod') {
                return response()->json(['success' => true, 'url' => null]); 
            } 
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Order creation failed: ' . $e->getMessage()], 500);
        }

        $mainOrderId = $createdOrderIds[0];

        $data = [
            "CustomerName"       => $request->name ?? $user->name,
            "NotificationOption" => "LNK",
            "InvoiceValue"       => $amount, 
            "CallBackUrl"        => route('myfatoorah.callback'), 
            "ErrorUrl"           => route('myfatoorah.failure'),
            "Language"           => "en",
            "CustomerEmail"      => $user->email ?? '',
            "DisplayCurrencyIso" => "KWD",
            "CustomerReference"  => $mainOrderId,
            "UserDefinedField"   => $mainOrderId,
        ];

        if ($gatewayPaymentMethodId) {
            $data['PaymentMethodId'] = $gatewayPaymentMethodId;
        }

        try {
            if ($gatewayPaymentMethodId) {
                $response = $this->myFatoorah->executePayment($data);
                
                if (isset($response['IsSuccess']) && $response['IsSuccess'] === true && isset($response['Data']['PaymentURL'])) {
                     return response()->json([
                        'success' => true,
                        'url' => $response['Data']['PaymentURL'] 
                    ]);
                }
            } else {
                $response = $this->myFatoorah->sendPayment($data);
                
                if (isset($response['IsSuccess']) && $response['IsSuccess'] === true && isset($response['Data']['InvoiceURL'])) {
                    return response()->json([
                        'success' => true,
                        'url' => $response['Data']['InvoiceURL'] // SendPayment returns InvoiceURL
                    ]);
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

        // Get Reference (Order ID)
        $orderId = $response['Data']['UserDefinedField'] ?? $response['Data']['CustomerReference'] ?? null;

        if (!$orderId) {
             return redirect()->away("$frontendUrl/payment-failed?error=no_reference");
        }

        // Find Order in Database
        $order = Order::find($orderId);
        
        if (!$order) {
            return redirect()->away("$frontendUrl/payment-failed?error=order_not_found&ref=$orderId");
        }

        if ($response['Data']['InvoiceStatus'] === 'Paid') {
            
            // Check if already paid
            if ($order->status == 1) {
                 return redirect()->away("$frontendUrl/payment-success?order_id=" . $order->id);
            }

            $order->update(['status' => 1]);
            if ($order->note && str_starts_with($order->note, "Cart-")) {
                 $relatedOrders = Order::where('note', $order->note)->get();
                 Order::where('note', $order->note)
                      ->where('status', 0)
                      ->update(['status' => 1]);
                 foreach ($relatedOrders as $relatedOrder) {
                     Product::where('id', $relatedOrder->productid)->delete();
                 }
                 // Clear cart after successful payment
                 $cart = Cart::where('user_id', $order->userid)->where('status', 'active')->first();
                 if($cart) {
                     $cart->items()->delete();
                 }
            } else {
                 Product::where('id', $order->productid)->delete();
            }
            return redirect()->away("$frontendUrl/payment-success?order_id=" . $order->id);
        }
        
        // If not paid (Failed, Expired)
        // Cleanup: Delete the temporary order(s)
        if ($order->note && str_starts_with($order->note, "Cart-")) {
             Order::where('note', $order->note)->delete();
        } else {
             $order->delete();
        }

        return redirect()->away("$frontendUrl/payment-failed?status=" . $response['Data']['InvoiceStatus']);
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
                \Log::error("Failed to cleanup order in failure callback: " . $e->getMessage());
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
