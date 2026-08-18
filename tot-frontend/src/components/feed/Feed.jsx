// src/components/Feed.jsx (Updated - no more category filtering UI)
import React, { useState, useEffect } from "react";
import CreatePostForm from "./CreatePostForm.jsx";
import Post from "./Post.jsx";
import "./Feed.css";

const Feed = ({
  user,
  posts,
  onCreatePost,
  onDeletePost,
  socket,
  onViewProfile,
  categories,
  selectedCats, // Receive filtered posts from parent
  toggleCat,
}) => {
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    if (selectedPost) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [selectedPost]);

  // Filter posts based on selected categories passed from parent
  const filtered =
    selectedCats.length === 0
      ? posts
      : posts.filter((p) => selectedCats.includes(p.category));

  const handleViewOriginalPost = (postId) => {
    const originalPost = posts.find((p) => p.id === postId);
    if (originalPost) {
      setSelectedPost(originalPost);
    } else {
      setSelectedPost({ id: postId, loading: true });
    }
  };

  const handleBackToFeed = () => setSelectedPost(null);

  if (selectedPost) {
    return (
      <div className="no-scrollbar lg:h-[calc(100vh-35px)] lg:overflow-y-auto px-4 order-2 lg:flex-8 min-w-0">
        <div className="single-post-view lg:mr-3">
          <div className="flex flex-wrap justify-between items-center gap-2 px-2 sm:px-0">
            <h3 className="py-2 px-3 border-2 rounded-2xl border-teamcolor w-fit cherry-bomb my-6">
              Original Post
            </h3>
            <button
              onClick={handleBackToFeed}
              className="back-button boxshadow rounded-2xl py-2 px-3 my-6  cursor-pointer "
            >
              ← Back to Feed
            </button>
          </div>

          <Post
            post={selectedPost}
            currentUser={user}
            onDeletePost={onDeletePost}
            onViewProfile={onViewProfile}
            onViewOriginalPost={handleViewOriginalPost}
            socket={socket}
          />
        </div>
      </div>
    );
  }

  return (
    <section className="order-2 lg:flex-8 lg:max-h-screen min-w-0">
      <div className="feed lg:overflow-y-auto no-scrollbar lg:h-[calc(100vh-35px)] outline-cyan-50 outline-1 rounded-3xl  w-full mx-auto my-4 bg-gray-400/10 font-balthazar lg:overflow-hidden">
        <div className="border-b border-b-cyan-50 py-2 px-4 sm:px-8">
          <header>
            <h3 className="text-center text-xl sm:text-2xl text-blue-500 font-black mt-3 sm:mt-4">
              Hello, <span className="text-blue-900">{user?.name}</span>! Ready
              to explore?
            </h3>
          </header>
          <CreatePostForm
            onCreatePost={onCreatePost}
            categories={categories}
            currentUser={user}
          />
        </div>

        {/* Category filter UI on the Feed */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 py-4 sm:py-6 px-2 border-b border-white/20 relative z-10">
          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => toggleCat(cat.id)}
              className={`boxshadow px-2 py-1 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 backdrop-blur-md shadow-lg ${
                selectedCats.includes(cat.id)
                  ? " text-blue-800  scale-105"
                  : "bg-white/40 text-gray-800 border-white/50 hover:bg-white/60 hover:scale-105"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <div className="posts-grid p-3 sm:p-4 columns-1 sm:columns-2 gap-4">
          {filtered.length ? (
            filtered.map((post) => (
              <Post
                key={post.id}
                post={post}
                currentUser={user}
                onDeletePost={onDeletePost}
                onViewProfile={onViewProfile}
                onViewOriginalPost={handleViewOriginalPost}
                socket={socket}
              />
            ))
          ) : (
            <p className="error-message text-red-400 cherry-bomb mt-10 text-xl">
              No posts match the selected categories.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default Feed;
