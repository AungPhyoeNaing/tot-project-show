// src/components/chat/Chat.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
// Remove io import since we're using the passed socket
// import io from 'socket.io-client';
import axios from "axios";
import "./Chat.css";

// Remove the constant SOCKET_SERVER_URL
// const SOCKET_SERVER_URL = 'http://localhost:3001';
const LARAVEL_API_BASE_URL = "http://localhost:8000/api";

// Accept the onViewProfile, onlineUsers, isOtherUserOnline, and socket props
const Chat = ({
  sanctumToken,
  currentUserId,
  otherUserId,
  otherUserName,
  onViewProfile,
  onlineUsers,
  isOtherUserOnline,
  socket,
}) => {
  // <-- Accept socket prop
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch message history
  useEffect(() => {
    const fetchMessageHistory = async () => {
      setMessages([]);
      setNewMessage("");
      setLoadingHistory(true);

      if (!sanctumToken || !currentUserId || !otherUserId) {
        console.error("Chat: Cannot fetch history, missing required props.", {
          sanctumToken,
          currentUserId,
          otherUserId,
        });
        setLoadingHistory(false);
        return;
      }

      try {
        console.log(
          `Chat: Fetching message history with user ID ${otherUserId}`,
        );
        const response = await axios.get(
          `${LARAVEL_API_BASE_URL}/messages/${otherUserId}`,
          {
            headers: {
              Authorization: `Bearer ${sanctumToken}`,
            },
          },
        );

        const historyMessages = response.data || [];
        console.log("Chat: Fetched message history:", historyMessages);
        setMessages(historyMessages);
        scrollToBottom();
      } catch (error) {
        console.error("Chat: Error fetching message history:", error);
        console.error("Chat: Error response data:", error.response?.data);
        console.error("Chat: Error response status:", error.response?.status);
        setMessages([]);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchMessageHistory();
  }, [sanctumToken, currentUserId, otherUserId]);

  // Join chat room and set up listeners using the passed socket
  useEffect(() => {
    if (!socket || !currentUserId || !otherUserId) {
      console.warn(
        "Chat: Missing socket or user IDs, cannot setup chat listeners.",
      );
      return;
    }

    console.log(
      `Chat: Setting up listeners and joining chat room with user ID ${otherUserId} using main socket.`,
    );

    // Join the specific chat room for this conversation
    socket.emit("joinChat", { otherUserId });

    // Listener for receiving messages
    const handleReceiveMessage = (message) => {
      console.log(
        "Chat: Received message (real-time or confirmation):",
        message,
      );
      setMessages((prevMessages) => {
        const alreadyExists = prevMessages.some(
          (msg) =>
            (msg.id && msg.id === message.id) ||
            (msg.tempId && msg.tempId === message.tempId),
        );

        if (alreadyExists) {
          const existingIndex = prevMessages.findIndex(
            (m) => m.tempId && message.id && m.tempId === `temp-${message.id}`,
          );
          if (existingIndex !== -1) {
            const updatedMessages = [...prevMessages];
            updatedMessages[existingIndex] = message;
            console.log("Chat: Updated optimistic message with server data");
            return updatedMessages;
          }
          console.log("Chat: Ignoring duplicate message");
          return prevMessages;
        } else {
          console.log("Chat: Added new real-time message");
          return [...prevMessages, message];
        }
      });
      scrollToBottom();
    };

    // Listener for message errors
    const handleMessageError = (data) => {
      console.error("Chat: Error from server:", data.error);
      alert(`Chat Error: ${data.error}`);
    };

    // Attach listeners
    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("messageError", handleMessageError);

    // Cleanup: Remove listeners when component unmounts or dependencies change
    return () => {
      console.log("Chat: Cleaning up listeners");
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("messageError", handleMessageError);
      // Note: We don't leave the room here as the socket might be used elsewhere,
      // and the server handles disconnection cleanup automatically.
    };
  }, [socket, currentUserId, otherUserId]); // Re-run if socket, currentUserId, or otherUserId changes

  const handleSendMessage = useCallback(() => {
    // Use useCallback for consistency
    if (newMessage.trim() && socket) {
      // Use the passed socket
      const messageContent = newMessage.trim();
      const messageData = {
        sender_id: currentUserId,
        recipient_id: otherUserId,
        content: messageContent,
      };

      console.log("Chat: Sending message optimistically");
      const tempMessage = {
        ...messageData,
        id: undefined,
        tempId: `temp-${Date.now()}`,
        created_at: new Date().toISOString(),
      };

      setMessages((prevMessages) => [...prevMessages, tempMessage]);
      console.log("Chat: Added temporary message to UI");
      scrollToBottom();
      setNewMessage("");

      socket.emit("sendMessage", messageData); // Use the passed socket
      console.log("Chat: Message emitted to server via main socket");
    } else if (!socket) {
      console.warn(
        "Chat: Cannot send message, no socket connection available.",
      );
    }
  }, [newMessage, socket, currentUserId, otherUserId]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Use the provided name or fallback
  const displayName = otherUserName || `User ${otherUserId || "Unknown"}`;

  return (
    <section className="container w-full mx-auto order-2 lg:flex-8 rounded-3xl h-[calc(100vh-100px)] lg:h-[552px] lg:mr-4 my-4 bg-[#5978A433] font-balthazar py-4 min-w-0">
      <div className="chat-container relative boxshadow  rounded-4xl px-3 sm:px-7 pt-4 mx-auto flex flex-col gap-2  w-full lg:w-120 h-full">
        <div className="chat-header flex gap-3 border-b-2 border-b-cyan-50/70 -mx-7 px-5 pb-3">
          {/* Make the user's name clickable */}
          <div className="profile-avatar relative">
            <img
              className="w-12 h-12 rounded-xl "
              // Use the profileUser's avatar field (returned by backend), fallback to placeholder if not available
              src={otherUserId.avatar || "assets/images/user.png"} // Changed this line to use 'avatar'
              alt={`${otherUserId.name || "User"}'s avatar`}
            />
            {/* --- DISPLAY ONLINE STATUS --- */}
            <span
              className={`online-status-chat ${
                isOtherUserOnline ? "online" : "offline"
              }`}
            >
              <span
                className={`status-text-chat text-sm absolute -right-2 -bottom-1 text-white px-2 rounded-lg ${
                  isOtherUserOnline ? "bg-green-500/78 " : "bg-gray-400/78 "
                }`}
              >
                {isOtherUserOnline ? "Here" : "Out"}
              </span>
            </span>
          </div>

          <span
            onClick={() => {
              // Check if onViewProfile function exists and otherUserId is available
              if (onViewProfile && otherUserId) {
                onViewProfile(otherUserId); // Call onViewProfile with the other user's ID
              }
            }}
            className="cursor-pointer text-3xl text-[#646cff]  chicle-regular -mb-2"
            // Use theme color
            // Consider using a dedicated CSS class for better styling
          >
            {displayName}
          </span>

          {/* --- END DISPLAY --- */}
        </div>

        <div className="chat-messages-container no-scrollbar mb-20">
          {loadingHistory ? (
            <div className="chat-placeholder">Loading messages...</div>
          ) : messages.length > 0 ? (
            messages.map((msg) => {
              const isCurrentUser =
                msg.sender_id == currentUserId ||
                (msg.sender && msg.sender.id == currentUserId);
              return (
                <div
                  key={msg.id || msg.tempId}
                  className={`message-bubble boxshadow ${
                    isCurrentUser ? "message-outgoing" : "message-incoming"
                  }`}
                >
                  <div className="text-black">{msg.content}</div>
                  <span className="message-timestamp text-black">
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="chat-placeholder font-balthazar text-lg">
              <i>Start the conversation with {displayName}...</i>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area absolute bottom-8 boxshadow py-2 px-3 rounded-2xl right-6 left-6 flex justify-between">
          <input
            className="outline-0 w-full"
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${displayName}...`}
            disabled={!socket || loadingHistory} // Disable if no socket
          />

          <button
            className="send-btn w-6 h-6 bg-[url('/assets/images/send.png')] bg-cover bg-center cursor-pointer hover:bg-[url('/assets/images/sends.png')] hover:scale-105 duration-300"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !socket || loadingHistory} // Disable if no socket or empty message
          ></button>
        </div>
      </div>
    </section>
  );
};

export default Chat;
