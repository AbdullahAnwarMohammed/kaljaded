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
        Schema::create('settings', function (Blueprint $table) {
            $table->id();

            // ===== Fonts =====
            $table->string('font_ar')->default('Noto Sans Arabic');
            $table->string('font_en')->default('Roboto');

            // ===== Authentication =====
            $table->boolean('two_factor')->default(false);
            $table->boolean('social_login')->default(false);
            $table->integer('password_min_length')->default(8);
            $table->boolean('email_verification')->default(true);
            $table->integer('max_login_attempts')->default(5);
            $table->string('default_user_role')->default('user');

            // ===== Notifications =====
            $table->boolean('email_notifications')->default(true);
            $table->boolean('push_notifications')->default(false);
            $table->boolean('sms_notifications')->default(false);
            $table->boolean('weekly_summary')->default(false);

            // ===== Security =====
            $table->boolean('enable_captcha')->default(false);
            $table->integer('session_timeout')->default(30); // بالدقائق
            $table->text('ip_whitelist')->nullable(); // نخزنها كسطر نصي مفصول بفواصل

            // ===== General =====
            $table->string('site_name')->default('My Website');
            $table->string('site_logo')->nullable();
            $table->string('site_favicon')->nullable();
            $table->string('default_language')->default('ar');
            $table->string('timezone')->default('UTC');

            // ===== Appearance =====
            $table->string('theme')->default('light'); // light / dark
            $table->string('primary_color')->default('#3B82F6'); // Tailwind blue
            $table->text('custom_css')->nullable();

            // ===== Integrations =====
            $table->string('smtp_host')->nullable();
            $table->string('smtp_port')->nullable();
            $table->string('smtp_user')->nullable();
            $table->string('smtp_password')->nullable();
            $table->string('sms_provider')->nullable(); // Twilio / Vonage
            $table->string('sms_api_key')->nullable();
            $table->string('push_provider')->nullable(); // Firebase / OneSignal
            $table->string('push_api_key')->nullable();
            $table->string('payment_gateway')->nullable(); // Stripe / PayPal
            $table->string('payment_api_key')->nullable();

            // ===== Backup =====
            $table->boolean('auto_backup')->default(false);
            $table->string('backup_frequency')->default('daily'); // daily / weekly
            $table->string('backup_path')->nullable();
            $table->boolean('maintenance_mode')->default(false);
            $table->text('maintenance_message')->nullable();

            // ===== Developer / Advanced =====
            $table->boolean('debug_mode')->default(false);
            $table->integer('log_retention_days')->default(30);
            $table->text('custom_webhooks')->nullable(); // JSON string of webhooks

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
