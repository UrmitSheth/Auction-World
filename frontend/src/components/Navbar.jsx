import { useEffect, useState, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../store/auth/authSlice";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "../api/notification";
import {
  MdOutlineCreate,
  MdOutlineDashboard,
  MdMailOutline,
  MdAttachMoney,
  MdMenuOpen,
  MdOutlineAccountCircle,
  MdOutlineHome,
  MdOutlinePrivacyTip,
  MdAdminPanelSettings,
  MdChat,
  MdDarkMode,
  MdLightMode,
} from "react-icons/md";
import {
  IoCloseSharp,
  IoDocumentTextOutline,
  IoLogOutOutline,
  IoNotificationsOutline,
  IoNotifications,
} from "react-icons/io5";
import { RiAuctionLine } from "react-icons/ri";
import { FaHistory, FaCheckCircle, FaChevronDown, FaPalette } from "react-icons/fa";
import { CurrencySelector } from "./CurrencySelector.jsx";
import { useSocketContext } from "../context/SocketContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

export const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLogoMenuOpen, setIsLogoMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const logoRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const { socket } = useSocketContext();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();
  const { t, language, changeLanguage, LANGUAGES } = useLanguage();

  const themes = [
    { id: "light", label: "Light", icon: "☀️" },
    { id: "dark", label: "Dark", icon: "🌙" },
    { id: "emerald", label: "Emerald", icon: "💚" },
    { id: "ocean", label: "Ocean", icon: "🌊" },
    { id: "sunset", label: "Sunset", icon: "🌅" },
  ];

  // Queries
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    enabled: !!user,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markReadMutate = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries(["notifications"]),
  });

  const markAllMutate = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries(["notifications"]),
  });

  useEffect(() => {
    if (!socket) return;
    
    const handleNewNotification = (notification) => {
      queryClient.setQueryData(["notifications"], (old = []) => [notification, ...old]);
    };

    socket.on("newNotification", handleNewNotification);
    return () => socket.off("newNotification", handleNewNotification);
  }, [socket, queryClient]);

  const handleLogout = () => {
    dispatch(logout());
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
    navigate("/");
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
      if (logoRef.current && !logoRef.current.contains(event.target)) {
        setIsLogoMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cycle theme
  const cycleTheme = () => {
    const currentIdx = themes.findIndex(t => t.id === theme);
    const nextIdx = (currentIdx + 1) % themes.length;
    setTheme(themes[nextIdx].id);
  };

  const currentTheme = themes.find(t => t.id === theme) || themes[0];

  return (
    <>
      <header className="shadow-sm border-b sticky top-0 z-40 transition-colors" style={{ backgroundColor: "var(--color-bg-secondary)", borderColor: "var(--color-border)" }}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            
            {/* Logo with Dropdown */}
            <div className="relative" ref={logoRef}>
              <button
                onClick={() => { if (user) setIsLogoMenuOpen(!isLogoMenuOpen); else navigate("/"); }}
                className="flex items-center space-x-2 transition-transform hover:scale-105"
              >
                <div className="p-1.5 rounded-lg" style={{ backgroundColor: "var(--color-accent)" }}>
                  <RiAuctionLine className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-black tracking-tight" style={{ color: "var(--color-text-heading)" }}>
                  Auction<span style={{ color: "var(--color-accent)" }}>World</span>
                </span>
                {user && <FaChevronDown className={`h-3 w-3 ml-1 transition-transform ${isLogoMenuOpen ? "rotate-180" : ""}`} style={{ color: "var(--color-text-muted)" }} />}
              </button>

              {/* Logo Dropdown — Page Navigation */}
              {isLogoMenuOpen && user && (
                <div className="absolute left-0 mt-2 w-56 rounded-xl shadow-lg border py-2 z-50" style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}>
                  {logoMenuLinks.map((item) => (
                    <Link
                      key={item.link}
                      to={item.link}
                      onClick={() => setIsLogoMenuOpen(false)}
                      className="flex items-center px-4 py-2.5 text-sm font-medium transition-colors"
                      style={{ color: "var(--color-text)" }}
                    >
                      <span className="mr-3" style={{ color: "var(--color-accent)" }}>{item.icon}</span>
                      {t(item.id)}
                    </Link>
                  ))}
                  <div className="border-t my-1" style={{ borderColor: "var(--color-border)" }}></div>
                  <Link
                    to="/about"
                    onClick={() => setIsLogoMenuOpen(false)}
                    className="flex items-center px-4 py-2.5 text-sm font-medium transition-colors"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    <MdOutlineAccountCircle className="mr-3 h-5 w-5" /> {t("about")}
                  </Link>
                  <Link
                    to="/legal"
                    onClick={() => setIsLogoMenuOpen(false)}
                    className="flex items-center px-4 py-2.5 text-sm font-medium transition-colors"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    <IoDocumentTextOutline className="mr-3 h-5 w-5" /> {t("legal")}
                  </Link>
                </div>
              )}
            </div>

            {/* Desktop Navigation — Core Links */}
            <nav className="hidden md:flex items-center space-x-8">
              {(user ? desktopNavLinks : navMenu).map((item) => (
                <NavLink
                  to={item.link}
                  key={item.link}
                  style={({ isActive }) => ({
                    color: isActive ? "var(--color-accent)" : "var(--color-text-secondary)",
                    borderBottom: isActive ? "2px solid var(--color-accent)" : "2px solid transparent",
                    paddingBottom: "4px",
                    fontWeight: isActive ? 700 : 600,
                    transition: "all 0.2s"
                  })}
                >
                  {t(item.id)}
                </NavLink>
              ))}
            </nav>

            {/* Desktop: Currency + Theme + Auth (Right Side) */}
            <div className="hidden md:flex items-center space-x-3">
              <CurrencySelector variant="navbar" />

              <select 
                value={language} 
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-transparent text-sm font-bold outline-none cursor-pointer"
                style={{ color: "var(--color-text)", appearance: "none", padding: "4px" }}
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code} style={{ backgroundColor: "var(--color-bg-secondary)", color: "var(--color-text)" }}>{lang.flag} {lang.code.toUpperCase()}</option>
                ))}
              </select>

              {/* Theme Toggle Button */}
              <button
                onClick={cycleTheme}
                className="p-2 rounded-full transition-colors"
                style={{ color: "var(--color-text)" }}
                title={`Theme: ${currentTheme.label}`}
              >
                <span className="text-lg">{currentTheme.icon}</span>
              </button>

              {user ? (
                <>

                  {/* Notifications Bell */}
                  <div className="relative" ref={notifRef}>
                    <button
                      onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                      className="relative p-2 rounded-full transition-colors"
                      style={{ color: "var(--color-text)" }}
                    >
                      {unreadCount > 0 ? (
                         <>
                           <IoNotifications className="h-6 w-6" style={{ color: "var(--color-accent)" }} />
                           <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-[11px] font-bold rounded-full px-1 border-2 shadow-sm" style={{ borderColor: "var(--color-bg-secondary)" }}>
                             {unreadCount > 99 ? "99+" : unreadCount}
                           </span>
                         </>
                      ) : (
                         <IoNotificationsOutline className="h-6 w-6" />
                      )}
                    </button>

                    {/* Notifications Dropdown */}
                    {isNotificationsOpen && (
                      <div className="absolute right-0 mt-2 w-80 rounded-xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.2)] border overflow-hidden z-50 transform origin-top-right transition-all" style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}>
                        <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-tertiary)" }}>
                          <h3 className="font-bold" style={{ color: "var(--color-text-heading)" }}>{t("notifications")}</h3>
                          {unreadCount > 0 && (
                            <button
                              onClick={(e) => { e.stopPropagation(); markAllMutate.mutate(); }}
                              className="text-xs font-semibold transition-colors"
                              style={{ color: "var(--color-accent)" }}
                            >
                              {t("markAllRead")}
                            </button>
                          )}
                        </div>
                        <div className="max-h-[320px] overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-6 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
                              {t("noNotifications") || "No notifications yet"}
                            </div>
                          ) : (
                            <div>
                              {notifications.map((notif) => (
                                <div
                                  key={notif._id}
                                  onClick={() => {
                                    if (!notif.isRead) markReadMutate.mutate(notif._id);
                                    setIsNotificationsOpen(false);
                                    if (notif.type === "message") {
                                        navigate(notif.relatedId ? `/chat?user=${notif.relatedId}` : "/chat");
                                    } else if (notif.relatedId) {
                                        navigate(`/auction/${notif.relatedId}`);
                                    }
                                  }}
                                  className="p-4 transition-colors cursor-pointer flex items-start gap-3"
                                  style={{ backgroundColor: !notif.isRead ? "var(--color-bg-tertiary)" : "transparent", borderBottom: "1px solid var(--color-border)" }}
                                >
                                  <div className="mt-0.5 p-1.5 rounded-full" style={{ backgroundColor: !notif.isRead ? "var(--color-accent-light)" : "var(--color-bg-tertiary)", color: !notif.isRead ? "var(--color-accent)" : "var(--color-text-muted)" }}>
                                    {notif.type === "message" ? <MdChat size={14} /> : notif.type === 'outbid' ? <RiAuctionLine size={14} /> : <FaCheckCircle size={14} />}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm" style={{ fontWeight: !notif.isRead ? 600 : 400, color: !notif.isRead ? "var(--color-text-heading)" : "var(--color-text-muted)" }}>
                                      {notif.message}
                                    </p>
                                    <p className="text-xs mt-1 font-medium" style={{ color: "var(--color-text-muted)" }}>
                                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                  {!notif.isRead && (
                                    <div className="h-2 w-2 rounded-full mt-1.5" style={{ backgroundColor: "var(--color-accent)" }} />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="p-3 border-t text-center" style={{ backgroundColor: "var(--color-bg-tertiary)", borderColor: "var(--color-border)" }}>
                          <Link to="/notifications" onClick={() => setIsNotificationsOpen(false)} className="text-xs font-bold" style={{ color: "var(--color-accent)" }}>
                             {t("viewCompleteHistory") || "View All Notifications"}
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Profile Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 focus:outline-none px-3 py-1.5 rounded-full transition-colors border border-transparent"
                  >
                    <div className="h-8 w-8 rounded-full flex items-center justify-center overflow-hidden border-2" style={{ backgroundColor: "var(--color-accent-light)", borderColor: "var(--color-border)" }}>
                      {user.user.avatar ? (
                        <img src={user.user.avatar} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <span className="font-bold" style={{ color: "var(--color-accent)" }}>{user.user.name?.charAt(0)}</span>
                      )}
                    </div>
                    <span className="font-bold" style={{ color: "var(--color-text-heading)" }}>{user.user.name.split(' ')[0]}</span>
                    <FaChevronDown className={`h-3 w-3 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} style={{ color: "var(--color-text-muted)" }} />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg border py-2 z-50" style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}>
                      {/* User info header */}
                      <div className="px-4 py-3 border-b" style={{ borderColor: "var(--color-border)" }}>
                        <p className="font-bold text-sm truncate" style={{ color: "var(--color-text-heading)" }}>{user.user.name}</p>
                        <p className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>{user.user.email}</p>
                      </div>

                      <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center px-4 py-2.5 text-sm font-medium transition-colors" style={{ color: "var(--color-text)" }}>
                        <MdOutlineAccountCircle className="mr-3 h-5 w-5" /> {t("profile")}
                      </Link>
                      <Link to="/MyAuction" onClick={() => setIsDropdownOpen(false)} className="flex items-center px-4 py-2.5 text-sm font-medium transition-colors" style={{ color: "var(--color-text)" }}>
                        <MdAttachMoney className="mr-3 h-5 w-5" /> {t("myInventory")}
                      </Link>
                      <Link to="/chat" onClick={() => setIsDropdownOpen(false)} className="flex items-center px-4 py-2.5 text-sm font-medium transition-colors" style={{ color: "var(--color-text)" }}>
                        <MdChat className="mr-3 h-5 w-5" /> {t("messages")}
                      </Link>
                      <Link to="/history" onClick={() => setIsDropdownOpen(false)} className="flex items-center px-4 py-2.5 text-sm font-medium transition-colors" style={{ color: "var(--color-text)" }}>
                        <FaHistory className="mr-3 h-4 w-4" /> {t("history")}
                      </Link>

                      <div className="border-t my-1" style={{ borderColor: "var(--color-border)" }}></div>

                      <Link to="/contact" onClick={() => setIsDropdownOpen(false)} className="flex items-center px-4 py-2.5 text-sm font-medium transition-colors" style={{ color: "var(--color-text-muted)" }}>
                        <MdMailOutline className="mr-3 h-5 w-5" /> {t("contact")}
                      </Link>
                      <Link to="/privacy" onClick={() => setIsDropdownOpen(false)} className="flex items-center px-4 py-2.5 text-sm font-medium transition-colors" style={{ color: "var(--color-text-muted)" }}>
                        <MdOutlinePrivacyTip className="mr-3 h-5 w-5" /> {t("legal")}
                      </Link>

                      {/* Theme selector inside dropdown */}
                      <div className="border-t my-1" style={{ borderColor: "var(--color-border)" }}></div>
                      <div className="px-4 py-2">
                        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--color-text-muted)" }}>Theme</p>
                        <div className="flex gap-1.5">
                          {themes.map(t => (
                            <button
                              key={t.id}
                              onClick={() => setTheme(t.id)}
                              className="p-1.5 rounded-lg text-sm transition-all"
                              style={{
                                backgroundColor: theme === t.id ? "var(--color-accent-light)" : "transparent",
                                border: theme === t.id ? "2px solid var(--color-accent)" : "2px solid transparent",
                              }}
                              title={t.label}
                            >
                              {t.icon}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="border-t my-1" style={{ borderColor: "var(--color-border)" }}></div>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <IoLogOutOutline className="mr-3 h-5 w-5" /> {t("signOut")}
                      </button>
                    </div>
                  )}
                </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-5 py-2 font-bold rounded-lg transition-colors"
                    style={{ color: "var(--color-accent)" }}
                  >
                    {t("logIn")}
                  </Link>
                  <Link
                    to="/signup"
                    className="px-5 py-2 text-white font-bold rounded-lg shadow-sm transition-all hover:shadow-md"
                    style={{ backgroundColor: "var(--color-accent)" }}
                  >
                    {t("signUp")}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg focus:outline-none transition-colors"
              style={{ color: "var(--color-text-heading)" }}
              aria-expanded={isMenuOpen}
              aria-label="Toggle menu"
            >
              <MdMenuOpen className="h-7 w-7" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Backdrop */}
      <div
        className={`fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile Menu Drawer */}
      <div
        style={{ backgroundColor: "var(--color-bg-secondary)" }}
        className={`fixed top-0 right-0 h-full w-72 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-5 border-b" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-tertiary)" }}>
          <div className="flex items-center space-x-2">
            <RiAuctionLine className="h-6 w-6" style={{ color: "var(--color-accent)" }} />
            <span className="text-xl font-black" style={{ color: "var(--color-text-heading)" }}>
              AuctionWorld
            </span>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-emerald-800 hover:text-red-500 bg-white rounded-full p-1 shadow-sm transition-colors"
            aria-label="Close menu"
          >
            <IoCloseSharp className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Currency Selector */}
        <div className="px-5 py-3 border-b" style={{ borderColor: "var(--color-border)" }}>
          <CurrencySelector variant="create" />
        </div>

        {/* Mobile User Profile Section */}
        {user && (
          <div className="p-5 border-b" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-tertiary)" }}>
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full flex items-center justify-center overflow-hidden border-2 shadow-sm" style={{ backgroundColor: "var(--color-accent-light)", borderColor: "var(--color-border)" }}>
                {user.user.avatar ? (
                  <img src={user.user.avatar} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <span className="font-bold text-lg" style={{ color: "var(--color-accent)" }}>{user.user.name?.charAt(0)}</span>
                )}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold truncate" style={{ color: "var(--color-text-heading)" }}>{user.user.name}</p>
                <p className="text-xs truncate" style={{ color: "var(--color-text-secondary)" }}>{user.user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Language Selector */}
        <div className="ml-5 mt-4">
          <select 
            value={language} 
            onChange={(e) => changeLanguage(e.target.value)}
            className="bg-transparent text-sm font-bold outline-none cursor-pointer"
            style={{ color: "var(--color-text)", appearance: "none", padding: "4px" }}
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code} style={{ backgroundColor: "var(--color-bg-secondary)", color: "var(--color-text)" }}>{lang.flag} {lang.code.toUpperCase()}</option>
            ))}
          </select>
        </div>

        {/* Mobile Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {(user ? mobileAllLinks : navMenu).map((item) => (
              <li key={item.link}>
                <NavLink
                  to={item.link}
                  className={({ isActive }) =>
                    isActive
                      ? "flex items-center px-4 py-3 rounded-xl font-bold transition-colors"
                      : "flex items-center px-4 py-3 rounded-xl font-semibold transition-colors"
                  }
                  style={({ isActive }) => ({
                    backgroundColor: isActive ? "var(--color-accent-light)" : "transparent",
                    color: isActive ? "var(--color-accent)" : "var(--color-text-secondary)"
                  })}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {({ isActive }) => (
                    <>
                      <span style={{ color: isActive ? "var(--color-accent)" : "var(--color-text-muted)" }}>
                        {item.icon}
                      </span>
                      {t(item.id)}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Mobile Theme Selector ALWAYS SHOWN */}
          <div className="mt-6 pt-6 border-t" style={{ borderColor: "var(--color-border)" }}>
            <p className="px-4 text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--color-text-muted)" }}>Theme</p>
            <div className="flex gap-2 px-4">
              {themes.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className="p-2 rounded-lg text-lg transition-all"
                  style={{
                    backgroundColor: theme === t.id ? "var(--color-accent-light)" : "transparent",
                    border: theme === t.id ? "2px solid var(--color-accent)" : "2px solid var(--color-border)",
                  }}
                  title={t.label}
                >
                  {t.icon}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Mobile Auth Actions (Bottom Pinned) */}
        <div className="p-4 border-t" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-tertiary)" }}>
          {user ? (
            <button
              className="flex items-center justify-center w-full py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-bold transition-colors shadow-sm"
              onClick={handleLogout}
            >
              <IoLogOutOutline className="mr-2 h-5 w-5" /> {t("signOut")}
            </button>
          ) : (
            <div className="space-y-3">
              <Link
                to="/login"
                className="block w-full py-3 text-center font-bold border-2 rounded-xl transition-colors"
                style={{ color: "var(--color-accent)", borderColor: "var(--color-border)" }}
                onClick={() => setIsMenuOpen(false)}
              >
                {t("logIn")}
              </Link>
              <Link
                to="/signup"
                className="block w-full py-3 text-center text-white font-bold rounded-xl transition-colors shadow-md"
                style={{ backgroundColor: "var(--color-accent)" }}
                onClick={() => setIsMenuOpen(false)}
              >
                {t("signUp")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// --- Configurations Below ---

const navMenu = [
  { id: "home", name: "Home", link: "/", icon: <MdOutlineHome className="mr-3 h-5 w-5" /> },
  { id: "about", name: "About", link: "/about", icon: <MdOutlineAccountCircle className="mr-3 h-5 w-5" /> },
  { id: "contact", name: "Contact", link: "/contact", icon: <MdMailOutline className="mr-3 h-5 w-5" /> },
  { id: "legal", name: "Legal", link: "/legal", icon: <IoDocumentTextOutline className="mr-3 h-5 w-5" /> },
];

// Desktop nav bar — only essential links
const desktopNavLinks = [
  { id: "dashboard", name: "Dashboard", link: "/" },
  { id: "marketplace", name: "Marketplace", link: "/auction" },
  { id: "createAuction", name: "Create Auction", link: "/create" },
];

// Logo dropdown — pages accessible from the logo icon
const logoMenuLinks = [
  { id: "dashboard", name: "Dashboard", link: "/", icon: <MdOutlineDashboard className="h-5 w-5" /> },
  { id: "marketplace", name: "Marketplace", link: "/auction", icon: <RiAuctionLine className="h-5 w-5" /> },
  { id: "createAuction", name: "Create Auction", link: "/create", icon: <MdOutlineCreate className="h-5 w-5" /> },
  { id: "myInventory", name: "My Inventory", link: "/MyAuction", icon: <MdAttachMoney className="h-5 w-5" /> },
  { id: "history", name: "History", link: "/history", icon: <FaHistory className="h-4 w-4" /> },
  { id: "messages", name: "Chat", link: "/chat", icon: <MdChat className="h-5 w-5" /> },
];

// Mobile drawer — all links combined
const mobileAllLinks = [
  { id: "dashboard", name: "Dashboard", link: "/", icon: <MdOutlineDashboard className="mr-3 h-5 w-5" /> },
  { id: "marketplace", name: "Marketplace", link: "/auction", icon: <RiAuctionLine className="mr-3 h-5 w-5" /> },
  { id: "createAuction", name: "Create Auction", link: "/create", icon: <MdOutlineCreate className="mr-3 h-5 w-5" /> },
  { id: "myInventory", name: "My Inventory", link: "/MyAuction", icon: <MdAttachMoney className="mr-3 h-5 w-5" /> },
  { id: "history", name: "History", link: "/history", icon: <FaHistory className="mr-3 h-4 w-4" /> },
  { id: "messages", name: "Chat", link: "/chat", icon: <MdChat className="mr-3 h-5 w-5" /> },
  { id: "profile", name: "Profile", link: "/profile", icon: <MdOutlineAccountCircle className="mr-3 h-5 w-5" /> },
  { id: "contact", name: "Contact Support", link: "/contact", icon: <MdMailOutline className="mr-3 h-5 w-5" /> },
];

const adminNavLink = [
  { id: "adminPanel", name: "Admin Panel", link: "/admin", icon: <MdAdminPanelSettings className="mr-3 h-5 w-5" /> },
  { id: "dashboard", name: "Dashboard", link: "/", icon: <MdOutlineDashboard className="mr-3 h-5 w-5" /> },
  { id: "createAuction", name: "Create Auction", link: "/create", icon: <MdOutlineCreate className="mr-3 h-5 w-5" /> },
  { id: "marketplace", name: "Marketplace", link: "/auction", icon: <RiAuctionLine className="mr-3 h-5 w-5" /> },
  { id: "history", name: "History", link: "/history", icon: <FaHistory className="mr-3 h-5 w-5" /> },
  { id: "messages", name: "Chat", link: "/chat", icon: <MdChat className="mr-3 h-5 w-5" /> },
];

const getNavLinks = (userRole) => {
  if (userRole === 'admin') return adminNavLink;
  return [];
};