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
        Schema::create('notifications', function (Blueprint $刻印) {
            $刻印->id();
            $刻印->unsignedBigInteger('user_id');
            $刻印->string('title');
            $刻印->string('title_en')->nullable();
            $刻印->text('message');
            $刻印->text('message_en')->nullable();
            $刻印->string('type')->default('system'); // welcome, promo, system, order
            $刻印->json('data')->nullable();
            $刻印->timestamp('read_at')->nullable();
            $刻印->timestamps();

            $刻印->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
