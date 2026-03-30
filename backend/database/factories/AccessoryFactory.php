<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Accessory>
 */
class AccessoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name_ar' => 'إكسسوار ' . $this->faker->words(2, true),
            'name_en' => 'Accessory ' . $this->faker->words(2, true),
            'user_id' => User::factory(),
            'images'  => [
                'https://picsum.photos/400/400?random=' . $this->faker->numberBetween(1, 1000),
                'https://picsum.photos/400/400?random=' . $this->faker->numberBetween(1001, 2000)
            ],
            'price'    => $this->faker->randomFloat(2, 50, 5000),
            'discount' => $this->faker->randomFloat(2, 0, 400),
            'status'   => 1,
        ];
    }

    /**
     * Configure the model factory.
     */
    public function configure(): static
    {
        return $this->afterCreating(function (\App\Models\Accessory $accessory) {
            // Attach random subcategory if it exists
            $subCategory = \App\Models\SubCategory::inRandomOrder()->first();
            if ($subCategory) {
                $accessory->subCategories()->attach($subCategory->id);
            }

            // Attach random product if it exists
            $product = \App\Models\Product::inRandomOrder()->first();
            if ($product) {
                $accessory->products()->attach($product->id);
            }
        });
    }
}
