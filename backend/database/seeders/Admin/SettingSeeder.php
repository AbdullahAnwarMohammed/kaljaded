<?php

namespace Database\Seeders\Admin;

use App\Models\Setting;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{

    public function run(): void
    {
        Setting::create([
            'font_ar' => 'Noto Sans Arabic',
            'font_en' => 'Roboto',
        ]);
    }
}
