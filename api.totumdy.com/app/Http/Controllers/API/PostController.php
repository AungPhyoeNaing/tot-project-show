<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Post;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Reaction;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     * Modified to include counts for reactions, comments, and shares,
     * and data for shared posts.
     */
    public function index()
    {
        $userId = Auth::id();

        $postsQuery = Post::with([
                'user:id,name,email,avatar',
                'sharedPost.user:id,name,email,avatar'
            ])
            ->withCount([
                'reactions',
                'comments',
                'shares',
                'reactions as likes_count' => fn ($query) => $query->where('type', 'like'),
                'reactions as sads_count' => fn ($query) => $query->where('type', 'sad'),
                'reactions as angries_count' => fn ($query) => $query->where('type', 'angry'),
            ])
            ->latest();

        $posts = $postsQuery->get();

        // --- Efficiently fetch and append user's reaction for all posts ---
        if ($userId) {
            $postIds = $posts->pluck('id')->toArray();

            $userReactions = \App\Models\Reaction::where('user_id', $userId)
                                                ->whereIn('post_id', $postIds)
                                                ->pluck('type', 'post_id');

            $posts->each(function ($post) use ($userReactions) {
                $post->user_reaction = $userReactions->get($post->id);
            });
        } else {
            $posts->each(function ($post) {
                $post->user_reaction = null;
            });
        }
        // --- End efficient fetch and append ---

        return response()->json($posts);
    }

    /**
     * Get posts for a specific user.
     */
    public function getUserPosts(User $user)
    {
        $posts = Post::where('user_id', $user->id)
            ->with('user', 'sharedPost.user')
            ->withCount([
                'reactions',
                'comments',
                'shares',
                'reactions as likes_count' => fn ($query) => $query->where('type', 'like'),
                'reactions as sads_count' => fn ($query) => $query->where('type', 'sad'),
                'reactions as angries_count' => fn ($query) => $query->where('type', 'angry'),
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        $userReactions = auth()->check()
            ? Reaction::where('user_id', auth()->id())
                ->whereIn('post_id', $posts->pluck('id'))
                ->pluck('type', 'post_id')
            : collect();

        $posts->each(function ($post) use ($userReactions) {
            $post->user_reaction = $userReactions->get($post->id);
        });

        return response()->json($posts);
    }

    /**
     * Display one post for real-time clients and other focused views.
     */
    public function show(Post $post)
    {
        $post->load([
            'user:id,name,email,avatar',
            'sharedPost.user:id,name,email,avatar',
        ])->loadCount([
            'reactions',
            'comments',
            'shares',
            'reactions as likes_count' => fn ($query) => $query->where('type', 'like'),
            'reactions as sads_count' => fn ($query) => $query->where('type', 'sad'),
            'reactions as angries_count' => fn ($query) => $query->where('type', 'angry'),
        ]);

        $post->user_reaction = auth()->check()
            ? $post->reactions()->where('user_id', auth()->id())->value('type')
            : null;

        return response()->json($post);
    }

    /**
     * Store a newly created resource in storage.
     * Supports optional media_url and media_type.
     * Requires at least body or media.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'body' => 'nullable|string|max:1000',
            'media_url' => 'nullable|url|max:500',
            'media_type' => 'nullable|in:image,audio,video',
            'category' => 'required|in:memes,study,entertainment,announcement,news',
        ]);

        // Ensure at least body or media is provided
        if (empty($validated['body']) && empty($validated['media_url'])) {
            return response()->json([
                'message' => 'Post must have either body text or media.'
            ], 422);
        }

        $post = $request->user()->posts()->create([
            'body' => $validated['body'] ?? null,
            'media_url' => $validated['media_url'] ?? null,
            'media_type' => $validated['media_type'] ?? null,
            'category' => $validated['category'],
        ]);

        // Load user for consistent response
        $post->load('user');

        // Initialize counts for immediate UI consistency (like in index)
        $post->likes_count = 0;
        $post->sads_count = 0;
        $post->angries_count = 0;
        $post->reactions_count = 0;
        $post->comments_count = 0;
        $post->shares_count = 0;
        $post->user_reaction = null;

        return response()->json($post, 201);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post)
    {
        if ($post->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $this->deleteLocalMedia($post->media_url);
        $post->delete();
        return response()->json(null, 204);
    }

    private function deleteLocalMedia(?string $mediaUrl): void
    {
        $path = $mediaUrl ? parse_url($mediaUrl, PHP_URL_PATH) : null;
        if (!$path || !str_starts_with($path, '/storage/')) {
            return;
        }

        Storage::disk('public')->delete(substr($path, strlen('/storage/')));
    }

    /**
     * Share a post.
     * Creates a new post referencing the original.
     */
    public function share(Post $post)
    {
        $sharedPostEntry = Auth::user()->posts()->create([
            'body' => '',
            'shared_post_id' => $post->id,
            'category' => $post->category,
        ]);

        $sharedPostEntry->load([
            'user:id,name,email,avatar',
            'sharedPost.user:id,name,email,avatar'
        ]);

        // Initialize counts for shared post entry
        $sharedPostEntry->likes_count = 0;
        $sharedPostEntry->sads_count = 0;
        $sharedPostEntry->angries_count = 0;
        $sharedPostEntry->reactions_count = 0;
        $sharedPostEntry->comments_count = 0;
        $sharedPostEntry->shares_count = 0;
        $sharedPostEntry->user_reaction = null;

        return response()->json($sharedPostEntry, 201);
    }
}
