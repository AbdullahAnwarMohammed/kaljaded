<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\City;
use App\Models\Area;
use Illuminate\Support\Facades\DB;

class MigrateUserAddresses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:migrate-addresses';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate legacy string addresses to structured columns';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting address migration...');

        // Check if address column exists to avoid errors if it was never created
        // But user said they were storing it there, so I assume it exists. 
        // If strict mode is on, accessing a value might be fine if Eloquent model allows it? 
        // Actually, if it's not in schema, this query will fail. 
        // I'll assume it exists as per user statement.

        $users = User::whereNotNull('address')->where('address', '!=', '')->get();

        $bar = $this->output->createProgressBar(count($users));
        $bar->start();

        foreach ($users as $user) {
            $parts = array_map('trim', explode('/', $user->address));

            // Expected format: City / Area / Block / Street / Building / Floor / Apartment
            // Count should be around 7.

            if (count($parts) >= 2) {
                $cityName = $parts[0] ?? null;
                $areaName = $parts[1] ?? null;
                $block = $parts[2] ?? null;
                $street = $parts[3] ?? null;
                $building = $parts[4] ?? null;
                $floor = $parts[5] ?? null;
                $apartment = $parts[6] ?? null;

                // Find City
                $city = null;
                if ($cityName) {
                    $city = City::where('name_ar', 'LIKE', "%{$cityName}%")
                                ->orWhere('name_en', 'LIKE', "%{$cityName}%")
                                ->first();
                }

                // Find Area
                $area = null;
                if ($areaName) {
                    $areaQuery = Area::where('name_ar', 'LIKE', "%{$areaName}%")
                                     ->orWhere('name_en', 'LIKE', "%{$areaName}%");
                    
                    if ($city) {
                        $areaQuery->where('city_id', $city->id);
                    }
                    
                    $area = $areaQuery->first();
                }

                // Update User
                $user->update([
                    'city_id' => $city ? $city->id : null,
                    'area_id' => $area ? $area->id : null,
                    'block' => $block,
                    'street' => $street,
                    'building' => $building,
                    'floor' => $floor,
                    'apartment' => $apartment,
                ]);
            }
            
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info('Address migration completed successfully.');
    }
}
