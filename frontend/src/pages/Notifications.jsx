import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "../api/notification";
import { useLanguage } from "../context/LanguageContext";
import { useNavigate } from "react-router";
import { MdChat, MdCheckCircle } from "react-icons/md";
import { RiAuctionLine } from "react-icons/ri";

const Notifications = () => {
    const { t } = useLanguage();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data: notifications = [], isLoading } = useQuery({
        queryKey: ["notifications"],
        queryFn: getNotifications,
    });

    const markReadMutate = useMutation({
        mutationFn: markNotificationRead,
        onSuccess: () => queryClient.invalidateQueries(["notifications"]),
    });

    const markAllMutate = useMutation({
        mutationFn: markAllNotificationsRead,
        onSuccess: () => queryClient.invalidateQueries(["notifications"]),
    });

    const getIcon = (type) => {
        if (type === "message") return <MdChat size={20} />;
        if (type === "outbid") return <RiAuctionLine size={20} />;
        return <MdCheckCircle size={20} />;
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto py-10 px-4 mt-8 flex justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full"></div>
            </div>
        );
    }

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 mt-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black theme-text-heading">Notifications</h1>
                {unreadCount > 0 && (
                    <button
                        onClick={() => markAllMutate.mutate()}
                        className="text-sm font-bold theme-accent hover:underline"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="theme-card border rounded-2xl p-10 text-center theme-shadow">
                    <p className="theme-text-muted">You have no notifications yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notif) => (
                        <div
                            key={notif._id}
                            onClick={() => {
                                if (!notif.isRead) markReadMutate.mutate(notif._id);
                                if (notif.type === "message") {
                                    navigate(notif.relatedId ? `/chat?user=${notif.relatedId}` : "/chat");
                                } else if (notif.relatedId) {
                                    navigate(`/auction/${notif.relatedId}`);
                                }
                            }}
                            className={`theme-card border rounded-2xl p-5 flex items-start gap-4 transition-all duration-300 cursor-pointer hover:shadow-md hover:-translate-y-0.5 ${
                                !notif.isRead ? "border-l-4 border-l-[var(--color-accent)]" : "opacity-80"
                            }`}
                            style={{
                                backgroundColor: !notif.isRead ? "var(--color-bg-tertiary)" : "var(--color-card)"
                            }}
                        >
                            <div
                                className="p-3 rounded-full flex-shrink-0"
                                style={{
                                    backgroundColor: !notif.isRead ? "var(--color-accent-light)" : "var(--color-bg-secondary)",
                                    color: !notif.isRead ? "var(--color-accent)" : "var(--color-text-muted)",
                                }}
                            >
                                {getIcon(notif.type)}
                            </div>
                            <div className="flex-1">
                                <p
                                    className="text-base"
                                    style={{
                                        fontWeight: !notif.isRead ? 700 : 500,
                                        color: !notif.isRead ? "var(--color-text-heading)" : "var(--color-text-secondary)",
                                    }}
                                >
                                    {notif.message}
                                </p>
                                <p className="text-xs font-medium mt-1 theme-text-muted">
                                    {new Date(notif.createdAt).toLocaleString([], {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                    })}
                                </p>
                            </div>
                            {!notif.isRead && (
                                <div
                                    className="h-3 w-3 rounded-full mt-2"
                                    style={{ backgroundColor: "var(--color-accent)" }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;
