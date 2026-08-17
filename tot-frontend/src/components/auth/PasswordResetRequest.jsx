// src/components/auth/PasswordResetRequest.jsx
import React, { useState } from "react";
import { requestPasswordReset } from "../../api/authService"; // You'll need to add this API call

export default function PasswordResetRequest({ onBackToLogin }) {
    const [formData, setFormData] = useState({
        email: "",
        recovery_email: "",
        account_creation_date: "",
        message: "",
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
            // Log the data being sent
            console.log(
                "Submitting password reset request with data:",
                formData
            );

            // Call the new API endpoint
            const response = await requestPasswordReset(formData);
            console.log(
                "Password reset request submitted successfully:",
                response
            ); // Log successful response

            setSuccessMessage(
                "Your password reset request has been submitted successfully. An admin will process it soon."
            );
            // Optionally reset the form
            setFormData({
                email: "",
                recovery_email: "",
                account_creation_date: "",
                message: "",
            });
        } catch (err) {
            // Detailed error logging
            console.error("Error submitting password reset request:", err);

            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error("Response Error:", {
                    status: err.response.status,
                    statusText: err.response.statusText,
                    headers: err.response.headers,
                    data: err.response.data,
                });

                // Try to get the error message from the response body
                const errorMsg = err.response.data?.message
                    ? err.response.data.message
                    : `Server Error: ${err.response.status} - ${err.response.statusText}`;
                setError(errorMsg);
            } else if (err.request) {
                // The request was made but no response was received
                console.error("Request Error (No Response):", err.request);
                setError(
                    "Network error. Please check your connection and try again."
                );
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error("General Error:", err.message);
                setError("An unexpected error occurred. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="auth-section rounded-3xl lg:h-[540px] mx-2 sm:mx-8 my-5 bg-[#5978A433] font-balthazar lg:overflow-hidden py-5 w-full">
            <div className="edit-profile-container boxshadow  rounded-4xl px-4 sm:px-7 pt-2 mx-auto flex flex-col w-full lg:w-120 lg:h-full lg:overflow-y-auto lg:no-scrollbar">
                <div className="chat-header -mx-7 py-1 border-b-2 border-b-cyan-50/70 ">
                    <h2 className="text-2xl text-center">
                        Password Reset Request
                    </h2>
                </div>

                <p className="font-bold mt-2 mb-1">
                    <i>
                        {" "}
                        Please provide your details to request a password reset.
                    </i>
                </p>

                {error && (
                    <div className="error-message text-red-500 cherry-bomb text-sm">
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className="success-message">{successMessage}</div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-3 mt-1"
                >
                    {/* Email Input */}
                    <div className="input-group flex flex-col">
                        {" "}
                        {/* Optional: Wrap for styling */}
                        <label htmlFor="email" className="text-lg">
                            {" "}
                            TOT Email Address :
                        </label>
                        <input
                            className="boxshadow2 outline-0 rounded-2xl text-lg px-4 py-1 focus:placeholder-gray-400/50"
                            id="email"
                            type="email"
                            name="email"
                            placeholder="@tot.com Email Address"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            pattern=".*@tot\.com$" // Basic pattern to enforce @tot.com domain
                            title="Please enter a valid @tot.com email address"
                        />
                    </div>

                    {/* Recovery Email Input */}
                    <div className="input-group flex flex-col">
                        <label htmlFor="recovery_email" className="text-lg">
                            {" "}
                            Recovery Email :
                        </label>
                        <input
                            className="boxshadow2 outline-0 rounded-2xl text-lg px-4 py-1 focus:placeholder-gray-400/50"
                            id="recovery_email"
                            type="email"
                            name="recovery_email"
                            placeholder="Recovery Email (e.g., yourname@gmail.com)"
                            value={formData.recovery_email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Account Creation Date Input */}
                    <div className="input-group flex flex-col mb-2">
                        <label
                            htmlFor="account_creation_date"
                            className="text-lg"
                        >
                            {" "}
                            Account Creation Date :
                        </label>
                        <input
                            className="boxshadow2 outline-0 rounded-2xl text-lg px-4 py-1 focus:placeholder-gray-400/50"
                            id="account_creation_date"
                            type="text"
                            name="account_creation_date"
                            placeholder="Approximately (e.g., Jan 2024)"
                            value={formData.account_creation_date}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Message Textarea */}
                    <div className="input-group flex flex-col">
                        <label htmlFor="message" className="sr-only">
                            {" "}
                            Additional Details{" "}
                        </label>
                        <textarea
                            className="
                            inset-shadow-[0_5px_5px_6px_rgba(0,0,0,0.25)]
                            rounded-2xl
                            text-lg
                            px-4
                            py-2 outline-0 focus:placeholder-gray-400/50"
                            id="message"
                            name="message"
                            placeholder="Additional details or reason for reset (optional) "
                            rows="2"
                            value={formData.message}
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    <div className="flex justify-between items-center ">
                        <button
                            className="boxshadow2 px-4 py-2 rounded-xl cursor-pointer"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Submitting..." : "Submit Request"}
                        </button>

                        <button
                            className="boxshadow2 px-4 py-2 rounded-xl cursor-pointer"
                            type="button"
                            onClick={onBackToLogin}
                        >
                            Back to Login
                        </button>
                    </div>
                </form>

                <p className="switch-link"></p>
            </div>
        </section>
    );
}
