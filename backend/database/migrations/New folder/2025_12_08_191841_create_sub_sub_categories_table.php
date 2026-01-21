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
        Schema::create('sub_sub_categories', function (Blueprint $table) {
            $table->id();

            $table->string('name');
            $table->string('nameen');
            $table->unsignedBigInteger('category_id');      // category
            $table->unsignedBigInteger('sub_category_id');  // sub_category
            $table->decimal('price', 10, 2)->default(0);

            $table->timestamps();

            // العلاقات
            $table->foreign('category_id')
                ->references('id')
                ->on('categories')
                ->cascadeOnDelete();

            $table->foreign('sub_category_id')
                ->references('id')
                ->on('sub_categories')
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sub_sub_categories');
    }
};
