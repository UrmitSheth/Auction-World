import { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { SocketContext } from '../../context/SocketContext';
import { useSelector } from 'react-redux';
import { FaCheck, FaCheckDouble } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import { format } from 'date-fns';
import { Link } from 'react-router';

const ChatBox = ({ selectedConversation, setSelectedConversation }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const { socket, onlineUsers } = useContext(SocketContext);
    const { user } = useSelector(state => state.auth);
    const currentUser = user?.user;
    const messagesEndRef = useRef(null);

    const isOnline = onlineUsers.includes(selectedConversation?.participants.find(p => p._id !== currentUser?._id)?._id);
    const otherParticipant = selectedConversation?.participants.find(p => p._id !== currentUser?._id);

    useEffect(() => {
        if (!selectedConversation) return;

        const fetchMessages = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API}/chat/${otherParticipant._id}`, { withCredentials: true });
                setMessages(res.data);
            } catch (error) {
                console.error("Error fetching messages", error);
            }
        };

        fetchMessages();

        if (socket && !selectedConversation.isNew && !selectedConversation._id.toString().startsWith("temp_")) {
            socket.emit("markMessagesAsSeen", { conversationId: selectedConversation._id, userId: currentUser?._id });
        }

    }, [selectedConversation, otherParticipant, socket, currentUser?._id]);

    useEffect(() => {
        if (!socket) return;

        socket.on("newMessage", (message) => {
            if (selectedConversation && message.conversationId === selectedConversation._id) {
                setMessages(prev => [...prev, message]);
                if (!selectedConversation.isNew && !selectedConversation._id.toString().startsWith("temp_")) {
                    socket.emit("markMessagesAsSeen", { conversationId: selectedConversation._id, userId: currentUser?._id });
                }
            }
        });

        socket.on("messageSent", (message) => {
            if (!selectedConversation) return;

            if (message.conversationId === selectedConversation._id) {
                setMessages(prev => [...prev, message]);
            } else if (selectedConversation.isNew && message.receiverId === otherParticipant?._id) {
                setMessages(prev => [...prev, message]);
                if (setSelectedConversation) {
                    setSelectedConversation(prev => ({
                        ...prev,
                        _id: message.conversationId,
                        isNew: false
                    }));
                }
            }
        });

        socket.on("messagesSeen", ({ conversationId }) => {
            if (selectedConversation && conversationId === selectedConversation._id) {
                setMessages(prev => prev.map(m => m.senderId === currentUser?._id ? { ...m, status: 'seen' } : m));
            }
        });

        return () => {
            socket.off("newMessage");
            socket.off("messageSent");
            socket.off("messagesSeen");
        };
    }, [socket, selectedConversation, currentUser?._id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket || !selectedConversation) return;

        const messageData = {
            senderId: currentUser?._id,
            receiverId: otherParticipant._id,
            text: newMessage.trim(),
        };

        socket.emit("sendMessage", messageData);
        setNewMessage("");
        setShowEmojiPicker(false);
    };

    const handleEmojiClick = (emojiObject) => {
        setNewMessage(prev => prev + emojiObject.emoji);
    };

    if (!selectedConversation) {
        return (
            <div className="flex-1 flex items-center justify-center rounded-r-lg" style={{ backgroundColor: "var(--color-bg-tertiary)" }}>
                <p style={{ color: "var(--color-text-muted)" }}>Select a conversation to start chatting</p>
            </div>
        );
    }

    const formatLastSeen = (dateString) => {
        if (!dateString) return "Unknown";
        const date = new Date(dateString);
        return format(date, "MMM d, h:mm a");
    };

    return (
        <div className="flex-1 flex flex-col rounded-r-lg border-l" style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between rounded-tr-lg" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-tertiary)" }}>
                <div className="flex items-center gap-3">
                    <Link to={`/profile/${otherParticipant?._id}`} title="View Profile">
                        <img 
                            src={otherParticipant?.avatar || 'https://via.placeholder.com/150'} 
                            alt={otherParticipant?.name} 
                            className="w-10 h-10 rounded-full object-cover hover:ring-2 transition-all cursor-pointer"
                            style={{ "--tw-ring-color": "var(--color-accent)" }}
                        />
                    </Link>
                    <div>
                        <Link to={`/profile/${otherParticipant?._id}`} className="hover:underline">
                            <h3 className="font-semibold" style={{ color: "var(--color-text-heading)" }}>{otherParticipant?.name}</h3>
                        </Link>
                        <p className={`text-xs ${isOnline ? 'text-green-500' : ''}`} style={!isOnline ? { color: "var(--color-text-muted)" } : {}}>
                            {isOnline ? 'Online' : `Last seen: ${formatLastSeen(otherParticipant?.lastSeen)}`}
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-4" style={{ backgroundColor: "var(--color-bg)" }}>
                {messages.map((msg, idx) => {
                    const isMe = msg.senderId === currentUser?._id;
                    return (
                        <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div
                                className="max-w-[70%] rounded-lg p-3"
                                style={isMe
                                    ? { backgroundColor: "var(--color-accent)", color: "#fff", borderBottomRightRadius: 0 }
                                    : { backgroundColor: "var(--color-bg-secondary)", color: "var(--color-text)", borderBottomLeftRadius: 0, border: "1px solid var(--color-border)" }
                                }
                            >
                                <p className="text-sm break-words">{msg.text}</p>
                            </div>
                            <div className="text-xs mt-1 flex items-center gap-1" style={{ color: "var(--color-text-muted)" }}>
                                <span>{format(new Date(msg.createdAt), "h:mm a")}</span>
                                {isMe && (
                                    <>
                                        {msg.status === 'sent' && <FaCheck className="text-gray-400" size={10} />}
                                        {msg.status === 'delivered' && <FaCheckDouble className="text-gray-400" size={10} />}
                                        {msg.status === 'seen' && <FaCheckDouble className="text-blue-500" size={10} />}
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 border-t relative rounded-br-lg" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-card)" }}>
                {showEmojiPicker && (
                    <div className="absolute bottom-full right-0 mb-2">
                        <EmojiPicker onEmojiClick={handleEmojiClick} theme="auto" />
                    </div>
                )}
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <button 
                        type="button" 
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2 rounded-full transition-colors"
                        style={{ color: "var(--color-text-muted)" }}
                    >
                        😊
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2"
                        style={{ backgroundColor: "var(--color-bg-tertiary)", color: "var(--color-text)", "--tw-ring-color": "var(--color-accent)" }}
                    />
                    <button 
                        type="submit" 
                        disabled={!newMessage.trim()}
                        className="p-2 text-white rounded-full transition-colors disabled:opacity-50"
                        style={{ backgroundColor: "var(--color-accent)" }}
                    >
                        <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatBox;
