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

class AuthController extends Controller
{

    use ApiResponseTrait;
    public function register(RegisterRequest $request)
    {
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'phone' => $request->phone,
            'password' => $request->password,
            'role' => 1,
        ]);
        $token = $user->createToken('api_token')->plainTextToken;
        return $this->successResponse([
            'user'  => new UserResource($user),
            'token' => $token,
        ], 'messages.register_success');
    }

    public function login(LoginRequest $request)
    {
        $identifier = $request->name_or_phone;
        $user = User::where('name', $identifier)
            ->orWhere('phone', $identifier)
            ->first();
        if (! $user) {
            throw ValidationException::withMessages([
                'name_or_phone' => [__('messages.invalid_credentials')],
            ]);
        }
        if ($request->filled('password') && $request->password != $user->password) {
            throw ValidationException::withMessages([
                'password' => [__('messages.invalid_credentials')],
            ]);
        }
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
