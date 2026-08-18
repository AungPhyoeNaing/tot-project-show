import React, { useState, useRef, useEffect } from "react";
import apiClient from "../../api/apiClient";
import { formatMediaUrl } from "../../utils/mediaUrl";
import "./CreatePostForm.css";

export default function CreatePostForm({
  onCreatePost,
  categories,
  currentUser,
}) {
  const [body, setBody] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [mediaUrl, setMediaUrl] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [error, setError] = useState(null);
  const [categoryId, setCategoryId] = useState("");
  const [expanded, setExpanded] = useState(false);

  const fileInputRef = useRef(null);
  const readerRef = useRef(null);
  const fileDialogOpenRef = useRef(false);

  useEffect(() => {
    const handleWindowFocus = () => {
      fileDialogOpenRef.current = false;
    };
    window.addEventListener("focus", handleWindowFocus);
    return () => {
      if (readerRef.current) readerRef.current.abort();
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      setError("File too large (max 20MB)");
      return;
    }
    setSelectedFile(file);
    fileDialogOpenRef.current = false;

    // Create local preview immediately
    if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }

    // Auto-upload the selected file
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await apiClient.post("/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const returnedType = data.data.type;
      const mime = data.data.mime || "";
      const type = ["image", "audio", "video"].includes(returnedType)
        ? returnedType
        : mime.startsWith("image/")
          ? "image"
          : mime.startsWith("audio/")
            ? "audio"
            : mime.startsWith("video/")
              ? "video"
              : returnedType;
      setMediaUrl(data.data.url);
      setMediaType(type);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryId) {
      setError("Please choose a category.");
      return;
    }
    if (uploading) {
      setError("Please wait for media to finish uploading.");
      return;
    }
    const postData = {
      body: body.trim() || null,
      media_url: mediaUrl || null,
      media_type: mediaType || null,
      category: categoryId,
    };
    if (!postData.body && !postData.media_url) {
      setError("Please add text or media.");
      return;
    }
    setPosting(true);
    setError(null);
    try {
      await onCreatePost(postData);
      setBody("");
      setMediaUrl(null);
      setMediaType(null);
      setSelectedFile(null);
      setPreview(null);
      setCategoryId("");
      setExpanded(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError("Failed to create post.");
    } finally {
      setPosting(false);
    }
  };

  const removeMedia = () => {
    setMediaUrl(null);
    setMediaType(null);
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleButtonClick = () => {
    fileDialogOpenRef.current = true;
    fileInputRef.current?.click();
  };

  //for categoryselectedimg
  const getSelectedImage = () => {
    if (!categoryId) return "/assets/images/app.png";

    const category = categories?.find(
      (c) => String(c.id) === String(categoryId),
    );
    if (!category) return "/assets/images/app.png";

    switch (category.name.toLowerCase()) {
      case "entertainment":
        return "/assets/images/tv.png";
      case "news":
        return "/assets/images/news.png";
      case "announcement":
        return "/assets/images/announce.png";
      case "memes":
        return "/assets/images/memes.png";
      case "study":
        return "/assets/images/study.png";
      default:
        return "/assets/images/app.png";
    }
  };

  return (
    <article
      className="create-post-form boxshadow px-3 sm:px-5 py-3 rounded-2xl mt-3 mb-2 mx-auto shadow-lg w-full max-w-full"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          const hasPendingMedia =
            selectedFile || preview || mediaUrl || uploading || posting;
          if (!hasPendingMedia && !fileDialogOpenRef.current && !body.trim()) {
            setExpanded(false);
          }
        }
      }}
    >
      <form
        className="createContainer flex flex-col gap-2.5 w-full"
        onSubmit={handleSubmit}
        aria-label="Create new post"
      >
        {/* Author Avatar & Text Input */}
        <div className="flex gap-2.5 sm:gap-3 items-start">
          <div className="rounded-full flex-shrink-0 pt-0.5">
            <img
              src={formatMediaUrl(
                currentUser?.avatar || currentUser?.profile_picture,
                "/assets/images/user.png",
              )}
              alt={`${currentUser?.name || "User"}'s avatar`}
              className="post-author-avatar rounded-2xl w-10 h-10 sm:w-12 sm:h-12 object-cover"
              onError={(e) => {
                e.currentTarget.src = "/assets/images/user.png";
              }}
            />
          </div>
          <textarea
            className="post-textarea text-base sm:text-xl w-full resize-none bg-transparent outline-none placeholder-black/70 focus:placeholder-black/20 font-balthazar min-h-[38px] pt-1 leading-snug"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onFocus={() => setExpanded(true)}
            placeholder="What's on your mind?"
            rows={expanded ? 2 : 1}
            maxLength="1000"
            aria-label="Post content"
          ></textarea>
        </div>

        {/* Expanded Controls & Media Preview */}
        {expanded && (
          <div className="flex flex-col gap-2.5 w-full pt-1 border-t border-cyan-50/40">
            {/* Media Preview Container */}
            {(preview || mediaUrl) && (
              <div className="media-preview-container relative w-full rounded-2xl overflow-hidden bg-black/5 p-1.5 sm:p-2 border border-white/40 flex flex-col items-center">
                {/* Remove button */}
                <button
                  type="button"
                  onClick={removeMedia}
                  className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center text-lg leading-none transition-colors cursor-pointer shadow-md"
                  title="Remove media"
                  aria-label="Remove media"
                >
                  &times;
                </button>

                {/* Uploading overlay */}
                {uploading && (
                  <div className="absolute inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center z-10 rounded-2xl">
                    <span className="text-white text-xs sm:text-sm font-semibold bg-black/60 px-3 py-1 rounded-full">
                      ⏳ Uploading media...
                    </span>
                  </div>
                )}

                {/* Image preview */}
                {(mediaType === "image" || (!mediaType && selectedFile?.type?.startsWith("image/"))) && (
                  <img
                    src={preview || formatMediaUrl(mediaUrl)}
                    alt="Media preview"
                    className="max-h-56 sm:max-h-80 w-full object-contain rounded-xl"
                  />
                )}

                {/* Video preview */}
                {(mediaType === "video" || (!mediaType && selectedFile?.type?.startsWith("video/"))) && (
                  <video
                    controls
                    src={preview || formatMediaUrl(mediaUrl)}
                    className="max-h-56 sm:max-h-80 w-full rounded-xl"
                    aria-label="Video preview"
                  />
                )}

                {/* Audio preview */}
                {mediaType === "audio" && (
                  <audio
                    controls
                    src={formatMediaUrl(mediaUrl)}
                    className="w-full mt-2"
                    aria-label="Audio preview"
                  />
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <p className="text-red-500 cherry-bomb text-xs sm:text-sm text-center">
                {error}
              </p>
            )}

            {/* Actions Bar */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                {/* Category Picker */}
                <div className="category-picker flex gap-1.5 items-center">
                  <select
                    className="boxshadow cursor-pointer hover:scale-105 duration-200"
                    id="cat"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    style={{
                      backgroundImage: `url(${getSelectedImage()})`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                      backgroundSize: "20px",
                    }}
                  >
                    <option
                      className="boxshadow"
                      value=""
                      style={{
                        backgroundSize: "16px",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        cursor: "pointer",
                        backgroundImage: `url('/assets/images/app.png')`,
                      }}
                    ></option>
                    {categories?.length > 0 &&
                      categories.map((c) => {
                        let label = "";
                        let img = "";
                        switch (c.name.toLowerCase()) {
                          case "entertainment":
                            label = "Entertainment";
                            img = "/assets/images/tv.png";
                            break;

                          case "news":
                            label = "News";
                            img = "/assets/images/news.png";
                            break;

                          case "announcement":
                            label = "Announcement";
                            img = "/assets/images/announce.png";
                            break;

                          case "memes":
                            label = "Memes";
                            img = "/assets/images/memes.png";
                            break;

                          case "study":
                            label = "Study";
                            img = "/assets/images/study.png";
                            break;

                          default:
                            label = "";
                            break;
                        }
                        return (
                          <option
                            className="boxshadow"
                            key={c.id}
                            value={c.id}
                            title={label}
                            style={{
                              backgroundSize: "16px",
                              backgroundRepeat: "no-repeat",
                              backgroundPosition: "center",
                              cursor: "pointer",
                              backgroundImage: `url(${img})`,
                            }}
                          ></option>
                        );
                      })}
                  </select>
                  <span className="text-xs sm:text-sm font-medium">Category</span>
                </div>

                {/* Media Attachment Button */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleButtonClick}
                    className="choose-file-btn w-7 h-7 cursor-pointer hover:scale-110 duration-200 bg-[url('/assets/images/gallery.png')] bg-cover bg-center bg-no-repeat flex-shrink-0"
                    disabled={uploading || posting}
                    title="Attach Photo or Video"
                    aria-label="Choose media file to upload"
                  />
                  <span className="text-xs sm:text-sm font-medium hidden xs:inline">
                    Media
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,audio/*,video/*"
                  disabled={uploading || posting}
                  className="hidden"
                  aria-hidden="true"
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="submit"
                  disabled={uploading || posting}
                  className={`post-btn w-6 h-6 sm:w-7 sm:h-7 bg-[url('/assets/images/send.png')] bg-cover bg-center cursor-pointer hover:bg-[url('/assets/images/sends.png')] hover:scale-110 duration-200 disabled:opacity-40 flex-shrink-0 ${
                    posting ? "animate-pulse" : ""
                  }`}
                  title="Publish post"
                  aria-label="Publish post"
                />
              </div>
            </div>

            {posting && (
              <div className="w-full text-center text-xs text-blue-900 font-semibold">
                🚀 Publishing post...
              </div>
            )}
          </div>
        )}
      </form>
    </article>
  );
}
