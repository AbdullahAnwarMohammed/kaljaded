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
        Schema::create('products', function (Blueprint $table) {
            $table->id();

            $table->string('name');
            $table->string('nameen');

            $table->boolean('isactive')->default(1);

            $table->text('description')->nullable();
            $table->text('descriptionen')->nullable();

            $table->decimal('price', 10, 2)->default(0);
            $table->decimal('price_old', 10, 2)->default(0);
            $table->decimal('price_sale', 10, 2)->default(0);
            $table->boolean('price_active')->default(0);

            $table->unsignedBigInteger('sub_category_id')->nullable();
            $table->unsignedBigInteger('category_id')->nullable();
            $table->unsignedBigInteger('sub_sub_category_id')->nullable();

            $table->float('rating', 3, 2)->default(0);
            $table->unsignedBigInteger('view')->default(0);

            $table->json('images')->nullable();

            $table->date('date')->nullable();

            $table->string('userinsert')->nullable();
            $table->unsignedBigInteger('iduserinsert')->nullable();
            $table->unsignedBigInteger('iduserupdate')->nullable();

            $table->string('barcode')->nullable();
            $table->string('number')->nullable();
            $table->string('serialnumber')->nullable();

            $table->string('memorysize')->nullable();
            $table->string('ramsize')->nullable();
            $table->string('colorar')->nullable();
            $table->string('coloren')->nullable();

            // Device details
            $table->string('device_status')->nullable();
            $table->string('device_clean')->nullable();
            $table->string('device_body')->nullable();
            $table->string('device_display')->nullable();
            $table->string('device_button')->nullable();
            $table->string('device_camera')->nullable();
            $table->string('device_wifi_blu')->nullable();
            $table->string('device_battery')->nullable();
            $table->string('device_fingerprint')->nullable();
            $table->string('device_speaker')->nullable();
            $table->string('device_box')->nullable();

            $table->text('note')->nullable();
            $table->string('gift')->nullable();

            // customer details
            $table->string('customer_name')->nullable();
            $table->string('customer_phone')->nullable();
            $table->decimal('customer_price', 10, 2)->default(0);

            $table->boolean('customer_approved')->default(0);
            $table->string('customer_approved_name')->nullable();

            $table->boolean('product_active_new')->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
