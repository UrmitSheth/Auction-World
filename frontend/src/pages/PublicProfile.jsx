import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import axios from "axios";
import LoadingScreen from "../components/LoadingScreen";
import AuctionCard from "../components/AuctionCard";
import {
  CiUser, CiMail, CiCalendar, CiGlobe, CiLocationOn
} from "react-icons/ci";
import { MdStorefront, MdChat } from "react-icons/md";
import { RiAuctionLine } from "react-icons/ri";
import { FaGavel } from "react-icons/fa";
import { format } from "date-fns";

export default function PublicProfile() {
  const { id } = useParams();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API}/user/public/${id}`, { withCredentials: true });
        setUserProfile(res.data);
      } catch (err) {
        setError("User profile not found");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id]);

  if (loading) return <LoadingScreen />;

  if (error || !userProfile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center" style={{ color: "var(--color-text)" }}>
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text-heading)" }}>Profile Not Found</h2>
        <p className="mb-6 mt-1" style={{ color: "var(--color-text-secondary)" }}>We couldn't locate the user you were looking for.</p>
        <Link to="/auction" className="px-6 py-2.5 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all" style={{ backgroundColor: "var(--color-accent)" }}>
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const { user, activeAuctions } = userProfile;

  const stats = [
    {
      label: "Active Auctions",
      value: activeAuctions?.length || 0,
      icon: <RiAuctionLine className="text-xl" />,
      bg: "bg-[var(--color-bg-tertiary)]",
      textColor: "theme-accent",
    },
    {
      label: "Total Bids Received",
      value: activeAuctions?.reduce((sum, a) => sum + (a.bids?.length || 0), 0) || 0,
      icon: <FaGavel className="text-xl" />,
      bg: "bg-[var(--color-success-bg)]",
      textColor: "theme-accent",
    },
  ];

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
            <div className="relative">
              <div className="h-28 w-28 md:h-32 md:w-32 rounded-full ring-4 ring-white/30 shadow-2xl overflow-hidden bg-white/20 backdrop-blur-sm">
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=059669&color=fff&size=128`}
                  alt={`${user.name} avatar`}
                  className="h-full w-full object-cover"
                />
              </div>
              {/* Online indicator */}
              {user.isOnline && (
                <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-400 rounded-full border-4 border-white shadow-sm"></div>
              )}
            </div>

            {/* User Info */}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl md:text-4xl font-black text-white drop-shadow-sm">
                {user.name}
              </h1>
              <p className="text-white/80 font-medium mt-1">{user.email}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                {user.isOnline ? (
                  <span className="px-3 py-1 bg-green-400/20 backdrop-blur text-green-100 text-xs font-bold rounded-full border border-green-300/30">
                    ● Online
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-white/15 backdrop-blur text-white/70 text-xs font-bold rounded-full border border-white/15">
                    ○ Offline
                  </span>
                )}
                <span className="px-3 py-1 bg-white/20 backdrop-blur text-white text-xs font-bold rounded-full border border-white/20 flex items-center gap-1">
                  <CiCalendar className="h-3.5 w-3.5" />
                  Joined {format(new Date(user.signupAt), "MMMM yyyy")}
                </span>
                {user.location?.country && (
                  <span className="px-3 py-1 bg-white/20 backdrop-blur text-white text-xs font-bold rounded-full border border-white/20 flex items-center gap-1">
                    <CiLocationOn className="h-3.5 w-3.5" />
                    {user.location.country}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to={`/chat?user=${user._id}`}
                className="flex items-center gap-2 px-5 py-2.5 theme-accent-bg text-white font-bold rounded-xl transition-all shadow-lg hover:opacity-90 text-sm"
              >
                <MdChat className="h-5 w-5" /> Message
              </Link>
              <Link
                to="/auction"
                className="flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur hover:bg-white/30 text-white font-bold rounded-xl border border-white/20 transition-all shadow-lg hover:shadow-xl text-sm"
              >
                <MdStorefront className="h-5 w-5" /> Marketplace
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ====== STATS ROW ====== */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-6 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      {/* ====== ACTIVE AUCTIONS ====== */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="theme-card rounded-2xl border theme-shadow overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold theme-text-heading flex items-center gap-2">
                <RiAuctionLine style={{ color: "var(--color-accent)" }} />
                Active Auctions by {user.name.split(" ")[0]}
              </h3>
              <span className="text-sm font-bold theme-badge px-3 py-1 rounded-full">
                {activeAuctions?.length || 0} Items
              </span>
            </div>

            {!activeAuctions || activeAuctions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-2xl" style={{ borderColor: "var(--color-border)" }}>
                <RiAuctionLine className="h-16 w-16 theme-text-muted mb-3" />
                <p className="theme-text-heading font-bold text-lg">No active auctions at the moment.</p>
                <p className="theme-text-muted text-sm mt-1">This user doesn't have any items currently open for bidding.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {activeAuctions.map((auction) => (
                  <AuctionCard key={auction._id} auction={auction} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
