<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('products_customer', function (Blueprint $table) {

            $columns = [
                'customer_name',
                'customer_phone',
                'customer_price',
                'customer_approved',
                'customer_approved_name',
                'barcode',
                'number',
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

            // إعادة الأعمدة في حالة rollback
            $table->string('customer_name')->nullable();
            $table->string('customer_phone')->nullable();
            $table->decimal('customer_price', 10, 2)->nullable();
            $table->boolean('customer_approved')->default(false);
            $table->string('customer_approved_name')->nullable();
            $table->string('barcode')->nullable();
            $table->integer('number')->nullable();
        });
    }
};
