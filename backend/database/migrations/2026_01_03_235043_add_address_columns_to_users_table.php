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
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('city_id')
                ->nullable()
                ->after('id')
                ->constrained('cities')
                ->nullOnDelete();

            $table->foreignId('area_id')
                ->nullable()
                ->after('city_id')
                ->constrained('areas')
                ->nullOnDelete();

            $table->string('block')->nullable()->after('area_id');
            $table->string('street')->nullable()->after('block');
            $table->string('building')->nullable()->after('street');
            $table->string('floor')->nullable()->after('building');
            $table->string('apartment')->nullable()->after('floor');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['city_id']);
            $table->dropForeign(['area_id']);

            $table->dropColumn([
                'city_id',
                'area_id',
                'block',
                'street',
                'building',
                'floor',
                'apartment',
            ]);
        });
    }
};
