// src/components/profile/UserList.jsx
import React from "react";
// Remove the useSocket import since we're passing data directly
// import { useSocket } from '../../SocketContext'; // Adjust path as necessary
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
          <img className="w-5 lg:w-7" src="assets/images/friends.png" alt="" />
          <p className="text-lg text-blue-900 lg:text-2xl">Trendmates</p>
        </div>
        <p className="no-users text-teamcolor">No other users found.</p>;
      </section>
    );
  }

  return (
    <section className="order-1 lg:order-3 lg:flex-1 lg:mr-4 min-w-0 top-0 z-20 lg:static">
      <div className="user-list font-balthazar bg-gray-400/30 backdrop-blur-md no-scrollbar lg:backdrop-blur-none outline-cyan-50 outline-1 rounded-2xl w-full pt-2 lg:bg-gray-400/10 lg:rounded-3xl lg:my-4 lg:p-3 lg:overflow-y-auto  lg:h-[calc(100vh-35px)] lg:overflow-hidden">
        <div className="hidden items-center gap-2 p-1 lg:flex lg:flex-col lg:gap-0 lg:my-1 lg:p-3">
          <img className="w-5 lg:w-7" src="assets/images/friends.png" alt="" />
          <p className="text-lg text-blue-900 lg:text-2xl">Trendmates</p>
        </div>
        <ul className="users-grid flex items-center gap-3 overflow-x-auto no-scrollbar py-1 px-1 lg:block lg:overflow-visible lg:py-0 lg:px-0">
          {validUsers
            .filter((user) => user.id !== currentUser.id)
            .map((user) => {
              // Determine online status using the helper function and the passed state
              const online = isUserOnline(user.id);
              return (
                <li
                  key={user.id}
                  className="user-card flex flex-col items-center w-16 flex-shrink-0 mb-0 lg:block lg:mb-4 lg:w-auto"
                >
                  <button
                    className="profile-link flex flex-col items-center gap-1 text-xs cursor-pointer pb-0 border-b-0 lg:pb-2 lg:flex-row lg:items-stretch lg:gap-1 lg:text-sm lg:border-b-1 lg:border-b-blue-300"
                    onClick={() => onViewProfile(user.id)}
                    aria-label={`View profile of ${user.name}`}
                  >
                    <div className="user-avatar-container relative">
                      <img
                        src={user.avatar || "assets/images/pf4.png"}
                        alt={`${user.name}'s avatar`}
                        className="user-avatar w-7 h-7 min-w-7 min-h-7 max-w-7 max-h-7 bg-gray-300 rounded-xl object-cover lg:w-12 lg:h-12 lg:min-w-12 lg:min-h-12 lg:max-w-12 lg:max-h-12"
                      />
                      {/* Apply the dynamically determined online status */}
                      <div
                        className={`online-status absolute -bottom-1 -right-1 lg:bottom-0 lg:-right-5 ${
                          online ? "online" : "offline"
                        }`}
                      >
                        <span
                          className={`status-text text-xs w-3 h-3 rounded-full overflow-hidden lg:w-auto lg:h-auto lg:px-1 lg:py-0.5 lg:rounded-md lg:overflow-visible ${
                            online
                              ? "bg-green-500/78 text-white"
                              : "bg-gray-400/78 text-white"
                          }`}
                        >
                          {online ? "Here" : "Out"}
                        </span>
                      </div>
                    </div>

                    <div className="user-info flex flex-col">
                      <strong className="roboto-serif-800 font-bold truncate max-w-14 lg:max-w-none lg:whitespace-normal lg:overflow-visible cursor-pointer wrap-break-word">
                        {user.name}
                      </strong>
                    </div>
                  </button>
                </li>
              );
            })}
        </ul>
      </div>
    </section>
  );
}
