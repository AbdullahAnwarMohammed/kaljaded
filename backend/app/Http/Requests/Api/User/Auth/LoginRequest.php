<?php

namespace App\Http\Requests\Api\User\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }


    public function rules(): array
    {
        return [
            'name_or_phone' => 'required|string',
            'password'      => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'name_or_phone.required' => __('validation.required', ['attribute' => __('fields.username')]),
        ];
    }
}
