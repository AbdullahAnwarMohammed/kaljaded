<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('products_customer', function (Blueprint $table) {

            // حذف الأعمدة القديمة
            if (Schema::hasColumn('products_customer', 'colorar')) {
                $table->dropColumn('colorar');
            }

            if (Schema::hasColumn('products_customer', 'coloren')) {
                $table->dropColumn('coloren');
            }

            // إضافة العمود الجديد
            if (!Schema::hasColumn('products_customer', 'color')) {
                $table->string('color')->nullable()->after('view');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products_customer', function (Blueprint $table) {

            // حذف color
            if (Schema::hasColumn('products_customer', 'color')) {
                $table->dropColumn('color');
            }

            // إعادة الأعمدة القديمة
            $table->string('colorar')->nullable();
            $table->string('coloren')->nullable();
        });
    }
};
