<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\PasswordResetRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class PasswordResetRequestController extends Controller
{
    public function store(Request $request)
    {
        if (!Schema::hasTable('password_reset_requests')) {
            return response()->json([
                'message' => 'Password reset requests are not configured yet.',
            ], 503);
        }

        $validated = $request->validate([
            'email' => ['required', 'email', 'ends_with:@tot.com'],
            'recovery_email' => ['required', 'email', 'max:255'],
            'account_creation_date' => ['nullable', 'string', 'max:255'],
            'message' => ['nullable', 'string', 'max:1000'],
        ]);

        $resetRequest = PasswordResetRequest::create($validated);

        return response()->json([
            'message' => 'Password reset request submitted successfully.',
            'request_id' => $resetRequest->id,
        ], 202);
    }
}
