<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\User\Cart\CartResource;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CartController extends Controller
{
    use ApiResponseTrait;

    /**
     * View current cart
     */
    public function index(Request $request)
    {
        $cart = $this->resolveCart($request)
            ->load('items.product');

        return $this->successResponse([
            'cart' => new CartResource($cart),
        ]);
    }


    /**
     * Add product to cart
     */
    public function store(Request $request)
    {
        // التحقق من صحة البيانات
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'nullable|integer|min:1',
        ]);

        // جلب السلة والمنتج
        $cart     = $this->resolveCart($request);
        $product  = Product::findOrFail($request->product_id);
        $quantity = $request->quantity ?? 1;

        // استخدام transaction لضمان الأمان
        DB::transaction(function () use ($cart, $product, $quantity) {

            // تحقق إذا المنتج موجود بالسلة
            $item = $cart->items()->where('product_id', $product->id)->first();

            if ($item) {
                // إذا موجود بالفعل، نزود الكمية
                $item->update([
                    'quantity' => $item->quantity + $quantity,
                    'price'    => $product->price,
                ]);
            } else {
                // إذا غير موجود، ننشئ السطر بالكمية المطلوبة
                $cart->items()->create([
                    'product_id' => $product->id,
                    'quantity'   => $quantity,
                    'price'      => $product->price,
                ]);
            }
        });

        // إعادة تحميل السلة مع المنتجات
        $cart->load('items.product');

        // إعادة الاستجابة
        return $this->successResponse(
            [
                'cart' => new CartResource($cart),
            ],
            'cart.item_added',
            201
        );
    }


    /**
     * Update cart item quantity
     */
    public function update(Request $request, CartItem $cartItem)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $this->authorizeCartItem($request, $cartItem);

        $cartItem->update([
            'quantity' => $request->quantity,
        ]);

        $cart = $cartItem->cart->load('items.product');

        return $this->successResponse([
            'cart' => new CartResource($cart),
        ]);
    }

    /**
     * Remove item from cart
     */
    public function destroy(Request $request, CartItem $cartItem)
    {
        $this->authorizeCartItem($request, $cartItem);

        $cart = $cartItem->cart;
        $cartItem->delete();

        $cart->load('items.product');

        return $this->successResponse([
            'cart' => new CartResource($cart),
        ]);
    }

    /* =========================
       Helpers
       ========================= */

    protected function resolveCart(Request $request): Cart
    {

        // Auth user
        if (auth()->check()) {
            return Cart::firstOrCreate([
                'user_id' => auth()->id(),
                'status'  => 'active',
            ]);
        }

        // Guest
        $guestToken = $request->header('X-Guest-Token');

        if (!$guestToken) {
            $guestToken = Str::uuid()->toString();
        }

        return Cart::firstOrCreate([
            'guest_token' => $guestToken,
            'status'      => 'active',
        ]);
    }

    public function mergeGuestCart(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return $this->errorResponse('User not authenticated', 401);
        }

        $guestToken = $request->header('X-Guest-Token');


        $guestCart = Cart::where('guest_token', $guestToken)
            ->where('status', 'active')
            ->first();


        // تحقق لو فيه سلة موجودة مسبقاً للمستخدم
        $userCart = Cart::where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        DB::transaction(function () use ($guestCart, $userCart, $user) {
            if ($userCart) {
                foreach ($guestCart->items as $item) {
                    $existingItem = $userCart->items()->where('product_id', $item->product_id)->first();
                    if ($existingItem) {
                        // حذف المنتج الموجود في سلة المستخدم
                        $existingItem->delete();
                    } else {
                        // نقل المنتج من guestCart إلى userCart
                        $item->update([
                            'cart_id' => $userCart->id
                        ]);
                    }
                }

                // بعد الدمج، نحذف الـ guest cart
                $guestCart->delete();
            } else {
                // لو مفيش سلة للمستخدم، فقط نضيف user_id ونمسح guest_token
                $guestCart->update([
                    'guest_token' => null,
                    'user_id' => $user->id
                ]);
            }
        });


        $finalCart = Cart::where('user_id', $user->id)
            ->where('status', 'active')
            ->with('items.product')
            ->first();

        return $this->successResponse([
            'cart' => $finalCart,
            'total' => $finalCart->total(),
        ], 'cart.merged');
    }


    protected function authorizeCartItem(Request $request, CartItem $cartItem): void
    {
        $cart = $cartItem->cart;

        if (auth()->check()) {
            abort_if($cart->user_id !== auth()->id(), 403);
            return;
        }

        $guestToken = $request->header('X-Guest-Token');

        abort_if(
            !$guestToken || $cart->guest_token !== $guestToken,
            403
        );
    }
}
