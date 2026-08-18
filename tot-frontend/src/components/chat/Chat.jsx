// src/components/chat/Chat.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { formatMediaUrl } from "../../utils/mediaUrl";
import "./Chat.css";

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  const host = typeof window !== "undefined" && window.location.hostname ? window.location.hostname : "127.0.0.1";
  if (host === "totumdy.com" || host.endsWith(".totumdy.com")) {
    const proto = window.location.protocol || "https:";
    return `${proto}//api.totumdy.com/api`;
  }
  return `http://${host}:8000/api`;
};

const LARAVEL_API_BASE_URL = getApiBaseUrl();

const Chat = ({
  sanctumToken,
  currentUserId,
  otherUserId,
  otherUserName,
  otherUserAvatar,
  onViewProfile,
  onlineUsers,
  isOtherUserOnline,
  socket,
  onBackToUserList,
}) => {
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
          return prevMessages;
        } else {
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
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("messageError", handleMessageError);
    };
  }, [socket, currentUserId, otherUserId]);

  const handleSendMessage = useCallback(() => {
    if (newMessage.trim() && socket) {
      const messageContent = newMessage.trim();
      const messageData = {
        sender_id: currentUserId,
        recipient_id: otherUserId,
        content: messageContent,
      };

      const tempMessage = {
        ...messageData,
        id: undefined,
        tempId: `temp-${Date.now()}`,
        created_at: new Date().toISOString(),
      };

      setMessages((prevMessages) => [...prevMessages, tempMessage]);
      scrollToBottom();
      setNewMessage("");

      socket.emit("sendMessage", messageData);
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
  const rawAvatar =
    otherUserAvatar ||
    (typeof otherUserId === "object" ? otherUserId.avatar : null) ||
    "/assets/images/pf4.png";
  const avatarSrc = formatMediaUrl(rawAvatar, "/assets/images/pf4.png");

  return (
    <section className="container w-full mx-auto order-2 lg:flex-8 rounded-3xl h-[calc(100dvh-135px)] lg:h-[calc(100vh-35px)] lg:mr-4 my-0 lg:my-4 bg-[#5978A433] font-balthazar py-2 lg:py-4 px-1 sm:px-2 lg:px-4 min-w-0 flex flex-col">
      <div className="chat-container boxshadow rounded-3xl sm:rounded-4xl px-3 sm:px-7 pt-4 pb-3 mx-auto flex flex-col gap-2 w-full h-full">
        {/* Chat Header */}
        <div className="chat-header flex items-center gap-3 border-b-2 border-b-cyan-50/70 pb-3 flex-none">
          {/* Mobile Back Button */}
          {onBackToUserList && (
            <button
              onClick={onBackToUserList}
              className="lg:hidden text-2xl text-[#646cff] font-bold p-1 -ml-1 cursor-pointer"
              title="Back"
              aria-label="Back"
            >
              ←
            </button>
          )}

          <div className="profile-avatar relative flex-shrink-0">
            <img
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover"
              src={avatarSrc}
              alt={`${displayName}'s avatar`}
              onError={(e) => {
                e.currentTarget.src = "/assets/images/pf4.png";
              }}
            />
            {/* Display Online Status */}
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
              if (onViewProfile && otherUserId) {
                onViewProfile(
                  typeof otherUserId === "object"
                    ? otherUserId.id
                    : otherUserId,
                );
              }
            }}
            className="cursor-pointer text-2xl sm:text-3xl text-[#646cff] chicle-regular leading-none truncate"
          >
            {displayName}
          </span>
        </div>

        {/* Message List */}
        <div className="chat-messages-container no-scrollbar flex-1 overflow-y-auto py-2">
          {loadingHistory ? (
            <div className="chat-placeholder font-balthazar text-lg my-auto text-center">
              Loading messages...
            </div>
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
                    {new Date(
                      msg.created_at || Date.now(),
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="chat-placeholder font-balthazar text-lg my-auto text-center">
              <i>Start the conversation with {displayName}...</i>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="chat-input-area boxshadow py-2 px-3 rounded-2xl flex items-center justify-between gap-2 flex-none mt-auto">
          <input
            className="outline-0 w-full bg-transparent text-black"
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={`Message ${displayName}...`}
            disabled={!socket || loadingHistory}
          />

          <button
            className="send-btn w-6 h-6 bg-[url('/assets/images/send.png')] bg-cover bg-center cursor-pointer hover:bg-[url('/assets/images/sends.png')] hover:scale-105 duration-300 flex-shrink-0 disabled:opacity-40"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !socket || loadingHistory}
            aria-label="Send"
          ></button>
        </div>
      </div>
    </section>
  );
};

export default Chat;
