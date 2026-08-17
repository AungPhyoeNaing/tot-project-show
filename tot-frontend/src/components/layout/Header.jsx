// src/components/layout/Header.jsx (Updated)
import React from "react";
import "./header.css";
import { useState } from "react";
import newsIcon from "/assets/images/newsc.png";
import memesIcon from "/assets/images/memescc.png";
import entertainmentIcon from "/assets/images/tvc.png";
import studyIcon from "/assets/images/studyc.png";
import announcementsIcon from "/assets/images/announcec.png";

const categoryIconMap = {
  News: newsIcon,
  Memes: memesIcon,
  Entertainment: entertainmentIcon,
  Study: studyIcon,
  Announcement: announcementsIcon,
};

// Define the mapping between views and their header buttons
const viewButtonMap = {
  feed: [
    { text: "My Profile", handlerName: "onGoToMyProfile" },
    { text: "Messages", handlerName: "onGoToChat" },
  ],
  profile: [
    { text: "Edit Profile", handlerName: "onGoToEditProfile" },
    { text: "Back to Feed", handlerName: "onGoToFeed" },
  ],
  editProfile: [{ text: "Back to Feed", handlerName: "onGoToFeed" }],
  chat: [{ text: "Back to Feed", handlerName: "onGoToFeed" }],
};

export default function Header({
  user,
  currentView,
  onGoToFeed,
  onGoToMyProfile,
  onGoToEditProfile,
  onGoToChat,
  onLogout,
  categories,
  selectedCats,
  toggleCat,
  showPills,
  setShowPills,
}) {
  const [active, setActive] = useState(false);
  // If no user is logged in, don't render the header content
  if (!user) return null;

  // Get the button configuration for the current view
  const buttons = viewButtonMap[currentView] || viewButtonMap.feed;

  // Create a mapping object for handler functions to make dynamic access easier
  const handlerMap = {
    onGoToFeed,
    onGoToMyProfile,
    onGoToEditProfile,
    onGoToChat,
  };

  return (
    <header>
      <nav className="navbar flex lg:flex-col w-full lg:w-20 lg:h-screen items-center justify-between lg:justify-start px-4 lg:px-8 py-2 lg:py-15 gap-2 lg:gap-9">
        <div className="logo w-fit hidden lg:flex">
          <span className="logoContainer w-12 h-12  flex items-center justify-center font-bold mx-auto mb-1">
            <img className="object-cover rounded-full" src="tot.jpg" alt="" />
          </span>
        </div>

        <div className="group flex flex-col items-center gap-1">
          <button
            className="homeBtn icon bg-[url('/assets/images/home.png')] hover:bg-[url('/assets/images/solidHome.png')]"
            onClick={onGoToFeed}
          ></button>
          <p className="invisible group-hover:visible text-xs ">Home</p>
        </div>

        <div className="group flex flex-col items-center gap-1">
          <button
            className=" contactBtn icon bg-[url('/assets/images/contact.png')] hover:bg-[url('/assets/images/medias.png')]"
            onClick={onGoToChat}
          ></button>
          <p className="invisible group-hover:visible text-xs">Chat</p>
        </div>

        {/* Category filter button - only show on feed view */}
        {currentView === "feed" && categories && categories.length > 0 && (
          <>
            <div
              className="group flex flex-col items-center gap-1"
              onClick={() => setActive(!active)}
            >
              <button
                className="categoryBtn icon bg-[url('/assets/images/app.png')] hover:bg-[url('/assets/images/apps.png')]"
                onMouseEnter={() => setShowPills(true)}
                onClick={() => setShowPills((v) => !v)}
              ></button>
              <p className="invisible group-hover:visible text-xs">Category</p>
            </div>

            <div className={`menu ${active ? "active" : ""}`}>
              <li
                style={{ "--i": 0, "--clr": "#1877f2" }}
                title="Announcements"
                className="boxshadow"
                onClick={() => toggleCat("announcement")}
              >
                <input
                  className="opacity-0 w-0 h-0 absolute"
                  type="checkbox"
                  checked={selectedCats.includes("announcement")}
                  onChange={() => toggleCat("announcement")}
                  readOnly
                />
                <img src="assets/images/announce.png" alt="Announcements" />
              </li>
              <li
                style={{ "--i": 1, "--clr": "#25d366" }}
                title="Study"
                className="boxshadow"
                onClick={() => toggleCat("study")}
              >
                <input
                  className="opacity-0 w-0 h-0 absolute"
                  type="checkbox"
                  checked={selectedCats.includes("study")}
                  onChange={() => toggleCat("study")}
                  readOnly
                />
                <img src="assets/images/study.png" alt="Study" />
              </li>
              <li
                style={{ "--i": 2, "--clr": "#1b1e21" }}
                title="Entertainment"
                className="boxshadow"
                onClick={() => toggleCat("entertainment")}
              >
                <input
                  className="opacity-0 w-0 h-0 absolute"
                  type="checkbox"
                  checked={selectedCats.includes("entertainment")}
                  onChange={() => toggleCat("entertainment")}
                  readOnly
                />
                <img src="assets/images/tv.png" alt="Entertainment" />
              </li>
              <li
                style={{ "--i": 3, "--clr": "#ff5733" }}
                title="Memes"
                className="boxshadow"
                onClick={() => toggleCat("memes")}
              >
                <input
                  className="opacity-0 w-0 h-0 absolute"
                  type="checkbox"
                  checked={selectedCats.includes("memes")}
                  onChange={() => toggleCat("memes")}
                  readOnly
                />
                <img src="assets/images/memes.png" alt="Memes" />
              </li>
              <li
                style={{ "--i": 4, "--clr": "#0a66c2" }}
                title="News"
                className="boxshadow"
                onClick={() => toggleCat("news")}
              >
                <input
                  className="opacity-0 w-0 h-0 absolute"
                  type="checkbox"
                  checked={selectedCats.includes("news")}
                  onChange={() => toggleCat("news")}
                  readOnly
                />
                <img src="assets/images/news.png" alt="News" />
              </li>
            </div>
          </>
        )}

        <div className="group flex flex-col items-center gap-1">
          <button
            className=" profileBtn icon bg-[url('/assets/images/user.png')] hover:bg-[url('/assets/images/users.png')]"
            onClick={onGoToMyProfile}
          ></button>
          <p className="invisible group-hover:visible text-xs">Profile</p>
        </div>

        {/* Always show Logout */}
        <div className="group flex flex-col items-center gap-1">
          <button
            className=" logoutBtn icon bg-[url('/assets/images/out.png')] hover:bg-[url('/assets/images/logouts.png')]"
            onClick={onLogout}
          ></button>
          <p className="invisible group-hover:visible text-xs">Logout</p>
        </div>
      </nav>
    </header>
  );
}
