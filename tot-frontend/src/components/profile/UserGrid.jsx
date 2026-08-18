import React, { useState, useEffect } from "react";
import { formatMediaUrl } from "../../utils/mediaUrl";

export default function UserGrid({
  users,
  currentUser,
  onFollow,
  onUnfollow,
  onViewProfile,
  showFollowButton = true,
}) {
  const validUsers = Array.isArray(users) ? users : [];

  // Local state to track follow status
  const [followStates, setFollowStates] = useState({});

  // Initialize follow states from users data
  useEffect(() => {
    const initialStates = {};
    validUsers.forEach((user) => {
      initialStates[user.id] = user.is_following || false;
    });
    setFollowStates(initialStates);
  }, [users]); // Re-run when users array changes

  const handleFollowToggle = async (userId, currentlyFollowing) => {
    try {
      // Optimistically update UI
      setFollowStates((prev) => ({
        ...prev,
        [userId]: !currentlyFollowing,
      }));

      // Call the appropriate action
      if (currentlyFollowing) {
        await onUnfollow(userId);
      } else {
        await onFollow(userId);
      }
    } catch (error) {
      // Rollback on error
      setFollowStates((prev) => ({
        ...prev,
        [userId]: currentlyFollowing,
      }));
      console.error("Follow action failed:", error);
    }
  };

  return (
    <div className="user-grid grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 p-1 w-full min-w-0">
      {validUsers.length === 0 ? (
        <p className="no-users error-message cherry-bomb text-xl text-red-500 col-span-full text-center py-6">
          No users found
        </p>
      ) : (
        validUsers.map((user) => {
          // Check if we have local state for this user, otherwise use prop value
          const isFollowing = followStates.hasOwnProperty(user.id)
            ? followStates[user.id]
            : user.is_following || false;

          return (
            <div
              key={user.id}
              className="user-card boxshadow2 p-3 sm:p-5 flex flex-col justify-between items-center w-full min-w-0 rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group"
            >
              <div
                className="user-avatar cursor-pointer mb-2 sm:mb-3 flex-shrink-0"
                onClick={() => onViewProfile && onViewProfile(user.id)}
              >
                <img
                  className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform duration-200"
                  src={formatMediaUrl(
                    user.avatar || user.profile_picture,
                    "/assets/images/pf4.png",
                  )}
                  alt={user.name || "User"}
                  onError={(e) => {
                    e.currentTarget.src = "/assets/images/pf4.png";
                  }}
                />
              </div>
              <div className="user-details flex flex-col justify-center items-center mb-2.5 sm:mb-3 w-full text-center min-w-0 px-1">
                <h3
                  className="roboto-serif-300 font-bold text-sm sm:text-lg text-center cursor-pointer truncate max-w-full hover:text-blue-900 transition-colors"
                  title={user.name || "Unknown User"}
                  onClick={() => onViewProfile && onViewProfile(user.id)}
                >
                  {user.name || "Unknown User"}
                </h3>
                <p
                  className="text-[11px] sm:text-sm text-gray-700/80 truncate max-w-full mt-0.5"
                  title={user.email || ""}
                >
                  {user.email || "No email"}
                </p>
              </div>

              {showFollowButton && user.id !== currentUser?.id && (
                <button
                  className={`rounded-xl py-1 sm:py-1.5 px-2 sm:px-4 text-xs sm:text-sm font-semibold cursor-pointer w-full mt-auto transition-all duration-200 active:scale-95 ${
                    isFollowing
                      ? "boxshadow2 text-gray-800 hover:bg-red-500/20 hover:text-red-700"
                      : "bg-[#5978A4] text-white hover:bg-[#486388] shadow-sm"
                  }`}
                  onClick={() => handleFollowToggle(user.id, isFollowing)}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
