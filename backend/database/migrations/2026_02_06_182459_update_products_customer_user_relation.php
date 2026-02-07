<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('products_customer', function (Blueprint $table) {

            // حذف الأعمدة القديمة
            if (Schema::hasColumn('products_customer', 'userinsert')) {
                $table->dropColumn('userinsert');
            }

            if (Schema::hasColumn('products_customer', 'iduserinsert')) {
                $table->dropColumn('iduserinsert');
            }

            if (Schema::hasColumn('products_customer', 'iduserupdate')) {
                $table->dropColumn('iduserupdate');
            }

            // إضافة user_id لو مش موجود
            if (!Schema::hasColumn('products_customer', 'user_id')) {
                $table->foreignId('user_id')
                      ->nullable() // <--- Fix: Make it nullable so existing rows don't break strict FK
                      ->after('id') 
                      ->constrained('users')
                      ->cascadeOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('products_customer', function (Blueprint $table) {

            // حذف العلاقة
            if (Schema::hasColumn('products_customer', 'user_id')) {
                $table->dropForeign(['user_id']);
                $table->dropColumn('user_id');
            }

            // إعادة الأعمدة القديمة (لو احتجت rollback)
            $table->string('userinsert')->nullable();
            $table->unsignedBigInteger('iduserinsert')->nullable();
            $table->unsignedBigInteger('iduserupdate')->nullable();
        });
    }
};
