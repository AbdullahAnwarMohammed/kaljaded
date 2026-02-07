<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('product_customer_offers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('merchant_id'); // From merchants table? or users? Assuming merchants.
            $table->unsignedBigInteger('user_id'); // Customer (owner)
            $table->unsignedBigInteger('product_customer_id'); // The product
            $table->decimal('price', 10, 3);
            $table->tinyInteger('status')->default(0); // 0: Pending, 1: Accepted, 2: Rejected (User asked for 'accept', usually mapped to status)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_customer_offers');
    }
};
