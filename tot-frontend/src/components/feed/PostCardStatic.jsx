import React from "react";
//import "./Post.css"; // 👈 Reuse existing Post styling
import "./PostCardStatic.css"; // 👈 New CSS for PostCardStatic

const CATEGORY_NAMES = {
    news: "News",
    memes: "Memes",
    entertainment: "Entertainment",
    study: "Study",
    announcement: "Announcement",
};

const PostCardStatic = ({ post }) => {
    const likes = post.likes_count || 0;
    const sads = post.sads_count || 0;
    const angries = post.angries_count || 0;
    const comments = post.comments_count || 0;
    const shares = post.shares_count || 0;

    // Get first letter of username for avatar
    const userInitial = post.user?.name?.charAt(0).toUpperCase() || "?";
    const isShared = !!post.shared_post_id;

    // ✅ NEW: Media rendering function (updated to handle both current and shared post media)
    const renderMedia = () => {
        // First render current post media if it exists
        if (post.media_url) {
            switch (post.media_type) {
                case "image":
                    return (
                        <div className="post-media">
                            <img
                                src={post.media_url}
                                alt="Post media"
                                className="media-preview"
                            />
                        </div>
                    );
                case "video":
                    return (
                        <div className="post-media">
                            <video
                                controls
                                src={post.media_url}
                                className="media-preview"
                                preload="metadata"
                            >
                                <span className="error-message text-lg text-red-500 cherry-bomb">
                                    Your browser does not support the video tag.
                                </span>
                            </video>
                        </div>
                    );
                case "audio":
                    return (
                        <div className="post-media">
                            <audio
                                controls
                                src={post.media_url}
                                className="audio-player"
                            >
                                <span className="error-message text-lg text-red-500 cherry-bomb ">
                                    Your browser does not support the audio tag.
                                </span>
                            </audio>
                        </div>
                    );
                default:
                    return null;
            }
        }

        // If no current post media but it's a shared post, render shared post media
        if (!post.media_url && post.shared_post && post.shared_post.media_url) {
            switch (post.shared_post.media_type) {
                case "image":
                    return (
                        <div className="post-media">
                            <img
                                src={post.shared_post.media_url}
                                alt="Shared post media"
                                className="media-preview"
                            />
                        </div>
                    );
                case "video":
                    return (
                        <div className="post-media">
                            <video
                                controls
                                src={post.shared_post.media_url}
                                className="media-preview"
                                preload="metadata"
                            >
                                <span className="error-message text-lg text-red-500 cherry-bomb ">
                                    Your browser does not support the video tag.
                                </span>
                            </video>
                        </div>
                    );
                case "audio":
                    return (
                        <div className="post-media">
                            <audio
                                controls
                                src={post.shared_post.media_url}
                                className="audio-player"
                            >
                                <span className="error-message text-lg text-red-500 cherry-bomb">
                                    Your browser does not support the audio tag.
                                </span>
                            </audio>
                        </div>
                    );
                default:
                    return null;
            }
        }

        return null;
    };
    // ✅ END NEW

    return (
        <article className="post-card boxshadow relative w-full px-4 sm:px-7 pt-5 pb-12 rounded-3xl shadow-lg">
            {/* Header */}
            <header className="post-header flex justify-between items-start">
                <div className="mb-4 flex items-center">
                    <div className="post-avatar rounded-lg w-fit inline-block  mr-2 cursor-pointer">
                        <img
                            src={post.user.avatar || "assets/images/user.png"}
                            alt={`${post.user.name}'s avatar`}
                            className="user-avatar w-10 h-10 rounded-lg"
                        />
                    </div>
                    <div className="post-header-info flex flex-col  ">
                        <strong className="chicle-regular font-bold text-xl sm:text-2xl">
                            {post.user?.name || "Unknown User"}
                        </strong>
                        <small>
                            {new Date(post.created_at).toLocaleString()}
                        </small>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    {post.category && (
                        <span className="cat-badge boxshadow px-2 py-0.5 rounded-2xl">
                            {CATEGORY_NAMES[post.category] || post.category}
                        </span>
                    )}
                    {isShared && (
                        <div className="shared-indicator">
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                        Shared
                    </div>
                    )}
                </div>
            </header>

            {/* Body */}
            <div className="post-body mb-6">
                {/* Current post body (only if exists and is not a share) */}
                {post.body && !post.shared_post_id && <p>{post.body}</p>}

                {/* Current post media */}
                {post.media_url && renderMedia()}

                {/* Shared post content (only if this is a shared post) */}
                {post.shared_post && (
                    <div className="shared-post-container py-2 px-5 border-y-2 border-y-blue-500/10">
                        <div className="shared-post-header mb-2">
                            <div className="flex items-center">
                                <img
                                    className=" w-8 h-8 rounded-lg mr-3 object-cover"
                                    src={
                                        post.shared_post.user?.avatar ||
                                        "assets/images/users.png"
                                    }
                                    alt={`${post.shared_post.user?.name} avatar`}
                                />
                                <strong style={{ fontSize: "16px" }}>
                                    {post.shared_post.user?.name}
                                </strong>
                            </div>
                            <span
                                style={{
                                    color: "#65676B",
                                    fontSize: "12px",
                                    display: "block",
                                    marginTop: "5px",
                                }}
                            >
                                Original Post
                            </span>
                        </div>

                        <div className="shared-post-content">
                            {post.shared_post.body && (
                                <p>{post.shared_post.body}</p>
                            )}

                            {/* Shared post media */}
                            {!post.media_url && post.shared_post.media_url && (
                                <div className="post-media">
                                    {post.shared_post.media_type ===
                                        "image" && (
                                        <img
                                            src={post.shared_post.media_url}
                                            alt="Shared post media"
                                            className="media-preview"
                                        />
                                    )}

                                    {post.shared_post.media_type ===
                                        "video" && (
                                        <video
                                            controls
                                            src={post.shared_post.media_url}
                                            className="media-preview"
                                            preload="metadata"
                                        >
                                            <span className="error-message text-lg text-red-500 cherry-bomb ">
                                                Your browser does not support
                                                the video tag.
                                            </span>
                                        </video>
                                    )}

                                    {post.shared_post.media_type ===
                                        "audio" && (
                                        <div className="audio-player">
                                            <audio
                                                controls
                                                src={post.shared_post.media_url}
                                            >
                                                <span className="error-message text-lg text-red-500 cherry-bomb ">
                                                    Your browser does not
                                                    support the audio tag.
                                                </span>
                                            </audio>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Stats */}
            {/* <div className="post-stats">
                    <span>
                        <span className="stat-number">{likes}</span> Likes
                    </span>
                    <span>
                        <span className="stat-number">{sads}</span> Sads
                    </span>
                    <span>
                        <span className="stat-number">{angries}</span> Angries
                    </span>
                    <span>
                        <span className="stat-number">{comments}</span> Comments
                    </span>
                    <span>
                        <span className="stat-number">{shares}</span> Shares
                    </span>
                </div> */}

            <div className="post-stats flex justify-between items-center">
                <div className="flex gap-4">
                    <div className="flex gap-2">
                        <div className="react bg-[url('/assets/images/happy.png')] "></div>
                        {likes}
                    </div>

                    <div className="flex gap-2">
                        <div className="react bg-[url('/assets/images/angry.png')]  "></div>
                        {angries}
                    </div>

                    <div className="flex gap-2">
                        <div className="react bg-[url('/assets/images/sad.png')] "></div>
                        {sads}
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="react bg-[url('/assets/images/comment.png')]  "></div>
                    {comments}
                    <div className="react bg-[url('/assets/images/share.png')] "></div>
                    {shares}
                </div>
            </div>
        </article>
    );
};

export default PostCardStatic;
