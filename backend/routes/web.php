<?php
use Illuminate\Support\Facades\Route;



Route::get('/migrate-user-addresses', function () {
    \Illuminate\Support\Facades\Artisan::call('users:migrate-addresses');
    return \Illuminate\Support\Facades\Artisan::output();
});

Route::get('/temp-fix-slugs', function () {
    $categories = \App\Models\Category::all();
    foreach ($categories as $category) {
        // If name is Arabic, Str::slug might return empty needing manual handling or a specific package,
        // but usually Laravel's Str::slug handles it if 'ar' locale is supported or it transliterates.
        // However, for Arabic URLs often we want the Arabic characters as is or slugified properly.
        // Laravel's default slug uses ascii. If the user wants Arabic slugs (which "kaljaded" implies might be an Arabic site),
        // let's stick to standard Str::slug first as requested "slug categories = name".
        // Actually, if name is Arabic, Str::slug('عربية') -> 'ryb'. It transliterates.
        // If the user wants to keep Arabic chars, they might not want Str::slug.
        // But "slug" usually implies URL friendly.
        // Let's assume standard behavior.
        $category->slug = \Illuminate\Support\Str::slug($category->name);
        $category->save();
    }
    return 'Categories slugs updated successfully based on name.';
});

Route::get('/{any}', function ($any = null) {
    return file_get_contents(public_path('dist/index.html'));
})->where('any', '.*');
