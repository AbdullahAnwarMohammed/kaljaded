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

Route::get('/export-db', function () {

    try {
        $tables = \Illuminate\Support\Facades\DB::select('SHOW TABLES');
        $dbName = config('database.connections.mysql.database');
        $tableKey = "Tables_in_" . $dbName;
        
        $sql = "-- Database Export: " . $dbName . "\n";
        $sql .= "-- Date: " . date('Y-m-d H:i:s') . "\n\n";
        $sql .= "SET FOREIGN_KEY_CHECKS=0;\n\n";

        foreach ($tables as $table) {
            $tableName = $table->$tableKey;
            
            // Get Create Table
            $createTable = \Illuminate\Support\Facades\DB::select("SHOW CREATE TABLE `{$tableName}`")[0];
            $sql .= "\n-- Table structure for `{$tableName}`\n";
            $sql .= "DROP TABLE IF EXISTS `{$tableName}`;\n";
            $sql .= ((array)$createTable)['Create Table'] . ";\n\n";

            // Get Data
            $rows = \Illuminate\Support\Facades\DB::table($tableName)->get();
            if ($rows->count() > 0) {
                $sql .= "-- Dumping data for `{$tableName}`\n";
                foreach ($rows as $row) {
                    $rowArray = (array)$row;
                    $columns = array_keys($rowArray);
                    $values = array_values($rowArray);
                    
                    $escapedValues = array_map(function($val) {
                        if (is_null($val)) return 'NULL';
                        return "'" . addslashes($val) . "'";
                    }, $values);

                    $sql .= "INSERT INTO `{$tableName}` (`" . implode("`, `", $columns) . "`) VALUES (" . implode(", ", $escapedValues) . ");\n";
                }
            }
            $sql .= "\n";
        }

        $sql .= "SET FOREIGN_KEY_CHECKS=1;\n";

        $fileName = $dbName . '_' . date('Y-m-d_H-i-s') . '.sql';

        return response($sql)
            ->header('Content-Type', 'application/sql')
            ->header('Content-Disposition', "attachment; filename=\"{$fileName}\"");
            
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

// Route::get('/{any}', function ($any = null) {
//     return file_get_contents(public_path('dist/index.html'));
// })->where('any', '.*');
