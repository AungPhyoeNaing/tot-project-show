// src/components/profile/UserList.jsx
import React from "react";
import { formatMediaUrl } from "../../utils/mediaUrl";
import "./UserList.css"; // Create this CSS file for styling

export default function UserList({
  users,
  currentUser,
  onFollow,
  onUnfollow,
  onViewProfile,
  onChat,
  onReportUser,
  // --- RECEIVE THE NEW PROP ---
  onlineUsers,
  // --- END RECEIVE ---
}) {
  // --- CHECK IF USER IS ONLINE ---
  const isUserOnline = (userId) => {
    return onlineUsers?.has(userId); // Use optional chaining if onlineUsers might be null initially
  };
  // --- END CHECK ---

  const validUsers = Array.isArray(users) ? users : [];

  if (validUsers.length === 0) {
    return (
      <section className="user-list font-balthazar order-1 lg:order-3 lg:flex-1 flex flex-row items-center justify-center gap-2 outline-cyan-50 outline-1 rounded-2xl w-full lg:mr-4 my-2 p-2 bg-gray-400/10 lg:block lg:justify-start lg:rounded-3xl lg:my-4 lg:p-3 lg:overflow-hidden sticky top-0 z-20 lg:static no-scrollbar">
        <div className="flex items-center gap-2 my-1 p-1 lg:flex-col lg:gap-0 lg:my-2 lg:p-3">
          <img className="w-5 lg:w-7" src="/assets/images/friends.png" alt="" />
          <p className="text-lg text-blue-900 lg:text-2xl">Trendmates</p>
        </div>
        <p className="no-users text-teamcolor">No other users found.</p>
      </section>
    );
  }

  return (
    <section className="order-1 lg:order-3 lg:flex-1 lg:mr-4 min-w-0 w-full top-0 z-20 lg:static">
      <div className="user-list font-balthazar bg-gray-400/30 backdrop-blur-md no-scrollbar outline-cyan-50 outline-1 rounded-2xl w-full p-2.5 lg:bg-gray-400/10 lg:rounded-3xl lg:my-4 lg:p-3 lg:overflow-y-auto lg:h-[calc(100vh-35px)] flex flex-col">
        {/* Mobile Header Label */}
        <div className="flex items-center justify-between px-1 pb-1.5 lg:hidden flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <img className="w-4 h-4 object-contain" src="/assets/images/friends.png" alt="" />
            <span className="text-sm font-bold text-blue-900 leading-none">Trendmates</span>
          </div>
          <span className="text-[11px] text-blue-900/70 font-medium">
            {validUsers.filter((u) => u && u.id !== currentUser?.id).length} users
          </span>
        </div>

        {/* Desktop Header Label */}
        <div className="hidden items-center gap-2 p-1 lg:flex lg:flex-col lg:gap-0 lg:my-1 lg:p-2 flex-shrink-0">
          <img className="w-5 lg:w-7" src="/assets/images/friends.png" alt="" />
          <p className="text-lg text-blue-900 lg:text-2xl font-bold">Trendmates</p>
        </div>

        <ul className="users-grid flex items-center gap-3.5 overflow-x-auto no-scrollbar py-1 px-1 lg:flex lg:flex-col lg:gap-1.5 lg:overflow-y-auto lg:overflow-x-hidden lg:py-0 lg:px-0 flex-1 w-full">
          {validUsers
            .filter((user) => user && user.id !== currentUser?.id)
            .map((user) => {
              // Determine online status using the helper function and the passed state
              const online = isUserOnline(user.id);
              return (
                <li
                  key={user.id}
                  className="user-card flex-shrink-0 w-[68px] sm:w-[76px] lg:w-full mb-0 lg:mb-1"
                >
                  {/* Mobile View: Story-style Bubble (avoids any horizontal text clipping/overlap) */}
                  <div className="flex flex-col items-center w-full lg:hidden group">
                    <button
                      onClick={() => onViewProfile && onViewProfile(user.id)}
                      className="relative cursor-pointer flex flex-col items-center w-full focus:outline-none bg-transparent border-0 p-0"
                      aria-label={`View profile of ${user.name}`}
                    >
                      <div className="relative w-12 h-12 rounded-2xl p-0.5 ring-2 ring-white/60 shadow-xs bg-white/20 transition-transform group-hover:scale-105 active:scale-95 flex items-center justify-center flex-shrink-0">
                        <img
                          src={formatMediaUrl(
                            user.avatar || user.profile_picture,
                            "/assets/images/pf4.png",
                          )}
                          alt={user.name}
                          className="w-full h-full rounded-[14px] object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/assets/images/pf4.png";
                          }}
                        />
                        {/* Status indicator dot */}
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 block w-3 h-3 rounded-full border-2 border-white shadow-xs ${
                            online ? "bg-emerald-500" : "bg-gray-400"
                          }`}
                          title={online ? "Online" : "Offline"}
                        />
                      </div>
                      <strong className="roboto-serif-800 font-semibold text-[11px] text-blue-950 truncate max-w-full w-full text-center mt-1.5 leading-tight group-hover:text-blue-700 transition-colors">
                        {user.name}
                      </strong>
                    </button>
                  </div>

                  {/* Desktop View: Sidebar Row with Profile Link + Chat Button */}
                  <div className="hidden lg:flex items-center justify-between gap-2 w-full p-1.5 rounded-xl hover:bg-white/15 transition-colors">
                    <button
                      className="profile-link flex items-center gap-2 text-sm flex-1 min-w-0 text-left cursor-pointer bg-transparent border-0 p-0"
                      onClick={() => onViewProfile && onViewProfile(user.id)}
                      aria-label={`View profile of ${user.name}`}
                    >
                      <div className="user-avatar-container relative flex-shrink-0">
                        <img
                          src={formatMediaUrl(
                            user.avatar || user.profile_picture,
                            "/assets/images/pf4.png",
                          )}
                          alt={`${user.name}'s avatar`}
                          className="user-avatar w-10 h-10 min-w-10 min-h-10 max-w-10 max-h-10 bg-gray-300 rounded-xl object-cover shadow-xs"
                          onError={(e) => {
                            e.currentTarget.src = "/assets/images/pf4.png";
                          }}
                        />
                        {/* Apply the dynamically determined online status */}
                        <div className="online-status absolute -bottom-0.5 -right-0.5">
                          <span
                            className={`status-text block w-2.5 h-2.5 rounded-full border border-white shadow-xs ${
                              online
                                ? "bg-emerald-500 ring-1 ring-emerald-300"
                                : "bg-gray-400"
                            }`}
                            title={online ? "Online" : "Offline"}
                          />
                        </div>
                      </div>

                      <div className="user-info flex flex-col min-w-0 text-left flex-1">
                        <strong className="roboto-serif-800 font-bold text-sm text-blue-950 truncate cursor-pointer hover:text-blue-700 transition-colors">
                          {user.name}
                        </strong>
                        <span className="text-[10px] text-gray-600 leading-tight">
                          {online ? "Online" : "Offline"}
                        </span>
                      </div>
                    </button>

                    {onChat && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onChat(user);
                        }}
                        className="hidden lg:flex p-1.5 rounded-lg hover:bg-white/50 text-blue-900 transition-colors cursor-pointer flex-shrink-0"
                        title={`Chat with ${user.name}`}
                        aria-label={`Chat with ${user.name}`}
                      >
                        <img
                          src="/assets/images/chats.png"
                          className="w-4 h-4 object-contain"
                          alt=""
                        />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
        </ul>
      </div>
    </section>
  );
}
