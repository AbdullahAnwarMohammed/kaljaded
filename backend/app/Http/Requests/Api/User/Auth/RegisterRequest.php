<?php

namespace App\Http\Requests\Api\User\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'                  => 'required|string|max:100|unique:users,name',
            'email'                 => 'nullable|email|unique:users,email',
            'password'              => 'required|min:6|confirmed',
            'phone'                 => 'required|string|unique:users,phone',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'     => __('validation.required', ['attribute' => __('fields.name')]),
            'email.required'    => __('validation.required', ['attribute' => __('fields.email')]),
            'email.unique'      => __('validation.unique', ['attribute' => __('fields.email')]),
            'password.required' => __('validation.required', ['attribute' => __('fields.password')]),
            'password.confirmed' => __('validation.confirmed', ['attribute' => __('fields.password')]),
            'password.min' => __('validation.min', ['attribute' => __('fields.password')]),
            'phone.required'        => __('validation.required', ['attribute' => __('fields.phone')]),
            'phone.unique'          => __('validation.unique', ['attribute' => __('fields.phone')]),

        ];
    }
}
