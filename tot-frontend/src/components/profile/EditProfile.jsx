// src/components/EditProfile.jsx
import React, { useState } from "react";
import { formatMediaUrl } from "../../utils/mediaUrl";
import "./EditProfile.css"; // Optional: Import CSS for styling

const EditProfile = ({ user, onUpdateProfile, onGoToMyProfile }) => {
    // Receive user data and update function
    const [formData, setFormData] = useState({
        username: user?.name || "", // Use 'name' from user object
        profilePicture: null, // For the new image file
    });
    const initialAvatar =
        user?.profilePicture || user?.avatar || user?.profile_picture || "";
    const [previewUrl, setPreviewUrl] = useState(initialAvatar); // For image preview
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Basic validation (optional)
            if (!file.type.startsWith("image/")) {
                setError("Please select an image file.");
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                // Example: 2MB limit
                setError("Image size should be less than 2MB.");
                return;
            }
            setError(""); // Clear any previous error

            setFormData((prevData) => ({
                ...prevData,
                profilePicture: file,
            }));

            // Create a preview URL for the selected file
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);

            // Clean up the URL object when component unmounts or a new image is selected
            return () => URL.revokeObjectURL(url);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Prepare data to send
            // If no new image is selected, send the existing URL or null
            // If a new image is selected, you might need to handle file upload separately
            // This example assumes the parent handles the file upload logic if needed
            // and passes back the updated URL or handles the update internally.
            // Here, we'll just pass the formData which includes the file object if changed.
            await onUpdateProfile({ ...formData }); // Pass the new data to the parent

            // Optionally, show a success message or redirect back to profile
            onGoToMyProfile(); // Navigate back to the profile view after saving
        } catch (err) {
            console.error("Error updating profile:", err);
            setError("Failed to update profile. Please try again.");
        }
    };

    return (
        <section className="editContainer rounded-3xl lg:h-[540px] lg:mr-8 my-4 lg:my-auto bg-[#5978A433] font-balthazar lg:overflow-hidden py-5 w-full">
            <div className="edit-profile-container boxshadow  rounded-4xl px-4 sm:px-7 pt-2 mx-auto flex flex-col w-full lg:w-120 lg:h-full lg:overflow-y-auto lg:no-scrollbar">
                <div className="chat-header -mx-7 py-3 border-b-2 border-b-cyan-50/70 ">
                    <h2 className="text-3xl text-center">Edit Profile</h2>
                </div>

                {error && (
                    <p className="error-message text-red-500 cherry-bomb absolute text-sm sm:text-xl left-4 right-4 sm:left-120 sm:right-auto z-99 top-5 text-center">
                        {error}
                    </p>
                )}
                <form
                    onSubmit={handleSubmit}
                    className="px-5 py-4 my-5 flex flex-col gap-6"
                >
                    <div className="form-group flex flex-col gap-2">
                        <label htmlFor="username" className="text-xl">
                            Username:
                        </label>
                        <input
                            className="boxshadow2 outline-0 rounded-2xl text-xl px-4 py-2"
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            // Removed 'required' attribute to make it optional
                        />
                    </div>
                    <div className="form-group flex flex-col gap-2">
                        <label htmlFor="profilePicture" className="text-xl">
                            Profile Picture:
                        </label>
                        {previewUrl && (
                            <div className="image-preview ">
                                <img
                                    src={formatMediaUrl(previewUrl, "/assets/images/pf4.png")}
                                    alt="Profile Preview"
                                    className="w-25 h-25 object-cover rounded-full"
                                    onError={(e) => {
                                        e.currentTarget.src = "/assets/images/pf4.png";
                                    }}
                                />
                            </div>
                        )}
                        <input
                            className="boxshadow2 outline-0 rounded-2xl text-lg px-4 py-2 cursor-pointer "
                            type="file"
                            id="profilePicture"
                            name="profilePicture"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </div>
                    <div className="form-actions flex justify-between items-center">
                        <button
                            type="button"
                            onClick={onGoToMyProfile}
                            className="canclebtn boxshadow2 rounded-xl px-2 py-1 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="savebtn boxshadow2 rounded-xl px-2 py-1 cursor-pointer"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default EditProfile;
