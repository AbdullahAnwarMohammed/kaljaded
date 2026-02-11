<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Services\WaSenderApiService;
use Illuminate\Http\Request;

class WhatsAppController extends Controller
{
    protected WaSenderApiService $waSender;

    public function __construct(WaSenderApiService $waSender)
    {
        $this->waSender = $waSender;
    }

    public function send(Request $request)
    {
        $request->validate([
            'to'   => 'required|string',
            'text' => 'required|string'
        ]);

        $response = $this->waSender->sendTextMessage(
            $request->to,
            $request->text
        );

        return response()->json([
            'status' => 'sent',
            'data'   => $response
        ]);
    }
}
