<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;
    use HasApiTokens;
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    public $timestamps = false;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'city_id',
        'area_id',
        'block',
        'street',
        'building',
        'floor',
        'apartment',
        'latitude',
        'longitude'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    public function city()
    {
        return $this->belongsTo(City::class);
    }

    public function area()
    {
        return $this->belongsTo(Area::class);
    }

    public function getImageMerchantAttribute()
    {
        return $this->image_vendor ? 'https://kaljaded.com/' . $this->image_vendor : null;
    }

    public function products()
    {
        return $this->hasMany(Product::class, 'iduserinsert');
    }
}
