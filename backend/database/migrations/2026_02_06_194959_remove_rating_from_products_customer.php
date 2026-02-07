<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;


return new class extends Migration {
    public function up(): void
    {
        Schema::table('products_customer', function (Blueprint $table) {
            if (Schema::hasColumn('products_customer', 'rating')) {
                $table->dropColumn('rating');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products_customer', function (Blueprint $table) {
            $table->decimal('rating', 3, 2)->nullable(); // تعديل النوع حسب اللي كان موجود
        });
    }
};
