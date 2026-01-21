<?php

namespace App\Console\Schedules;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;

class AppSchedule
{
    public function __invoke(Schedule $schedule): void
    {
        $settings = DB::table('settings')->first();

        if ($settings && $settings->auto_backup) {
            if ($settings->backup_frequency === 'daily') {
                $schedule->command('backup:run')->daily();
            } elseif ($settings->backup_frequency === 'weekly') {
                $schedule->command('backup:run')->weekly();
            }
        }

        // Maintenance Mode
        if ($settings && $settings->maintenance_mode) {
            $schedule->call(function () use ($settings) {
                Artisan::call('down', [
                    '--message' => $settings->maintenance_message ?? 'Site is under maintenance',
                ]);
            })->everyMinute();
        } else {
            $schedule->call(function () {
                Artisan::call('up');
            })->everyMinute();
        }
    }
}
