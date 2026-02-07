<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('products_customer', function (Blueprint $table) {
            $columns = [
                'date',
                'ramsize',
                'device_status',
                'device_clean',
                'device_body',
                'device_display',
                'device_button',
                'device_camera',
                'device_wifi_blu',
                'device_battery',
                'device_fingerprint',
                'device_speaker',
                'device_box',
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
            $table->date('date')->nullable();
            $table->string('ramsize')->nullable();
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
        });
    }
};
