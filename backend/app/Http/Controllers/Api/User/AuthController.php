<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Validation\ValidationException;

use App\Http\Resources\Api\User\UserResource;
use App\Models\PhoneUpdateOtp;
use App\Models\User;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use App\Services\WaSenderApiService;

class AuthController extends Controller
{

    use ApiResponseTrait;
    public function sendOtp(Request $request, WaSenderApiService $waSender)
    {
        $request->validate(['phone' => 'required']);
// 
        $phone = str_replace(['+', ' '], '', $request->phone);

        // Regex for Kuwait: Optional 965 prefix + 8 digits
        if (!preg_match('/^(965)?(\d{8})$/', $phone, $matches)) {
            return $this->errorResponse('الرجاء إدخال رقم هاتف كويتي صحيح', 422);
        }

        // Standardize: 965 + 8 digits
        $phone = '965' . $matches[2];
        
        // Find or create user
        $user = User::firstOrCreate(
            ['phone' => $phone],
            [
                'name' => null,
                'role' => 1
            ] 
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
             $message = "كود التحقق الخاص بك هو: $otp. يرجى إدخاله لإتمام العملية في كالجديد.";
            $waSender->sendTextMessage($phone, $message);
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

        $phone = str_replace(['+', ' '], '', $request->phone);
        if (preg_match('/^(965)?(\d{8})$/', $phone, $matches)) {
            $phone = '965' . $matches[2];
        }

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
        if($request->has('phone')) {
            $phone = str_replace(['+', ' '], '', $request->phone);
            if (!preg_match('/^(965)?(\d{8})$/', $phone, $matches)) {
                return $this->errorResponse('الرجاء إدخال رقم هاتف كويتي صحيح', 422);
            }
            $updateData['phone'] = '965' . $matches[2];
        }
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

    public function updateFcmToken(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'device_type' => 'required|in:web,android,ios',
            'device_id' => 'nullable|string',
        ]);

        $user = \Illuminate\Support\Facades\Auth::user();
        
        \Illuminate\Support\Facades\Log::info("Updating FCM token for user {$user->id}: {$request->token} ({$request->device_type})");


        $user->fcmTokens()->updateOrCreate(
            ['token' => $request->token],
            [
                'device_type' => $request->device_type,
                'device_id' => $request->device_id,
            ]
        );

        $user->update([
            'token_firebase' => $request->token,
        ]);

        return $this->successResponse(null, 'messages.token_updated');
    }

    public function sendUpdatePhoneOtp(Request $request, WaSenderApiService $waSender)
{
    $request->validate([
        'phone' => 'required'
    ]);

    // إزالة + والمسافات وأي رموز
    $phone = preg_replace('/[^0-9]/', '', $request->phone);

    /*
     * تحقق من رقم كويتي صحيح:
     * - اختياري 965 في البداية
     * - ثم رقم 8 خانات يبدأ بـ 5 أو 6 أو 9
     */
    if (!preg_match('/^(965)?([569]\d{7})$/', $phone, $matches)) {
        return $this->errorResponse('الرجاء إدخال رقم هاتف كويتي صحيح', 422);
    }

    // توحيد الرقم داخل النظام بصيغة دولية ثابتة
    $standardPhone = '965' . $matches[2];

    // التأكد أن الرقم غير مستخدم من مستخدم آخر
    $exists = User::where('phone', $standardPhone)
        ->where('id', '!=', auth()->id())
        ->exists();

    if ($exists) {
        return $this->errorResponse('رقم الهاتف هذا مستخدم بالفعل من قبل حساب آخر', 422);
    }

    $user = auth()->user();

    // توليد OTP من 4 أرقام
    $otp = rand(1000, 9999);

    // حذف أي طلب تحديث سابق
    PhoneUpdateOtp::where('user_id', $user->id)->delete();

    // إنشاء طلب تحديث جديد
    PhoneUpdateOtp::create([
        'user_id'    => $user->id,
        'phone'      => $standardPhone,
        'otp'        => $otp,
        'expires_at' => now()->addMinutes(10)
    ]);

    \Illuminate\Support\Facades\Log::info(
        "Phone Update OTP for User {$user->id} to {$standardPhone}: {$otp}"
    );

    // إرسال عبر WhatsApp
    try {
        $message = "كود تحديث رقم الهاتف الخاص بك هو: {$otp}. يرجى إدخاله لإتمام العملية.";
         $waSender->sendTextMessage($standardPhone, $message);
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error($e->getMessage());
    }

    return $this->successResponse(
        ['message' => 'OTP sent successfully'],
        'messages.otp_sent'
    );
}

public function verifyUpdatePhoneOtp(Request $request)
{
    $request->validate([
        'code' => 'required|digits:4'
    ]);

    $user = auth()->user();

    // جلب طلب التحديث المعلّق والذي لم تنتهِ صلاحيته
    $pending = PhoneUpdateOtp::where('user_id', $user->id)
        ->where('expires_at', '>', now())
        ->first();

    if (!$pending) {
        return $this->errorResponse('انتهت صلاحية طلب التحديث، يرجى المحاولة مرة أخرى', 422);
    }

    // التحقق من صحة الكود
    if ($pending->otp != $request->code) {
        return $this->errorResponse('رمز التحقق غير صحيح', 422);
    }

    /*
     * فحص أخير قبل التحديث (لحل مشكلة Race Condition)
     * لو حد استخدم الرقم في نفس اللحظة
     */
    $exists = User::where('phone', $pending->phone)
        ->where('id', '!=', $user->id)
        ->exists();

    if ($exists) {
        $pending->delete();
        return $this->errorResponse('رقم الهاتف هذا مستخدم بالفعل من قبل حساب آخر', 422);
    }

    // تحديث رقم الهاتف فعليًا
    $user->update([
        'phone' => $pending->phone
    ]);

    // حذف طلب التحديث بعد النجاح
    $pending->delete();

    return $this->successResponse([
        'user' => new UserResource($user),
    ], 'تم تحديث رقم الهاتف بنجاح');
}

