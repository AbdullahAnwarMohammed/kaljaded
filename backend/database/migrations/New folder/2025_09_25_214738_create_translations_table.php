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
        Schema::create('translations', function (Blueprint $table) {
            $table->id();
            $table->string('group')->nullable(); // مثال: messages, validation
            $table->string('key');               // المفتاح: welcome, login_failed
            $table->string('locale', 5);         // اللغة: ar, en, fr...
            $table->text('value');               // النص المترجم
            $table->unique(['group', 'key', 'locale']); // يمنع التكرار

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('translations');
    }
};
