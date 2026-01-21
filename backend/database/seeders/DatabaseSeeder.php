<?php

namespace Database\Seeders;

use App\Models\FamilyMember;
use App\Models\User;
use Database\Seeders\Admin\CreateAdminUserSeeder;
use Database\Seeders\Admin\RolesAndPermissionsSeeder;
use Database\Seeders\Admin\SettingSeeder;
use Database\Seeders\Admin\TranslationSeeder;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(SettingSeeder::class);
        $roots = FamilyMember::factory()->count(10)->create();
        $roots->each(function ($root) {
            FamilyMember::factory()->count(rand(1, 3))->withParent($root)->create();
        });
    }
}
