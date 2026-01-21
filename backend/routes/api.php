<?php

use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PaymentDemaController;
use App\Http\Controllers\Api\User\AuthController;
use App\Http\Controllers\Api\User\BannerController;
use App\Http\Controllers\Api\User\CartController;
use App\Http\Controllers\Api\User\CategoryController;
use App\Http\Controllers\Api\User\FavoriteController;
use App\Http\Controllers\Api\User\MerchantController;
use App\Http\Controllers\Api\User\ProductController;
use App\Http\Controllers\Api\User\SettingContorller;
use App\Http\Controllers\Api\User\LocationController;
use App\Http\Controllers\Api\PaymentMyFatoorahController;
use Illuminate\Support\Facades\Route;



Route::middleware('SetLanguageFromHeader')->group(function () {



    Route::prefix("user")->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::middleware('auth:sanctum')->get('/profile', [AuthController::class, 'profile']);
        Route::middleware('auth:sanctum')->post('/profile/update', [AuthController::class, 'updateProfile']);


        // Settings
        Route::get("settings", SettingContorller::class);

        // Location
        Route::get('/cities', [LocationController::class, 'getCities']);
        Route::get('/areas/{city_id}', [LocationController::class, 'getAreas']);

        // Categories
        Route::get("/categories", [CategoryController::class, 'all']);
        Route::get('/categories-with-products', [CategoryController::class, 'CategoryWithProduct']);
        Route::get('/categories/products/active/{slug?}', [CategoryController::class, 'getBySlugActivePrice']);
        Route::get('/categories/products/{slug?}', [CategoryController::class, 'getBySlug']);


        // Merchants
        Route::get('merchants/{slug}', [MerchantController::class, 'show']);

        Route::get("merchants", [MerchantController::class, 'index']);
        Route::get("merchants/{slug}/products", [MerchantController::class, 'products']);

        Route::get("/banners", [BannerController::class, 'all']);

        Route::get('/products', [ProductController::class, 'index']);
        Route::get('/products/showBySlug/{slug}', [ProductController::class, 'showBySlug']);
        Route::get('/products/{id}', [ProductController::class, 'show'])->where('id', '[0-9]+');
        Route::get('/products/search', [ProductController::class, 'search']);
       Route::get('/products/installments/{slug?}', [ProductController::class, 'installments']);

        Route::prefix('cart')
            ->middleware('optional.sanctum')
            ->group(function () {
                Route::get('/', [CartController::class, 'index']);
                Route::post('/items', [CartController::class, 'store']);
                Route::put('/items/{cartItem}', [CartController::class, 'update']);
                Route::delete('/items/{cartItem}', [CartController::class, 'destroy']);
            });

        Route::prefix('favorites')
            ->middleware('optional.sanctum')
            ->group(function () {
                Route::get('/', [FavoriteController::class, 'index']);
                Route::post('/items', [FavoriteController::class, 'store']);
                Route::delete('/items/{favoriteItem}', [FavoriteController::class, 'destroy']);
            });

        Route::middleware('auth:sanctum')->post('/cart/merge', [CartController::class, 'mergeGuestCart']);
        Route::middleware('auth:sanctum')->post('/favorites/merge', [FavoriteController::class, 'mergeGuestFavorite']);


        Route::middleware('auth:sanctum')->post(
            '/payment/deema/checkout',
            [PaymentDemaController::class, 'checkout']
        );

        Route::prefix('payment/deema')->group(function () {
            Route::get('/success', [PaymentDemaController::class, 'success'])->name('deema.success');
            Route::get('/failure', [PaymentDemaController::class, 'failure'])->name('deema.failure');
            Route::get('/status', [PaymentDemaController::class, 'status']);
        });



        Route::prefix('payment/myfatoorah')->middleware('auth:sanctum')->group(function () {
            Route::post('/checkout', [PaymentMyFatoorahController::class, 'checkout']);
        });

        Route::prefix('payment/myfatoorah')->group(function () {
            Route::match(['get', 'post'], '/callback', [PaymentMyFatoorahController::class, 'callback'])->name('myfatoorah.callback');
            Route::match(['get', 'post'], '/failure', [PaymentMyFatoorahController::class, 'failure'])->name('myfatoorah.failure');
            Route::get('/initiate', [PaymentMyFatoorahController::class, 'getPaymentMethods']);
            Route::get('/status', [PaymentMyFatoorahController::class, 'status'])->middleware('auth:sanctum');
        });

    });
});
