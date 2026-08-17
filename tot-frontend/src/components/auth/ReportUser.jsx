// src/components/auth/ReportUser.jsx
import React, { useState } from "react";
import { reportUser } from "../../api/authService"; // You'll need to add this API call
import "./extraview.css";

export default function ReportUser({
    onBackToHome,
    reportedUserName,
    reportedUserId,
}) {
    // Accept both name and ID
    const [formData, setFormData] = useState({
        reported_user_id: reportedUserId || "", // Store the ID for submission
        reported_user_name: reportedUserName || "", // Store the name for display (optional, but can be sent if backend expects it)
        reason: "",
    });
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            // Call the new API endpoint, sending the ID (and potentially the name if backend expects it)
            await reportUser(formData);
            setSuccessMessage(
                "Your report's been submitted successfully. Admin will review it soon."
            );
            // Optionally reset the form
            setFormData({
                reported_user_id: reportedUserId || "", // Keep pre-filled ID if applicable
                reported_user_name: reportedUserName || "", // Keep pre-filled name if applicable
                reason: "",
            });
        } catch (err) {
            console.error("Error submitting report:", err);
            const errorMsg = err.response?.data?.message
                ? err.response.data.message
                : "An error occurred while submitting your report. Please try again.";
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="auth-section rounded-3xl lg:h-[540px] lg:mr-8 my-4 lg:my-auto bg-[#5978A433] font-balthazar lg:overflow-hidden py-5 w-full">
            {error && (
                <div className="error-message text-red-500 relative text-center text-lg sm:text-xl cherry-bomb mb-3">
                    {error}
                </div>
            )}
            {successMessage && (
                <div className="success-message relative text-center text-green-500 text-lg sm:text-xl cherry-bomb mb-3">
                    {successMessage}
                </div>
            )}

            <div className="edit-profile-container boxshadow  rounded-4xl px-4 sm:px-7 pt-2 mx-auto flex flex-col w-full lg:w-120 lg:h-full lg:overflow-y-auto lg:no-scrollbar">
                <div className="chat-header -mx-7 py-3 border-b-2 border-b-cyan-50/70 ">
                    <h2 className="text-2xl text-center">Report Trendmate</h2>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="px-5 py-7 mb-5 flex flex-col gap-6"
                >
                    <input
                        className="absolute top-0"
                        type="hidden" // Hide the ID field, it's for submission only
                        name="reported_user_id"
                        value={formData.reported_user_id}
                        onChange={handleChange} // Still handle change for state consistency if needed, though hidden
                    />
                    {/* Display the Name as a disabled input or text */}
                    <div className="input-group flex flex-col">
                        {" "}
                        {/* Optional: Wrap for styling */}
                        <label htmlFor="email" className="text-lg">
                            {" "}
                            Trendmate name
                            <span className="text-gray-500">
                                ( who you want to report )
                            </span>
                        </label>
                        <input
                            className="boxshadow2 outline-0 rounded-xl text-lg px-4 py-1 focus:placeholder-gray-400/50"
                            type="text"
                            name="reported_user_name" // This field is just for display, can be disabled
                            placeholder="User Name to Report"
                            value={formData.reported_user_name} // Show the name
                            onChange={handleChange} // Handle change for state consistency if needed, though disabled
                            disabled // Make it read-only so user sees the name but can't edit it
                            required // Keep required if backend validation requires it, otherwise remove
                        />
                    </div>
                    {/* Alternative: Show name as plain text instead of input */}
                    {/* <p><strong>Reporting User:</strong> {formData.reported_user_name}</p> */}
                    <div className="input-group flex flex-col">
                        {" "}
                        {/* Optional: Wrap for styling */}
                        <label htmlFor="email" className="text-lg">
                            {" "}
                            Please provide details about the trendmate
                        </label>
                        <textarea
                            className="boxshadow2 outline-none rounded-xl text-lg px-4 py-1 focus:placeholder-gray-400/50"
                            name="reason"
                            placeholder="Please write reason for reporting 
(eg. inappropriate content, harassment)"
                            rows="5"
                            value={formData.reason}
                            onChange={handleChange}
                            required
                        ></textarea>
                    </div>

                    <div className="flex justify-between items-center ">
                        <button
                            className="boxshadow2 px-4 py-2 rounded-xl cursor-pointer"
                            type="button"
                            onClick={onBackToHome}
                        >
                            Back to Home
                        </button>
                        <button
                            className="boxshadow2 px-4 py-2 rounded-xl cursor-pointer"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Submitting..." : "Submit Report"}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}
