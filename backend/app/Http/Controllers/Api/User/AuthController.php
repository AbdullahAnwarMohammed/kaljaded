<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\User\Auth\LoginRequest;
use App\Http\Requests\Api\User\Auth\RegisterRequest;
use Illuminate\Validation\ValidationException;

use App\Http\Resources\Api\User\UserResource;
use App\Models\User;
use App\Traits\ApiResponseTrait;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use App\Services\WaSenderApiService;
use Illuminate\Support\Facades\Cache;

class AuthController extends Controller
{

    use ApiResponseTrait;
    public function sendOtp(Request $request, WaSenderApiService $waSender)
    {
        $request->validate(['phone' => 'required']);

        $phone = $request->phone;
        
        // Find or create user
        $user = User::firstOrCreate(
            ['phone' => $phone],
            ['name' => 'User ' . substr($phone, -4)] 
        );

        // Check if OTP is still valid (throttle)
        if ($user->otp_expires_at && $user->otp_expires_at->isFuture()) {
             return $this->errorResponse('Please wait before resending OTP', 429);
        }

        // Generate 4-digit OTP
        $otp = rand(1000, 9999);

        // Update User
        $user->update([
            'otp_code' => $otp,
            'otp_expires_at' => now()->addSeconds(60)
        ]);

        \Illuminate\Support\Facades\Log::info("OTP for {$phone}: {$otp}");

        // Send via WhatsApp
        try {
             $waSender->sendTextMessage($phone, "Your OTP code is: $otp");
        } catch (\Exception $e) {
            // Log error
        }

        return $this->successResponse(['message' => 'OTP sent successfully'], 'messages.otp_sent');
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required',
            'code'  => 'required'
        ]);

        $phone = $request->phone;
        $code  = $request->code;

        $user = User::where('phone', $phone)->first();

        if (! $user || $user->otp_code != $code) {
             throw ValidationException::withMessages([
                'code' => [__('messages.invalid_otp')],
            ]);
        }

        if ($user->otp_expires_at && $user->otp_expires_at->isPast()) {
             throw ValidationException::withMessages([
                'code' => ['OTP returned expired'],
            ]);
        }

        // OTP is valid, clear it
        $user->update([
            'otp_code' => null,
            'otp_expires_at' => null
        ]);

        $token = $user->createToken('api_token')->plainTextToken;

        return $this->successResponse([
            'user'  => new UserResource($user),
            'token' => $token,
        ], 'messages.login_success');
    }

    public function profile()
    {
        $user = auth()->user();
        return $this->successResponse([
            'user' => new UserResource($user),
        ], 'messages.profile_success');
    }

    public function updateProfile(Request $request)
    {
        $user = auth()->user();
        
        $data = $request->validate([
            'name' => 'nullable|string',
            'phone' => 'nullable|string',
            'city' => 'nullable',
            'area' => 'nullable',
            'block' => 'nullable|string',
            'street' => 'nullable|string',
            'building' => 'nullable|string',
            'floor' => 'nullable|string',
            'apartment' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        $updateData = [];
        if($request->has('name')) $updateData['name'] = $request->name;
        if($request->has('phone')) $updateData['phone'] = $request->phone;
        if($request->has('city')) $updateData['city_id'] = $request->city;
        if($request->has('area')) $updateData['area_id'] = $request->area;
        if($request->has('latitude')) $updateData['latitude'] = $request->latitude;
        if($request->has('longitude')) $updateData['longitude'] = $request->longitude;
        
        foreach(['block', 'street', 'building', 'floor', 'apartment'] as $field) {
            if($request->has($field)) {
                $updateData[$field] = $request->$field;
            }
        }

        $user->update($updateData);

        return $this->successResponse([
            'user' => new UserResource($user),
        ], 'messages.profile_update_success');
    }
}
