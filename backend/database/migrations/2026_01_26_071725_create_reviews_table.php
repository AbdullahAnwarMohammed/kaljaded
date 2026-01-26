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
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id'); // Reviewer
            $table->unsignedBigInteger('merchant_id'); // Merchant
            $table->unsignedBigInteger('order_id')->nullable(); // Optional: Link to order
            $table->tinyInteger('rating')->unsigned(); // 1-5
            $table->text('comment')->nullable();
            
            $table->timestamps();

            // Foreign keys (assuming users table exists)
            // $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            // $table->foreign('merchant_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