    public function loginWithGoogle(Request $request)
    {
        $request->validate([
            'google_id' => 'required|string',
            'email'     => 'required|email',
            'name'      => 'nullable|string',
        ]);

        // Find user by google_id or email
        $user = User::where('google_id', $request->google_id)
            ->orWhere('email', $request->email)
            ->first();

        if ($user) {
            // Update google_id if it's missing (found by email)
            if (!$user->google_id) {
                $user->update(['google_id' => $request->google_id]);
            }
        } else {
            // Create new user
            $user = User::create([
                'name'      => $request->name,
                'email'     => $request->email,
                'google_id' => $request->google_id,
                'role'      => 1, // Default customer role
            ]);
        }

        $token = $user->createToken('api_token')->plainTextToken;

        return $this->successResponse([
            'user'  => new UserResource($user),
            'token' => $token,
        ], 'messages.login_success');
    }

    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            
            $user = User::where('google_id', $googleUser->getId())
                ->orWhere('email', $googleUser->getEmail())
                ->first();

            if ($user) {
                if (!$user->google_id) {
                    $user->update(['google_id' => $googleUser->getId()]);
                }
            } else {
                $user = User::create([
                    'name'      => $googleUser->getName(),
                    'email'     => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'role'      => 1,
                ]);
            }

            $token = $user->createToken('api_token')->plainTextToken;
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');

            return redirect()->to($frontendUrl . "/auth/callback?token=" . $token . "&user=" . urlencode(json_encode(new UserResource($user))));

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Socialite Callback Error: " . $e->getMessage());
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return redirect()->to($frontendUrl . "/login-customer?error=google_failed");
        }
    }
}


// use App\Http\Controllers\Controller;
// use App\Http\Requests\Api\User\Auth\LoginRequest;
// use App\Http\Requests\Api\User\Auth\RegisterRequest;
// use Illuminate\Validation\ValidationException;

// use App\Http\Resources\Api\User\UserResource;
// use App\Models\User;
// use App\Traits\ApiResponseTrait;
// use Illuminate\Support\Facades\Hash;
// use Illuminate\Http\Request;
// use App\Services\WaSenderApiService;
// use Illuminate\Support\Facades\Cache;
// use App\Models\PhoneUpdateOtp;

// class AuthController extends Controller
// {

//     use ApiResponseTrait;
//     public function sendOtp(Request $request, WaSenderApiService $waSender)
//     {
//         $request->validate(['phone' => 'required']);

//         $phone = str_replace(['+', ' '], '', $request->phone);

//         // Regex for Egypt: Optional 20 prefix + optional 0 + 10 digits starting with 1
//         if (!preg_match('/^(20)?0?(1[0125]\d{8})$/', $phone, $matches)) {
//             return $this->errorResponse('الرجاء إدخال رقم هاتف مصري صحيح', 422);
//         }

//         // Standardize: 20 + 10 digits (matches[2] is the 10-digit part starting with 1)
//         $phone = '20' . $matches[2];
        
//         // Find or create user
//         $user = User::firstOrCreate(
//             ['phone' => $phone],
//             [
//                 'name' => null,
//                 'role' => 1
//             ] 
//         );

//         // Check if OTP is still valid (throttle)
//         if ($user->otp_expires_at && $user->otp_expires_at->isFuture()) {
//              return $this->errorResponse('Please wait before resending OTP', 429);
//         }

