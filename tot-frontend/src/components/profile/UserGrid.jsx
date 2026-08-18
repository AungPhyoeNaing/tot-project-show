import React, { useState, useEffect } from "react";

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
    <div className="user-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {validUsers.length === 0 ? (
        <p className="no-users error-message cherry-bomb text-xl text-red-500">
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
              className="user-card boxshadow1 py-4 px-6 sm:px-15 flex flex-col justify-center items-center w-full sm:w-fit rounded-xl"
            >
              <div
                className="user-avatar"
                onClick={() => onViewProfile(user.id)}
              >
                <img
                  className="w-20 h-20 sm:w-25 sm:h-25 rounded-xl"
                  src={user.avatar || "assets/images/pf4.png"}
                  alt={user.name}
                />
              </div>
              <div className="user-details flex flex-col justify-center items-center mb-2">
                <h3
                  className="roboto-serif-300 font-bold text-xl sm:text-3xl text-center"
                  onClick={() => onViewProfile(user.id)}
                >
                  {user.name || "Unknown User"}
                </h3>
                <p className="text-sm">{user.email || "No email"}</p>
              </div>

              {showFollowButton && user.id !== currentUser.id && (
                <button
                  className="boxshadow2 rounded-xl py-1 cursor-pointer w-full"
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
