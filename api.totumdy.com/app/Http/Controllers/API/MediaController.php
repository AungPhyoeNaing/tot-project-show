<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    public function upload(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => [
                'required',
                'file',
                'max:20480', // 20MB
                'mimes:jpg,jpeg,jfif,jpe,png,gif,webp,mp3,wav,ogg,mp4,mov,avi,wmv,webm'
            ]
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $file = $request->file('file');

        $extension = $file->getClientOriginalExtension();
        $filename = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
        $uniqueFilename = $filename . '_' . time() . '.' . $extension;

        // Detect type from the actual MIME content, not the extension,
        // so JPEG variants like .jfif/.jpe are correctly classified as images.
        $mime = $file->getMimeType();
        $typeFolder = match (true) {
            str_starts_with($mime, 'image/') => 'image',
            str_starts_with($mime, 'audio/') => 'audio',
            str_starts_with($mime, 'video/') => 'video',
            default => 'others'
        };

        $path = $file->storeAs("uploads/{$typeFolder}", $uniqueFilename, 'public');

        return response()->json([
            'success' => true,
            'data' => [
                'url' => url(Storage::url($path)),
                'type' => $typeFolder, // 'image', 'audio', 'video'
                'mime' => $mime,
                'size' => $file->getSize(),
            ]
        ]);
    }
}