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
        Schema::create('product_customer_details', function (Blueprint $table) {
            $table->id();
            $table->integer('product_customer_id');
            $table->foreign('product_customer_id')->references('id')->on('products_customer')->onDelete('cascade');
            $table->string('device_clean')->nullable(); // نظافة الجهاز
            $table->string('device_body')->nullable(); // خدوش جسم الجهاز
            $table->string('device_display')->nullable(); // خدوش الشاشة
            $table->string('device_button')->nullable(); // زر التشغيل-رفع/خفض الصوت 1,0
            $table->string('device_camera')->nullable(); // وظائف حساسات الكاميرا 1,0
            $table->string('device_wifi')->nullable(); // الواي فاي 1,0
            $table->string('device_bluetooth')->nullable(); // البلوتوث 1,0
            $table->string('device_gps')->nullable(); // Gps 1,0
            $table->string('device_sensors')->nullable(); // السنسرات 1,0
            $table->string('device_battery')->nullable(); // البطارية ونسبة الاستهلاك {Number}
            $table->string('device_fingerprint')->nullable(); // بصمة الوجه 0,1
            $table->string('device_speaker')->nullable(); // السماعية الخارجية تعمل ام لا 1,0
            $table->string('device_box')->nullable(); // مع كارتون او بدون 1,0
            $table->string('device_opened')->nullable(); // تم فتحة ام لا  1,0
            $table->string('device_usage')->nullable(); // مدة الاستخدام
            $table->string('device_condition')->nullable(); // حالة الجهاز (كالجديد، ممتاز ...)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_customer_details');
    }
};
