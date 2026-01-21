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
        Schema::create('product_category', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('nameen');
            // type = category_id
            $table->unsignedBigInteger('type');
            // category = sub_category_id
            $table->unsignedBigInteger('category');
            $table->decimal('price', 10, 2)->default(0);
            $table->timestamps();
            // علاقات
            $table->foreign('type')->references('id')->on('type')->cascadeOnDelete();
            $table->foreign('category')->references('id')->on('product_category')->cascadeOnDelete();

            $table->timestamps();
        });
    }


    public function down(): void
    {
        Schema::dropIfExists('type');
    }
};
