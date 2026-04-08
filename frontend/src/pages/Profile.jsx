import { useState, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import {
  CiMail, CiUser, CiLock, CiCamera, CiSettings, CiHeart, CiViewList,
  CiGlobe, CiCalendar
} from "react-icons/ci";
import {
  MdChat, MdOutlineCreate, MdStorefront, MdColorLens,
  MdOutlinePalette, MdCheck, MdLanguage
} from "react-icons/md";
import { FaGavel, FaEye, FaHeart } from "react-icons/fa";
import { RiAuctionLine } from "react-icons/ri";
import { useSelector } from "react-redux";
import { changePassword, updateAvatar, getWatchlist, updateProfileDetails } from "../api/user";
import { getUserBids } from "../api/auction";
import AuctionCard from "../components/AuctionCard";
import { useTheme, THEMES } from "../context/ThemeContext.jsx";
import { useLanguage, LANGUAGES } from "../context/LanguageContext.jsx";

export default function Profile() {
  const { user } = useSelector((state) => state.auth);
  const { theme, setTheme } = useTheme();
  const { language, changeLanguage, t } = useLanguage();

  const [activeTab, setActiveTab] = useState("overview");
  const fileInputRef = useRef(null);

  const [isError, setIsError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [profileData, setProfileData] = useState({
    bio: user?.user?.bio || "",
    phone: user?.user?.phone || "",
    country: user?.user?.location?.country || "US",
  });
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ==========================================
  // API CALLS & MUTATIONS
  // ==========================================

  const { data: watchlistData, isLoading: isWatchlistLoading } = useQuery({
    queryKey: ["watchlist"],
    queryFn: getWatchlist,
  });

  const { data: userBidsData, isLoading: isBidsLoading } = useQuery({
    queryKey: ["userBids"],
    queryFn: getUserBids,
  });

  const uploadAvatarMutate = useMutation({
    mutationFn: updateAvatar,
    onSuccess: () => {
      alert("Profile photo updated successfully!");
      window.location.reload();
    },
    onError: () => alert("Failed to update profile photo"),
  });

  const { mutate: updateProfileMutate, isPending: isProfilePending } = useMutation({
    mutationFn: () => updateProfileDetails(profileData),
    onSuccess: () => {
      setSuccessMessage(t("profileUpdated"));
      setTimeout(() => setSuccessMessage(""), 5000);
      window.location.reload();
    },
    onError: (error) => {
      setIsError(error?.response?.data?.error || "Failed to update profile");
      setTimeout(() => setIsError(""), 5000);
    },
  });

  const { mutate: changePasswordMutate, isPending: isPasswordPending } = useMutation({
    mutationFn: () => changePassword(formData),
    onSuccess: () => {
      setSuccessMessage(t("passwordChanged"));
      setTimeout(() => setSuccessMessage(""), 5000);
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (error) => {
      setIsError(error?.response?.data?.error || "An error occurred");
      setTimeout(() => setIsError(""), 5000);
    },
  });

  // ==========================================
  // HANDLERS
  // ==========================================

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const uploadData = new FormData();
      uploadData.append("avatar", file);
      uploadAvatarMutate.mutate(uploadData);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateProfileMutate();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = formData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setIsError("Please enter all fields");
      setTimeout(() => setIsError(""), 5000);
      return;
    }
    if (newPassword !== confirmPassword) {
      setIsError("New password and confirm password do not match.");
      setTimeout(() => setIsError(""), 5000);
      return;
    }

    changePasswordMutate();
  };

  // ==========================================
  // COMPUTED VALUES
  // ==========================================

  const stats = [
    {
      label: t("totalBids"),
      value: userBidsData?.active?.length || 0,
      icon: <FaGavel className="text-xl" />,
      gradient: "from-blue-500 to-cyan-400",
      bg: "bg-[var(--color-bg-tertiary)]",
      textColor: "theme-accent",
    },
    {
      label: t("watchlistItems"),
      value: watchlistData?.length || 0,
      icon: <FaHeart className="text-xl" />,
      gradient: "from-pink-500 to-rose-400",
      bg: "bg-[var(--color-danger-bg)]",
      textColor: "text-[var(--color-danger)]",
    },
    {
      label: t("activeAuctions"),
      value: userBidsData?.active?.length || 0,
      icon: <RiAuctionLine className="text-xl" />,
      gradient: "from-emerald-500 to-teal-400",
      bg: "bg-[var(--color-success-bg)]",
      textColor: "theme-accent",
    },
  ];

  const tabs = [
    { id: "overview", label: t("overview"), icon: <FaEye className="h-4 w-4" /> },
    { id: "settings", label: t("accountSettings"), icon: <CiSettings className="h-5 w-5" /> },
    { id: "preferences", label: t("preferences"), icon: <MdOutlinePalette className="h-5 w-5" /> },
    { id: "watchlist", label: t("watchlistBids"), icon: <CiHeart className="h-5 w-5" /> },
  ];

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>

      {/* ====== HERO BANNER ====== */}
      <div className="theme-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 md:py-14 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">

            {/* Avatar */}
            <div className="relative group">
              <div className="h-28 w-28 md:h-32 md:w-32 rounded-full ring-4 ring-white/30 shadow-2xl overflow-hidden bg-white/20 backdrop-blur-sm">
                <img
                  src={user?.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user?.name || "U")}&background=059669&color=fff&size=128`}
                  alt="User avatar"
                  className="h-full w-full object-cover"
                />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current.click()}
                disabled={uploadAvatarMutate.isPending}
                className="absolute bottom-1 right-1 bg-white/90 backdrop-blur rounded-full p-2 shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                title="Change Photo"
              >
                <CiCamera className="h-5 w-5 text-gray-700" />
              </button>
            </div>

            {/* User Info */}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl md:text-4xl font-black text-white drop-shadow-sm">
                {user?.user?.name || "Auction User"}
              </h1>
              <p className="text-white/80 font-medium mt-1">{user?.user?.email}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                <span className="px-3 py-1 bg-white/20 backdrop-blur text-white text-xs font-bold rounded-full border border-white/20">
                  ✓ {t("verifiedMember")}
                </span>
                {user?.user?.bio && (
                  <span className="px-3 py-1 bg-white/20 backdrop-blur text-white text-xs font-bold rounded-full border border-white/20 max-w-[200px] truncate">
                    {user.user.bio}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/auction"
                className="flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur hover:bg-white/30 text-white font-bold rounded-xl border border-white/20 transition-all shadow-lg hover:shadow-xl text-sm"
              >
                <MdStorefront className="h-5 w-5" /> {t("viewMarketplace")}
              </Link>
              <Link
                to="/create"
                className="flex items-center gap-2 px-5 py-2.5 theme-accent-bg text-white font-bold rounded-xl transition-all shadow-lg hover:opacity-90 text-sm"
              >
                <MdOutlineCreate className="h-5 w-5" /> {t("createAuction")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ====== STATS ROW ====== */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-6 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="theme-card rounded-2xl p-5 flex items-center gap-4 theme-shadow border hover:scale-[1.02] transition-transform cursor-default"
            >
              <div className={`${stat.bg} p-3.5 rounded-xl ${stat.textColor}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm font-bold theme-text-secondary uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-black theme-text-heading mt-0.5">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ====== MAIN CONTENT ====== */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">

        {/* Tab Navigation */}
        <div className="theme-card rounded-2xl border theme-shadow mb-6 overflow-hidden">
          <div className="px-4 overflow-x-auto">
            <nav className="flex space-x-1 min-w-max" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-5 border-b-2 font-semibold text-sm transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-[var(--color-accent)] theme-accent"
                      : "border-transparent theme-text-muted hover:theme-text-secondary"
                  }`}
                  style={activeTab === tab.id ? {
                    color: "var(--color-accent)",
                    borderColor: "var(--color-accent)"
                  } : {
                    color: "var(--color-text-muted)",
                    borderColor: "transparent"
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="theme-card rounded-2xl border theme-shadow overflow-hidden">

          {/* ====== OVERVIEW TAB ====== */}
          {activeTab === "overview" && (
            <div className="p-6 md:p-8">
              <h3 className="text-xl font-bold theme-text-heading mb-6">{t("profile")} {t("overview")}</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Details Card */}
                <div className="rounded-2xl border p-6" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-tertiary)" }}>
                  <h4 className="text-base font-bold theme-text-heading mb-4 flex items-center gap-2">
                    <CiUser className="h-5 w-5" style={{ color: "var(--color-accent)" }} />
                    {t("personalInfo")}
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="text-sm font-semibold theme-text-secondary w-24 shrink-0">{t("fullName")}</span>
                      <span className="text-sm font-medium theme-text-heading">{user?.user?.name}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-sm font-semibold theme-text-secondary w-24 shrink-0">{t("email")}</span>
                      <span className="text-sm font-medium theme-text-heading">{user?.user?.email}</span>
                    </div>
                    {user?.user?.phone && (
                      <div className="flex items-start gap-3">
                        <span className="text-sm font-semibold theme-text-secondary w-24 shrink-0">{t("phone")}</span>
                        <span className="text-sm font-medium theme-text-heading">{user.user.phone}</span>
                      </div>
                    )}
                    {user?.user?.location?.country && (
                      <div className="flex items-start gap-3">
                        <span className="text-sm font-semibold theme-text-secondary w-24 shrink-0">Country</span>
                        <span className="text-sm font-medium theme-text-heading">{user.user.location.country}</span>
                      </div>
                    )}
                    {user?.user?.bio && (
                      <div className="flex items-start gap-3">
                        <span className="text-sm font-semibold theme-text-secondary w-24 shrink-0">{t("bio")}</span>
                        <span className="text-sm font-medium theme-text-heading">{user.user.bio}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <span className="text-sm font-semibold theme-text-secondary w-24 shrink-0">{t("memberSince")}</span>
                      <span className="text-sm font-medium theme-text-heading">
                        {user?.user?.signupAt
                          ? new Date(user.user.signupAt).toLocaleDateString(undefined, { year: "numeric", month: "long" })
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Links Card */}
                <div className="rounded-2xl border p-6" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-tertiary)" }}>
                  <h4 className="text-base font-bold theme-text-heading mb-4 flex items-center gap-2">
                    <CiGlobe className="h-5 w-5" style={{ color: "var(--color-accent)" }} />
                    Quick Actions
                  </h4>
                  <div className="space-y-3">
                    <Link
                      to="/auction"
                      className="flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.01]"
                      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-card)" }}
                    >
                      <div className="p-2 rounded-lg bg-[var(--color-bg-tertiary)] theme-accent"><MdStorefront className="h-5 w-5" /></div>
                      <div>
                        <p className="font-bold text-sm theme-text-heading">{t("viewMarketplace")}</p>
                        <p className="text-xs theme-text-muted">Browse all auctions</p>
                      </div>
                    </Link>
                    <Link
                      to="/create"
                      className="flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.01]"
                      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-card)" }}
                    >
                      <div className="p-2 rounded-lg bg-[var(--color-accent-light)] theme-accent"><MdOutlineCreate className="h-5 w-5" /></div>
                      <div>
                        <p className="font-bold text-sm theme-text-heading">{t("createAuction")}</p>
                        <p className="text-xs theme-text-muted">List a new item</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ====== SETTINGS TAB ====== */}
          {activeTab === "settings" && (
            <form onSubmit={handleSubmit} className="divide-y" style={{ borderColor: "var(--color-border)" }}>

              {/* Global Messages */}
              <div className="px-6 pt-5">
                {successMessage && (
                  <div className="p-4 rounded-xl mb-4 flex items-center gap-2 text-sm font-medium" style={{ backgroundColor: "var(--color-success-bg)", color: "var(--color-accent)" }}>
                    <MdCheck className="h-5 w-5 shrink-0" /> {successMessage}
                  </div>
                )}
                {isError && (
                  <div className="p-4 rounded-xl mb-4 text-sm font-medium" style={{ backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger)" }}>
                    {isError}
                  </div>
                )}
              </div>

              {/* Personal Information */}
              <div className="px-6 py-6" style={{ borderColor: "var(--color-border)" }}>
                <h3 className="text-lg font-bold theme-text-heading mb-5">{t("personalInfo")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  <div>
                    <label className="block text-sm font-semibold theme-text-secondary mb-1.5">{t("fullName")}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CiUser className="h-5 w-5" style={{ color: "var(--color-text-muted)" }} />
                      </div>
                      <input
                        type="text"
                        value={user?.user?.name}
                        disabled
                        className="theme-input block w-full pl-10 pr-3 py-2.5 rounded-xl text-sm cursor-not-allowed opacity-60 border"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold theme-text-secondary mb-1.5">{t("email")}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CiMail className="h-5 w-5" style={{ color: "var(--color-text-muted)" }} />
                      </div>
                      <input
                        type="email"
                        value={user?.user?.email}
                        disabled
                        className="theme-input block w-full pl-10 pr-3 py-2.5 rounded-xl text-sm cursor-not-allowed opacity-60 border"
                      />
                    </div>
                  </div>
                </div>

                {/* Editable Fields */}
                <div className="grid grid-cols-1 gap-5 mb-5">
                  <div>
                    <label className="block text-sm font-semibold theme-text-secondary mb-1.5">{t("phone")}</label>
                    <input
                      type="text"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      placeholder="+1 (555) 000-0000"
                      className="theme-input block w-full px-4 py-2.5 rounded-xl text-sm border transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold theme-text-secondary mb-1.5">{t("bio")}</label>
                    <textarea
                      name="bio"
                      rows={3}
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      placeholder="Tell us a little about yourself..."
                      className="theme-input block w-full px-4 py-2.5 rounded-xl text-sm border transition-all resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold theme-text-secondary mb-1.5">Country</label>
                    <select
                      name="country"
                      value={profileData.country}
                      onChange={handleProfileChange}
                      className="theme-input block w-full px-4 py-2.5 rounded-xl text-sm border transition-all"
                    >
                      <option value="US">United States (USD)</option>
                      <option value="IN">India (INR)</option>
                      <option value="UK">United Kingdom (GBP)</option>
                      <option value="EU">European Union (EUR)</option>
                      <option value="JP">Japan (JPY)</option>
                      <option value="CN">China (CNY)</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleProfileSubmit}
                    disabled={isProfilePending}
                    className="px-6 py-2.5 text-sm font-bold rounded-xl text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                    style={{ backgroundColor: "var(--color-accent)" }}
                  >
                    {isProfilePending ? t("saving") : t("updateProfile")}
                  </button>
                </div>
              </div>

              {/* Password Section */}
              <div className="px-6 py-6" style={{ borderColor: "var(--color-border)" }}>
                <h3 className="text-lg font-bold theme-text-heading mb-5">{t("changePassword")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {[
                    { name: "currentPassword", label: t("currentPassword"), placeholder: "••••••••" },
                    { name: "newPassword", label: t("newPassword"), placeholder: "••••••••", minLength: 8 },
                    { name: "confirmPassword", label: t("confirmPassword"), placeholder: "••••••••" },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-semibold theme-text-secondary mb-1.5">{field.label}</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CiLock className="h-5 w-5" style={{ color: "var(--color-text-muted)" }} />
                        </div>
                        <input
                          type="password"
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleChange}
                          minLength={field.minLength}
                          placeholder={field.placeholder}
                          className="theme-input block w-full pl-10 pr-3 py-2.5 rounded-xl text-sm border transition-all"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="px-6 py-5 flex justify-end gap-3" style={{ backgroundColor: "var(--color-bg-tertiary)", borderColor: "var(--color-border)" }}>
                <button
                  type="button"
                  onClick={() => setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" })}
                  className="px-5 py-2.5 text-sm font-medium rounded-xl border transition-colors"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                >
                  {t("clear")}
                </button>
                <button
                  type="submit"
                  disabled={isPasswordPending}
                  className="px-6 py-2.5 text-sm font-bold rounded-xl text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                  style={{ backgroundColor: "var(--color-accent)" }}
                >
                  {isPasswordPending ? t("saving") : t("save")}
                </button>
              </div>
            </form>
          )}

          {/* ====== PREFERENCES TAB ====== */}
          {activeTab === "preferences" && (
            <div className="p-6 md:p-8">
              <h3 className="text-xl font-bold theme-text-heading mb-2">{t("appearanceSettings")}</h3>
              <p className="theme-text-secondary text-sm mb-8">{t("chooseTheme")}</p>

              {/* Theme Picker */}
              <div className="mb-10">
                <h4 className="text-base font-bold theme-text-heading mb-4 flex items-center gap-2">
                  <MdColorLens className="h-5 w-5" style={{ color: "var(--color-accent)" }} />
                  {t("selectTheme")}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {THEMES.map((t_item) => (
                    <button
                      key={t_item.id}
                      onClick={() => setTheme(t_item.id)}
                      className={`relative rounded-2xl border-2 p-4 transition-all hover:scale-105 ${
                        theme === t_item.id
                          ? "shadow-lg ring-2"
                          : "hover:shadow-md"
                      }`}
                      style={{
                        backgroundColor: t_item.preview.card,
                        borderColor: theme === t_item.id ? t_item.preview.accent : "transparent",
                        ...(theme === t_item.id ? { ringColor: t_item.preview.accent } : {}),
                      }}
                    >
                      {theme === t_item.id && (
                        <div
                          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: t_item.preview.accent }}
                        >
                          <MdCheck className="text-white text-sm" />
                        </div>
                      )}
                      <div className="text-3xl mb-2">{t_item.emoji}</div>
                      <div
                        className="h-2 w-full rounded-full mb-2"
                        style={{ backgroundColor: t_item.preview.accent }}
                      />
                      <p className="text-sm font-bold" style={{ color: t_item.id === "light" || t_item.id === "emerald" ? "#064e3b" : "#e2e8f0" }}>
                        {t_item.name}
                      </p>
                      <div className="flex gap-1 mt-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: t_item.preview.bg }} />
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: t_item.preview.accent }} />
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: t_item.preview.card }} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Picker */}
              <div>
                <h4 className="text-base font-bold theme-text-heading mb-2 flex items-center gap-2">
                  <MdLanguage className="h-5 w-5" style={{ color: "var(--color-accent)" }} />
                  {t("selectLanguage")}
                </h4>
                <p className="theme-text-secondary text-sm mb-4">{t("chooseLanguage")}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all hover:scale-105 ${
                        language === lang.code
                          ? "shadow-lg"
                          : "hover:shadow-md"
                      }`}
                      style={{
                        backgroundColor: "var(--color-card)",
                        borderColor: language === lang.code ? "var(--color-accent)" : "var(--color-border)",
                      }}
                    >
                      <span className="text-3xl">{lang.flag}</span>
                      <span className="text-sm font-bold theme-text-heading">{lang.name}</span>
                      {language === lang.code && (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: "var(--color-accent)" }}
                        >
                          <MdCheck className="text-white text-xs" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ====== WATCHLIST & BIDS TAB ====== */}
          {activeTab === "watchlist" && (
            <div className="p-6 md:p-8">
              {/* Watchlist Section */}
              <div className="mb-10">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold theme-text-heading">{t("myWatchlist")}</h3>
                  <span className="text-sm font-bold theme-badge px-3 py-1 rounded-full">
                    {watchlistData?.length || 0} Items
                  </span>
                </div>

                {isWatchlistLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: "var(--color-border)", borderTopColor: "var(--color-accent)" }}></div>
                  </div>
                ) : !watchlistData || watchlistData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-2xl" style={{ borderColor: "var(--color-border)" }}>
                    <CiHeart className="h-16 w-16 theme-text-muted mb-3" />
                    <p className="theme-text-heading font-bold text-lg">{t("emptyWatchlist")}</p>
                    <p className="theme-text-muted text-sm mt-1">{t("exploreCta")}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {watchlistData.map((auction) => (
                      <AuctionCard key={auction._id} auction={auction} />
                    ))}
                  </div>
                )}
              </div>

              {/* Active Bids Section */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold theme-text-heading">{t("activeBids")}</h3>
                  <span className="text-sm font-bold theme-badge px-3 py-1 rounded-full">
                    {userBidsData?.active?.length || 0} Auctions
                  </span>
                </div>

                {isBidsLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: "var(--color-border)", borderTopColor: "var(--color-accent)" }}></div>
                  </div>
                ) : !userBidsData?.active || userBidsData.active.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-2xl" style={{ borderColor: "var(--color-border)" }}>
                    <CiViewList className="h-16 w-16 theme-text-muted mb-3" />
                    <p className="theme-text-heading font-bold text-lg">{t("emptyBids")}</p>
                    <p className="theme-text-muted text-sm mt-1">{t("bidsCta")}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {userBidsData.active.map((auction) => (
                      <AuctionCard key={auction._id} auction={auction} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}