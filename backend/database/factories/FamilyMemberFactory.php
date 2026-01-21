<?php

namespace Database\Factories;

use App\Models\FamilyMember;
use Illuminate\Database\Eloquent\Factories\Factory;

class FamilyMemberFactory extends Factory
{
    protected $model = FamilyMember::class;

    public function definition()
    {
        return [
            'name' => $this->faker->name(),
            'gender' => $this->faker->randomElement(['male', 'female']),
            'birth_year' => $this->faker->numberBetween(1920, 2024),
            'parent_id' => null,
        ];
    }

    // لتوليد شخص مرتبط بأب معين
    public function withParent(FamilyMember $parent)
    {
        return $this->state(fn(array $attributes) => [
            'parent_id' => $parent->id,
        ]);
    }
}
