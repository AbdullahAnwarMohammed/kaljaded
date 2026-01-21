<?php

use App\Http\Controllers\Admin\Home\HomeController;
use App\Http\Controllers\Admin\Language\LanguageController;
use App\Http\Controllers\Admin\Role\RoleController;
use App\Http\Controllers\Admin\Setting\SettingController;
use App\Http\Controllers\Admin\Translation\TranslationController;
use App\Http\Controllers\TestController;
use Illuminate\Support\Facades\Route;

use Illuminate\Support\Facades\Artisan;


Route::get("/test",[TestController::class,'test']);
Route::prefix("dashboard")->as("admin.")->middleware('setLocale')->group(function () {

    // ------------------------ Moudel Permessions -------------------------
    Route::resource('roles', RoleController::class);



    // ------------------------ CHANGE LANGUAGE -------------------------
    Route::get('lang/{locale}', LanguageController::class);

    // ------------------------ Homepage -------------------------
    Route::get("/", [HomeController::class, 'home'])->name("home.index");
    // ------------------------ Moudel Translation -------------------------
    Route::resource('translations', TranslationController::class)->names('translations');
    // ------------------------ Moudel Settings -------------------------
    Route::prefix("settings")->as("settings.")->group(function () {
        Route::get("/", [SettingController::class, 'home'])->name("index");
        // صفحة الإعدادات الرئيسية
        Route::get('/admin/settings', [SettingController::class, 'home'])->name('admin.settings.home');

        // Fonts
        Route::put('/admin/settings/fonts', [SettingController::class, 'updatFontSetting'])->name('updatFontSetting');

        // Authentication
        Route::put('/admin/settings/authentication', [SettingController::class, 'updateAuthentication'])->name('updateAuthentication');

        // Notifications
        Route::put('/admin/settings/notifications', [SettingController::class, 'updateNotifications'])->name('updateNotifications');

        // Security
        Route::put('/admin/settings/security', [SettingController::class, 'updateSecurity'])->name('updateSecurity');

        // General
        Route::put('/admin/settings/general', [SettingController::class, 'updateGeneral'])->name('updateGeneral');

        // Appearance
        Route::put('/admin/settings/appearance', [SettingController::class, 'updateAppearance'])->name('updateAppearance');

        // Backup
        Route::put('/admin/settings/backup', [SettingController::class, 'updateBackup'])->name('updateBackup');

        // Developer
        Route::put('/admin/settings/developer', [SettingController::class, 'updateDeveloper'])->name('updateDeveloper');

        // Integrations
        Route::put('/admin/settings/integrations', [SettingController::class, 'updateIntegrations'])->name('updateIntegrations');
    });
});




Route::get('route-cache', function () {
    Artisan::call('route:cache');
    return 'Routes cached!';
})->name('maintenance.route.cache');

Route::get('route-clear', function () {
    Artisan::call('route:clear');
    return 'Route cache cleared!';
})->name('maintenance.route.clear');

Route::get('optimize', function () {
    Artisan::call('optimize');
    return 'Application optimized!';
})->name('maintenance.optimize');

Route::get('clear-bootstrap-cache', function () {
    array_map('unlink', glob(base_path('bootstrap/cache/*.php')));
    return 'Bootstrap cache cleared!';
})->name('maintenance.clear.bootstrap');
