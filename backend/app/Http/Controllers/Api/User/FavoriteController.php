<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Http\Resources\Favorite\FavoriteResource;
use App\Models\Favorite;
use App\Models\FavoriteItem;
use App\Models\Product;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class FavoriteController extends Controller
{
    use ApiResponseTrait;

    /**
     * عرض المفضلة الحالية
     */
    public function index(Request $request)
    {
        $favorite = $this->resolveFavorite($request)
            ->load('items.product');

        return $this->successResponse([
            'favorite' => new FavoriteResource($favorite),
        ]);
    }

    /**
     * إضافة منتج للمفضلة
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $favorite = $this->resolveFavorite($request);
        $product  = Product::findOrFail($request->product_id);

        DB::transaction(function () use ($favorite, $product) {
            $favorite->items()->firstOrCreate([
                'product_id' => $product->id
            ]);
        });

        $favorite->load('items.product');

        return $this->successResponse([
            'favorite' => new FavoriteResource($favorite),
        ], 'favorite.item_added', 201);
    }

    /**
     * إزالة منتج من المفضلة
     */

    public function destroy(Request $request, FavoriteItem $favoriteItem)
    {
        $this->authorizeFavoriteItem($request, $favoriteItem);

        $favorite = $favoriteItem->favorite;
        $favoriteItem->delete();

        $favorite->load('items.product');

        return $this->successResponse([
            'favorite' => new FavoriteResource($favorite),
        ]);
    }

    /* =========================
       Helpers
       ========================= */

        protected function resolveFavorite(Request $request): Favorite
        {
            if (auth()->check()) {
                return Favorite::firstOrCreate([
                    'user_id' => auth()->id(),
                ]);
            }

            $guestToken = $request->header('X-Guest-Token') ?? Str::uuid()->toString();

            return Favorite::firstOrCreate([
                'guest_token' => $guestToken,
            ]);
        }

    /**
     * دمج المفضلة للضيف عند تسجيل الدخول
     */
    public function mergeGuestFavorite(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return $this->errorResponse('User not authenticated', 401);
        }

        $guestToken = $request->header('X-Guest-Token');
        if (!$guestToken) {
            return $this->successResponse(['message' => 'No guest favorite to merge']);
        }

        $guestFavorite = Favorite::where('guest_token', $guestToken)->first();

        if (!$guestFavorite) {
            return $this->successResponse(['message' => 'No guest favorite found']);
        }

        $userFavorite = Favorite::firstOrCreate(['user_id' => $user->id]);

        foreach ($guestFavorite->items as $item) {
            $userFavorite->items()->firstOrCreate([
                'product_id' => $item->product_id,
            ]);
        }

        $guestFavorite->delete();

        return $this->successResponse([
            'favorite' => $userFavorite->load('items.product'),
        ], 'favorite.merged');
    }

    protected function authorizeFavoriteItem(Request $request, FavoriteItem $favoriteItem): void
    {
        $favorite = $favoriteItem->favorite;

        if (auth()->check()) {
            abort_if($favorite->user_id !== auth()->id(), 403);
            return;
        }

        $guestToken = $request->header('X-Guest-Token');
        abort_if(!$guestToken || $favorite->guest_token !== $guestToken, 403);
    }
}