//         // Generate 4-digit OTP
//         $otp = rand(1000, 9999);

//         // Update User
//         $user->update([
//             'otp_code' => $otp,
//             'otp_expires_at' => now()->addSeconds(60)
//         ]);

//         \Illuminate\Support\Facades\Log::info("OTP for {$phone}: {$otp}");

//         // Send via WhatsApp
//         try {
//              $message = "كود التحقق الخاص بك هو: $otp. يرجى إدخاله لإتمام العملية في كالجديد.";
//              $waSender->sendTextMessage($phone, $message);
//         } catch (\Exception $e) {
//             // Log error
//         }

//         return $this->successResponse(['message' => 'OTP sent successfully'], 'messages.otp_sent');
//     }

//     public function verifyOtp(Request $request)
//     {
//         $request->validate([
//             'phone' => 'required',
//             'code'  => 'required'
//         ]);

//         $phone = str_replace(['+', ' '], '', $request->phone);
//         if (preg_match('/^(20)?0?(1[0125]\d{8})$/', $phone, $matches)) {
//             $phone = '20' . $matches[2];
//         }

//         $code  = $request->code;

//         $user = User::where('phone', $phone)->first();

//         if (! $user || $user->otp_code != $code) {
//              throw ValidationException::withMessages([
//                 'code' => [__('messages.invalid_otp')],
//             ]);
//         }

//         if ($user->otp_expires_at && $user->otp_expires_at->isPast()) {
//              throw ValidationException::withMessages([
//                 'code' => ['OTP returned expired'],
//             ]);
//         }

//         // OTP is valid, clear it
//         $user->update([
//             'otp_code' => null,
//             'otp_expires_at' => null
//         ]);

//         $token = $user->createToken('api_token')->plainTextToken;

//         return $this->successResponse([
//             'user'  => new UserResource($user),
//             'token' => $token,
//         ], 'messages.login_success');
//     }

//     public function profile()
//     {
//         $user = auth()->user();
//         return $this->successResponse([
//             'user' => new UserResource($user),
//         ], 'messages.profile_success');
//     }

//     public function updateProfile(Request $request)
//     {
//         $user = auth()->user();
        
//         $data = $request->validate([
//             'name' => 'nullable|string',
//             'phone' => 'nullable|string',
//             'city' => 'nullable',
//             'area' => 'nullable',
//             'block' => 'nullable|string',
//             'street' => 'nullable|string',
//             'building' => 'nullable|string',
//             'floor' => 'nullable|string',
//             'apartment' => 'nullable|string',
//             'latitude' => 'nullable|numeric',
//             'longitude' => 'nullable|numeric',
//         ]);

//         $updateData = [];
//         if($request->has('name')) $updateData['name'] = $request->name;
//         if($request->has('phone')) {
//             $phone = str_replace(['+', ' '], '', $request->phone);
//             if (!preg_match('/^(20)?(1[0125]\d{8})$/', $phone, $matches)) {
//                 return $this->errorResponse('الرجاء إدخال رقم هاتف مصري صحيح', 422);
//             }
//             $updateData['phone'] = '20' . $matches[2];
//         }
//         if($request->has('city')) $updateData['city_id'] = $request->city;
//         if($request->has('area')) $updateData['area_id'] = $request->area;
//         if($request->has('latitude')) $updateData['latitude'] = $request->latitude;
//         if($request->has('longitude')) $updateData['longitude'] = $request->longitude;
        
//         foreach(['block', 'street', 'building', 'floor', 'apartment'] as $field) {
//             if($request->has($field)) {
//                 $updateData[$field] = $request->$field;
//             }
//         }

//         $user->update($updateData);

//         return $this->successResponse([
//             'user' => new UserResource($user),
//         ], 'messages.profile_update_success');
//     }

//     public function updateFcmToken(Request $request)
//     {
//         $request->validate([
//             'token' => 'required|string',
//             'device_type' => 'required|in:web,android,ios',
//             'device_id' => 'nullable|string',
//         ]);

//         $user = \Illuminate\Support\Facades\Auth::user();
        
//         \Illuminate\Support\Facades\Log::info("Updating FCM token for user {$user->id}: {$request->token} ({$request->device_type})");

//         // Maintain only one token per device_id if provided, 
//         // or just add/update based on the token itself to ensure uniqueness.
//         // Here we use updateOrCreate based on the token to avoid duplicates.
        
//         $user->fcmTokens()->updateOrCreate(
//             ['token' => $request->token],
//             [
//                 'device_type' => $request->device_type,
//                 'device_id' => $request->device_id,
//             ]
//         );

