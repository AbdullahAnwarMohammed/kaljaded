<?php
use Illuminate\Support\Facades\Route;



Route::get('/migrate-user-addresses', function () {
    \Illuminate\Support\Facades\Artisan::call('users:migrate-addresses');
    return \Illuminate\Support\Facades\Artisan::output();
});

Route::get('/temp-fix-slugs', function () {
    $categories = \App\Models\Category::all();
    foreach ($categories as $category) {
        $category->slug = \Illuminate\Support\Str::slug($category->name);
        $category->save();
    }

    return 'Categories slugs updated successfully based on name.';
});

Route::get('/update-db-images-main', function () {
    \Illuminate\Support\Facades\DB::statement("UPDATE banners SET image = REGEXP_REPLACE(image, '\\\\.(jpg|jpeg|png|gif)$', '.webp') WHERE image NOT LIKE '%.webp'");
    \Illuminate\Support\Facades\DB::statement("UPDATE users SET image = REGEXP_REPLACE(image, '\\\\.(jpg|jpeg|png|gif)$', '.webp') WHERE image NOT LIKE '%.webp'");
    \Illuminate\Support\Facades\DB::statement("UPDATE users SET image_vendor = REGEXP_REPLACE(image_vendor, '\\\\.(jpg|jpeg|png|gif)$', '.webp') WHERE image_vendor NOT LIKE '%.webp'");
    \Illuminate\Support\Facades\DB::statement("UPDATE sub_categories SET image = REGEXP_REPLACE(image, '\\\\.(jpg|jpeg|png|gif)$', '.webp') WHERE image NOT LIKE '%.webp'");
    \Illuminate\Support\Facades\DB::statement("UPDATE products SET images = REGEXP_REPLACE(images, '\\\\.(jpg|jpeg|png)', '.webp') WHERE images REGEXP '\\\\.(jpg|jpeg|png)'");
    \Illuminate\Support\Facades\DB::statement("UPDATE orders SET images = REGEXP_REPLACE(images, '\\\\.(jpg|jpeg|png)', '.webp') WHERE images REGEXP '\\\\.(jpg|jpeg|png)'");
    \Illuminate\Support\Facades\DB::statement("UPDATE categories SET image = REGEXP_REPLACE(image, '\\\\.(jpg|jpeg|png|gif)$', '.webp') WHERE image NOT LIKE '%.webp'");

    return 'Database images updated to WebP successfully.';
});


// Route::get('/{any}', function ($any = null) {
//     return file_get_contents(public_path('dist/index.html'));
// })->where('any', '.*');
