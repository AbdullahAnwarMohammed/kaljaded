<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AccessorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = \App\Models\User::first() ?: \App\Models\User::factory()->create();

        // Create specific accessories
        $accessory1 = \App\Models\Accessory::create([
            'name_ar' => 'ساعة آبل الترا',
            'name_en' => 'Apple Watch Ultra',
            'user_id' => $user->id,
            'price'   => 2999.00,
            'discount'=> 200.00,
            'status'  => 1,
            'images'  => [
                'https://images.unsplash.com/photo-1544117518-30ed0f7cd256?auto=format&fit=crop&q=80&w=400',
                'https://images.unsplash.com/photo-1579811216948-6f57c19376a5?auto=format&fit=crop&q=80&w=400'
            ]
        ]);

        // Attach random relations
        $subCategory = \App\Models\SubCategory::inRandomOrder()->first();
        if ($subCategory) $accessory1->subCategories()->attach($subCategory->id);
        $product = \App\Models\Product::inRandomOrder()->first();
        if ($product) $accessory1->products()->attach($product->id);

        $accessory2 = \App\Models\Accessory::create([
            'name_ar' => 'سماعات آيربودز برو',
            'name_en' => 'AirPods Pro',
            'user_id' => $user->id,
            'price'   => 850.00,
            'discount'=> 50.00,
            'status'  => 1,
            'images'  => [
                'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?auto=format&fit=crop&q=80&w=400',
                'https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?auto=format&fit=crop&q=80&w=400'
            ]
        ]);

        // Attach random relations
        $subCategory = \App\Models\SubCategory::inRandomOrder()->first();
        if ($subCategory) $accessory2->subCategories()->attach($subCategory->id);
        $product = \App\Models\Product::inRandomOrder()->first();
        if ($product) $accessory2->products()->attach($product->id);

        // Create 10 more random accessories using the factory
        \App\Models\Accessory::factory()->count(10)->create([
            'user_id' => $user->id
        ]);
    }
}
