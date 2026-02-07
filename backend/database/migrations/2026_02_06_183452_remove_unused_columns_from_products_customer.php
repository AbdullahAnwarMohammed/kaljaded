<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;


return new class extends Migration {
    public function up(): void
    {
        Schema::table('products_customer', function (Blueprint $table) {

            $columns = [
                'descriptionen',
                'nameen',
                'price_old',
                'price_sale',
                'price_active',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('products_customer', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }

    public function down(): void
    {
        Schema::table('products_customer', function (Blueprint $table) {

            // رجوع الأعمدة في حالة rollback
            $table->text('descriptionen')->nullable();
            $table->string('nameen')->nullable();
            $table->decimal('price_old', 10, 2)->nullable();
            $table->decimal('price_sale', 10, 2)->nullable();
            $table->boolean('price_active')->default(true);
        });
    }
};