<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'latitude')) {
                $table->decimal('latitude', 10, 8)->nullable();
            }
            if (!Schema::hasColumn('orders', 'longitude')) {
                $table->decimal('longitude', 11, 8)->nullable();
            }
            if (!Schema::hasColumn('orders', 'note')) {
                $table->text('note')->nullable();
            }
            if (!Schema::hasColumn('orders', 'username')) {
                $table->string('username')->nullable();
            }
            if (!Schema::hasColumn('orders', 'userphone')) {
                $table->string('userphone')->nullable();
            }
            if (!Schema::hasColumn('orders', 'useraddress')) {
                $table->text('useraddress')->nullable();
            }
            // Ensure status is integer if not already
            // We assume it exists as per user context, but 'typepay' was confirmed.
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['latitude', 'longitude', 'note', 'username', 'userphone', 'useraddress']);
        });
    }
};
