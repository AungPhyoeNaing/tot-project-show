// src/components/profile/ProfileView.jsx
import React, { useState } from "react";
import UserGrid from "./UserGrid.jsx";
import PostCardStatic from "../feed/PostCardStatic.jsx";
import { formatMediaUrl } from "../../utils/mediaUrl";
import "./ProfileView.css";

export default function ProfileView({
  profileUser,
  profileData,
  onGoToEditProfile,
  currentUser,
  loading,
  onFollow,
  onUnfollow,
  onViewProfile,
  onChat, // <-- Accept the onChat prop for initiating chats
  onReportUser, // <-- Accept the new onReportUser prop
}) {
  const [activeTab, setActiveTab] = useState("following");

  if (loading) {
    return <p className="loader"></p>;
  }

  if (!profileUser) {
    return <p className="error">User not found</p>;
  }

  // Determine if the profile being viewed is the current user's own profile
  const isOwnProfile = profileUser.id === currentUser.id;

  // Determine if the current user is following the profile user
  // Use optional chaining and nullish coalescing for safety
  const isFollowing = profileUser.is_following ?? false;
  const isMutualFollow = profileData?.isMutualFollow ?? false;
  // Handler for follow/unfollow button click
  const handleFollowAction = () => {
    if (isFollowing) {
      onUnfollow(profileUser.id);
    } else {
      onFollow(profileUser.id);
    }
  };

  return (
    <div className="profile-container w-full lg:overflow-y-auto lg:no-scrollbar rounded-3xl lg:h-[552px] lg:mr-4 my-4 bg-[#5978A433] font-balthazar overflow-visible lg:overflow-hidden p-4 sm:p-7">
      {/* Profile Header Section */}
      <div className="profile-header outline-1 outline-cyan-50/80 rounded-3xl px-4 sm:px-7 py-4 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-10 bg-white/10 shadow-lg">
        {/* Profile Avatar/Image */}
        <div className="profile-avatar ">
          <img
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover"
            // Use the profileUser's avatar field (returned by backend), fallback to placeholder if not available
            src={formatMediaUrl(
              profileUser.avatar || profileUser.profile_picture,
              "/assets/images/user.png",
            )}
            alt={`${profileUser.name || "User"}'s avatar`}
            onError={(e) => {
              e.currentTarget.src = "/assets/images/user.png";
            }}
          />
        </div>

        {/* Profile Information */}
        <div className="profile-info  w-full flex flex-col justify-between gap-3">
          {/* User's Name and Handle */}
          <div>
            <h1 className="roboto-serif-300 font-bold text-3xl sm:text-5xl text-center sm:text-left ">
              {profileUser.name || "Unknown User"}
            </h1>
            <p className="text-sm text-center sm:text-left">
              {profileUser.email || "No email"}
            </p>
          </div>

          {isOwnProfile && (
            <div className="profile-actions flex flex-wrap justify-center sm:justify-start items-center gap-4 sm:gap-48">
              {" "}
              {/* Container for Edit profile buttons */}
              <button
                className="py-1 px-8 sm:px-12 rounded-xl text-base sm:text-xl boxshadow2 boxshadow cursor-pointer"
                onClick={onGoToEditProfile}
              >
                Edit Profile
              </button>
            </div>
          )}

          {/* Action Buttons (Follow/Unfollow and Message) */}
          {/* Only show action buttons if it's not the user's own profile */}
          {!isOwnProfile && (
            <div className="profile-actions flex flex-wrap justify-center sm:justify-start items-center gap-4 sm:gap-48">
              {" "}
              {/* Container for buttons */}
              {/* Follow/Unfollow Button */}
              <button
                className="py-1 px-8 sm:px-12 rounded-xl text-base sm:text-xl boxshadow2 boxshadow cursor-pointer"
                onClick={handleFollowAction}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
              {/* Message Button */}
              {/* Added onClick handler to initiate chat with this user */}
              {isMutualFollow && onChat && (
                <button
                  className="message-button py-1 px-8 sm:px-12 rounded-xl text-base sm:text-xl boxshadow2 boxshadow cursor-pointer" // You can style this class in your CSS
                  onClick={() => onChat(profileUser)} // Pass the entire profileUser object
                >
                  Message
                </button>
              )}
              {/* Updated button handler to pass both user.id and user.name */}
              <button
                className=" report-btn py-1 px-8 sm:px-12 rounded-xl text-base sm:text-xl boxshadow2 boxshadow cursor-pointer"
                onClick={() => onReportUser(profileUser.id, profileUser.name)} // Pass both ID and NAME
              >
                Report
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="profile-tabs flex justify-around items-center text-sm sm:text-[22px] border-b-2 border-b-cyan-50/70 -mx-4 sm:-mx-7 h-10">
        <button
          className="cursor-pointer hover:border-b-2 hover:border-b-teamcolor duration-50 ease-in-out focus:border-b-2 focus:border-b-teamcolor"
          onClick={() => setActiveTab("following")}
        >
          <span className="text-base sm:text-2xl boxshadow2 px-2 py-1 rounded-xl ">
            {profileData.following?.length ?? 0}
          </span>{" "}
          Following
        </button>
        <button
          className="cursor-pointer hover:border-b-2 hover:border-b-teamcolor duration-50 ease-in-out focus:border-b-2 focus:border-b-teamcolor"
          onClick={() => setActiveTab("followers")}
        >
          <span className="text-base sm:text-2xl boxshadow2 px-2 py-1 rounded-xl ">
            {profileData.followers?.length ?? 0}
          </span>{" "}
          Followers
        </button>
        {/* 👇 ADD THIS — Posts Tab Button */}
        <button
          className="cursor-pointer hover:border-b-2 hover:border-b-teamcolor duration-50 ease-in-out focus:border-b-2 focus:border-b-teamcolor"
          onClick={() => setActiveTab("posts")}
        >
          <span className="text-base sm:text-2xl boxshadow2 px-2 py-1 rounded-xl ">
            {profileData.posts?.length ?? 0}
          </span>{" "}
          Posts
        </button>
      </div>

      {/* Tab Content Area */}

      <div className="profile-content py-5">
        {/* Display list of users being followed */}

        {activeTab === "following" && (
          <UserGrid
            users={profileData.following ?? []}
            currentUser={currentUser}
            onFollow={onFollow}
            onUnfollow={onUnfollow}
            onViewProfile={onViewProfile}
            showFollowButton={true}
          />
        )}

        {/* Display list of followers */}
        {activeTab === "followers" && (
          <UserGrid
            users={profileData.followers ?? []}
            currentUser={currentUser}
            onFollow={onFollow}
            onUnfollow={onUnfollow}
            onViewProfile={onViewProfile}
            showFollowButton={true}
          />
        )}

        {activeTab === "posts" && (
          <div className="posts-grid p-2 columns-1 sm:columns-2 gap-5">
            {profileData.posts && profileData.posts.length > 0 ? (
              profileData.posts.map((post) => (
                <PostCardStatic key={post.id} post={post} />
              ))
            ) : (
              <p className="no-posts error-message cherry-bomb text-xl text-red-500">
                No posts yet.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
