import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { SocketContext } from '../../context/SocketContext';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { FaTrash, FaSearch } from 'react-icons/fa';
import { Link } from 'react-router';

const ChatSidebar = ({ onSelectConversation, selectedConversationId }) => {
    const [conversations, setConversations] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const { onlineUsers, socket } = useContext(SocketContext);
    const { user } = useSelector(state => state.auth);
    const currentUser = user?.user;

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        const searchUsers = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API}/chat/users/search?q=${searchQuery}`, { withCredentials: true });
                setSearchResults(res.data);
            } catch (error) {
                console.error("Error searching users", error);
            }
        };
        const timer = setTimeout(searchUsers, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSelectSearchResult = (userToChat) => {
        const tempConv = {
            _id: `temp_${userToChat._id}`,
            participants: [currentUser, userToChat],
            isNew: true
        };
        onSelectConversation(tempConv);
        setSearchQuery("");
        setSearchResults([]);
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (!socket) return;
        
        socket.on("newMessage", () => { fetchConversations(); });
        socket.on("messageSent", () => { fetchConversations(); });

        return () => {
            socket.off("newMessage");
            socket.off("messageSent");
        };
    }, [socket]);

    const fetchConversations = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API}/chat`, { withCredentials: true });
            setConversations(res.data);
        } catch (error) {
            console.error("Error fetching conversations", error);
        }
    };

    const handleDeleteChat = async (e, convId) => {
        e.stopPropagation();
        try {
            await axios.delete(`${import.meta.env.VITE_API}/chat/${convId}`, { withCredentials: true });
            setConversations(prev => prev.filter(c => c._id !== convId));
            if(selectedConversationId === convId) {
                onSelectConversation(null);
            }
        } catch (error) {
            console.error("Error deleting chat", error);
        }
    };

    return (
        <div className="w-1/3 min-w-[300px] border-r flex flex-col rounded-l-lg" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-secondary)" }}>
            <div className="p-4 border-b" style={{ borderColor: "var(--color-border)" }}>
                <h2 className="text-xl font-bold" style={{ color: "var(--color-text-heading)" }}>Chats</h2>
                <div className="mt-3 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch size={14} style={{ color: "var(--color-text-muted)" }} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search users by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2"
                        style={{ backgroundColor: "var(--color-bg-tertiary)", color: "var(--color-text)", "--tw-ring-color": "var(--color-accent)" }}
                    />
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {searchQuery ? (
                    searchResults.length === 0 ? (
                        <div className="p-4 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>No users found</div>
                    ) : (
                        searchResults.map(searchUser => (
                            <div 
                                key={searchUser._id}
                                onClick={() => handleSelectSearchResult(searchUser)}
                                className="flex items-center gap-3 p-3 cursor-pointer transition-colors border-b"
                                style={{ borderColor: "var(--color-border)" }}
                            >
                                <img src={searchUser.avatar || 'https://via.placeholder.com/150'} alt={searchUser.name} className="w-10 h-10 rounded-full object-cover" />
                                <div>
                                    <h3 className="font-semibold text-sm" style={{ color: "var(--color-text-heading)" }}>{searchUser.name}</h3>
                                </div>
                            </div>
                        ))
                    )
                ) : (
                    conversations.length === 0 ? (
                        <div className="p-4 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>No conversations yet</div>
                    ) : (
                        conversations.map((conv) => {
                            const otherParticipant = conv.participants.find(p => p._id !== currentUser?._id);
                            const isOnline = onlineUsers.includes(otherParticipant?._id);
                            const isSelected = selectedConversationId === conv._id;

                            return (
                                <div 
                                    key={conv._id}
                                    onClick={() => onSelectConversation(conv)}
                                    className="flex items-center gap-3 p-3 cursor-pointer transition-colors border-b group"
                                    style={{
                                        borderColor: "var(--color-border)",
                                        backgroundColor: isSelected ? "var(--color-accent-light)" : "transparent"
                                    }}
                                >
                                    <div className="relative">
                                        <Link 
                                            to={`/profile/${otherParticipant?._id}`} 
                                            onClick={(e) => e.stopPropagation()}
                                            title="View Profile"
                                        >
                                            <img 
                                                src={otherParticipant?.avatar || 'https://via.placeholder.com/150'} 
                                                alt={otherParticipant?.name}
                                                className="w-12 h-12 rounded-full object-cover hover:ring-2 transition-all cursor-pointer"
                                                style={{ "--tw-ring-color": "var(--color-accent)" }}
                                            />
                                        </Link>
                                        {isOnline && (
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 pointer-events-none" style={{ borderColor: "var(--color-bg-secondary)" }}></div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-semibold truncate pr-2" style={{ color: conv.unreadCount > 0 ? "var(--color-accent)" : "var(--color-text-heading)", fontWeight: conv.unreadCount > 0 ? 700 : 600 }}>
                                                {otherParticipant?.name}
                                            </h3>
                                            {conv.lastMessage && (
                                                <span className="text-xs flex-shrink-0" style={{ color: conv.unreadCount > 0 ? "var(--color-accent)" : "var(--color-text-muted)" }}>
                                                    {format(new Date(conv.lastMessage.createdAt), "MMM d, HH:mm")}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm truncate w-[80%]" style={{ color: conv.unreadCount > 0 ? "var(--color-text-heading)" : "var(--color-text-muted)" }}>
                                                {conv.lastMessage?.text || "No messages yet"}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                {conv.unreadCount > 0 && (
                                                    <span className="text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: "var(--color-accent)" }}>
                                                        {conv.unreadCount}
                                                    </span>
                                                )}
                                                <button 
                                                    onClick={(e) => handleDeleteChat(e, conv._id)}
                                                    className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 flex-shrink-0 hover:bg-red-50 rounded"
                                                    title="Delete Chat"
                                                >
                                                    <FaTrash size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )
                )}
            </div>
        </div>
    );
};

export default ChatSidebar;