//         // Optional: Keep legacy field updated for now (or remove if fully migrated)
//         $user->update([
//             'token_firebase' => $request->token,
//         ]);

//         return $this->successResponse(null, 'messages.token_updated');
//     }

//     public function migrateTokens()
//     {
//         try {
//             $users = User::whereNotNull('token_firebase')->where('token_firebase', '!=', '')->get();
//             $count = 0;

//             foreach ($users as $user) {
//                 // Check if this token already exists in fcm_tokens table
//                 $exists = \App\Models\UserFcmToken::where('token', $user->token_firebase)->exists();

//                 if (!$exists) {
//                     \App\Models\UserFcmToken::create([
//                         'user_id' => $user->id,
//                         'token' => $user->token_firebase,
//                         'device_type' => 'Mobile', // As requested
//                         'device_id' => null, 
//                     ]);
//                     $count++;
//                 }
//             }

//             return $this->successResponse(['migrated_count' => $count], 'Tokens migrated successfully');

//         } catch (\Exception $e) {
//             return $this->errorResponse('Migration failed: ' . $e->getMessage(), 500);
//         }
//     }

//     public function testNotification(Request $request, \App\Services\FirebaseService $firebaseService)
//     {
//         $token = $request->query('token');
//         if (!$token) {
//              return $this->errorResponse('Token is required', 400);
//         }

//         $title = "Test Notification";
//         $body = "This is a test notification from the backend.";
        
//         $firebaseService->sendToTokens([$token], $title, $body);

//         return $this->successResponse(null, 'Notification request processed');
//     }

//     public function sendUpdatePhoneOtp(Request $request, WaSenderApiService $waSender)
//     {
//         $request->validate(['phone' => 'required']);

//         $phone = str_replace(['+', ' '], '', $request->phone);

//         // Regex for Egypt: Optional 20 prefix + optional 0 + 10 digits starting with 1
//         if (!preg_match('/^(20)?0?(1[0125]\d{8})$/', $phone, $matches)) {
//             return $this->errorResponse('الرجاء إدخال رقم هاتف مصري صحيح', 422);
//         }

//         // Standardize: 20 + 10 digits
//         $standardPhone = '20' . $matches[2];

//         // Check if phone is already taken by ANOTHER user
//         $exists = User::where('phone', $standardPhone)->where('id', '!=', auth()->id())->exists();
//         if ($exists) {
//             return $this->errorResponse('رقم الهاتف هذا مستخدم بالفعل من قبل حساب آخر', 422);
//         }

//         $user = auth()->user();

//         // Generate 4-digit OTP
//         $otp = rand(1000, 9999);

//         // Remove any previous pending updates for this user
//         PhoneUpdateOtp::where('user_id', $user->id)->delete();

//         // Create new pending update
//         PhoneUpdateOtp::create([
//             'user_id' => $user->id,
//             'phone' => $standardPhone,
//             'otp' => $otp,
//             'expires_at' => now()->addMinutes(10)
//         ]);

//         \Illuminate\Support\Facades\Log::info("Phone Update OTP for User {$user->id} to {$standardPhone}: {$otp}");

//         // Send via WhatsApp
//         try {
//              $message = "كود تحديث رقم الهاتف الخاص بك هو: $otp. يرجى إدخاله لإتمام العملية.";
//             //  $waSender->sendTextMessage($standardPhone, $message);
//         } catch (\Exception $e) {
//             // Log error
//         }

//         return $this->successResponse(['message' => 'OTP sent successfully'], 'messages.otp_sent');
//     }

//     public function verifyUpdatePhoneOtp(Request $request)
//     {
//         $request->validate([
//             'code'  => 'required'
//         ]);

//         $user = auth()->user();
        
//         $pending = PhoneUpdateOtp::where('user_id', $user->id)
//             ->where('expires_at', '>', now())
//             ->first();

//         if (!$pending) {
//             return $this->errorResponse('انتهت صلاحية طلب التحديث، يرجى المحاولة مرة أخرى', 422);
//         }

//         if ($pending->otp != $request->code) {
//              return $this->errorResponse('رمز التحقق غير صحيح', 422);
//         }

//         // Final check for uniqueness (race condition)
//         $exists = User::where('phone', $pending->phone)->where('id', '!=', $user->id)->exists();
//         if ($exists) {
//             $pending->delete();
//             return $this->errorResponse('رقم الهاتف هذا مستخدم بالفعل من قبل حساب آخر', 422);
//         }

//         $user->update([
//             'phone' => $pending->phone
//         ]);

//         $pending->delete();

//         return $this->successResponse([
//             'user' => new UserResource($user),
//         ], 'تم تحديث رقم الهاتف بنجاح');
//     }
// }
