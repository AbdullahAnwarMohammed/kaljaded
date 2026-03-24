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
        'longitude',
        'slug',
        'name_vendor',
        'request_vendor',
        'address',
        'phone_vendor',
        'image',
        'image_vendor',
        'commercial_Register_No',
        'image_commercial_Register_No',
        'token',
        'token_firebase',
        'role',
        'price',
        'otp_code',
        'otp_expires_at',
        'google_id'
    ];

    protected $casts = [
        'otp_expires_at' => 'datetime',
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

    public function fcmTokens()
    {
        return $this->hasMany(UserFcmToken::class);
    }



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

    public function receivedReviews()
    {
        return $this->hasMany(Review::class, 'merchant_id');
    }

    public function writtenReviews()
    {
        return $this->hasMany(Review::class, 'user_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
}
