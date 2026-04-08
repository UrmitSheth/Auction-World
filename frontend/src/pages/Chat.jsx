import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatBox from '../components/chat/ChatBox';
import axios from 'axios';
import { useSelector } from 'react-redux';

const Chat = () => {
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [searchParams] = useSearchParams();
    const { user } = useSelector(state => state.auth);
    const currentUser = user?.user;

    // Auto-open a conversation if ?user=<id> is present in the URL
    useEffect(() => {
        const targetUserId = searchParams.get("user");
        if (!targetUserId || !currentUser || targetUserId === currentUser._id) return;

        const openConversation = async () => {
            try {
                // Try to find existing conversation
                const res = await axios.get(`${import.meta.env.VITE_API}/chat`, { withCredentials: true });
                const existing = res.data.find(conv => 
                    conv.participants.some(p => p._id === targetUserId)
                );

                if (existing) {
                    setSelectedConversation(existing);
                } else {
                    // Fetch user info and create a temp conversation
                    const userRes = await axios.get(`${import.meta.env.VITE_API}/user/public/${targetUserId}`, { withCredentials: true });
                    const targetUser = userRes.data.user;
                    setSelectedConversation({
                        _id: `temp_${targetUserId}`,
                        participants: [currentUser, targetUser],
                        isNew: true
                    });
                }
            } catch (err) {
                console.error("Error opening conversation", err);
            }
        };

        openConversation();
    }, [searchParams, currentUser]);

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl h-[calc(100vh-80px)]">
            <div className="rounded-lg shadow-xl h-full flex overflow-hidden border" style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}>
                <ChatSidebar 
                    onSelectConversation={setSelectedConversation} 
                    selectedConversationId={selectedConversation?._id} 
                />
                <ChatBox 
                    selectedConversation={selectedConversation} 
                    setSelectedConversation={setSelectedConversation} 
                />
            </div>
        </div>
    );
};

export default Chat;
