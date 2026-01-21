<?php

namespace App\Providers;

use App\Models\Setting;
use Illuminate\Support\ServiceProvider;
use App\Interfaces\PaymentGatewayInterface;
use App\Services\MyFatoorahPaymentService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(PaymentGatewayInterface::class, MyFatoorahPaymentService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {

        // view()->composer('*', function ($view) {
        //     $view->with('Setting', Setting::first());
        // });
    }
}
