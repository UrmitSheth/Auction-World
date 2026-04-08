import { Link } from "react-router";
import { useSelector } from "react-redux";
import { FaGavel, FaUsers, FaShieldAlt, FaRocket, FaCode, FaGlobe, FaBolt, FaComments, FaPalette, FaCog } from "react-icons/fa";
import { RiAuctionLine } from "react-icons/ri";

export const About = () => {
  const { user } = useSelector((state) => state.auth);

  const techStack = [
    { name: "React 19", desc: "Modern UI with hooks & context", icon: <FaCode className="text-blue-500" /> },
    { name: "Node.js & Express", desc: "Scalable REST API backend", icon: <FaRocket className="text-green-500" /> },
    { name: "MongoDB", desc: "Flexible NoSQL data storage", icon: <FaGlobe className="text-emerald-500" /> },
    { name: "Socket.IO", desc: "Real-time bidding & messaging", icon: <FaBolt className="text-yellow-500" /> },
    { name: "Cloudinary", desc: "Cloud-based image management", icon: <FaPalette className="text-purple-500" /> },
    { name: "Redux Toolkit", desc: "Centralized state management", icon: <FaCog className="text-indigo-500" /> },
  ];

  const features = [
    "Live real-time auction bidding with auto-bid (proxy bidding) support",
    "Buy It Now option for instant purchasing alongside auctions",
    "Real-time chat system for buyer-seller communication",
    "Multi-currency support with live exchange rate conversion",
    "Notification system with unread count and activity alerts",
    "User profile with avatar upload, watchlist, and bid history",
    "Multiple theme options — Light, Dark, Emerald, Ocean, and Sunset",
    "Multi-language support — English, Hindi, Spanish, French, German, Japanese",
    "Admin dashboard for platform-wide user and auction management",
    "Mobile-responsive design optimized for all screen sizes",
    "Secure authentication with session cookies and password hashing",
    "Login history tracking with IP, device, and location detection",
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* Hero Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-lg" style={{ backgroundColor: "var(--color-accent)" }}>
            <RiAuctionLine className="text-white text-4xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4" style={{ color: "var(--color-text-heading)" }}>
            About Auction World
          </h1>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            A full-stack, real-time online auction platform where users can buy, sell, bid, and communicate — built with modern web technologies.
          </p>
        </div>

        {/* Project Overview Card */}
        <div className="theme-card rounded-2xl border theme-shadow p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3" style={{ color: "var(--color-text-heading)" }}>
            <FaGavel style={{ color: "var(--color-accent)" }} /> Project Overview
          </h2>
          <div className="space-y-4 text-base leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            <p>
              <strong style={{ color: "var(--color-text-heading)" }}>Auction World</strong> is a comprehensive online auction and e-commerce system designed to simulate a real-world bidding marketplace. It enables users to list items for auction, browse active listings, place manual or automated bids, and purchase items instantly through a Buy It Now feature.
            </p>
            <p>
              The platform also includes a real-time chat system for buyers and sellers to communicate directly, a notification system to keep users informed about auction activity, and a personalized dashboard with global statistics and inventory management.
            </p>
            <p>
              This project was developed as part of an academic internship and final-year project, showcasing proficiency in the MERN stack (MongoDB, Express.js, React, Node.js) along with modern frontend practices such as theming, internationalization, and responsive design.
            </p>
          </div>
        </div>

        {/* Key Features */}
        <div className="theme-card rounded-2xl border theme-shadow p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: "var(--color-text-heading)" }}>
            <FaBolt className="text-yellow-500" /> Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {features.map((feature, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: "var(--color-bg-tertiary)" }}>
                <span className="mt-0.5 text-lg" style={{ color: "var(--color-accent)" }}>✓</span>
                <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="theme-card rounded-2xl border theme-shadow p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: "var(--color-text-heading)" }}>
            <FaCode className="text-blue-500" /> Technology Stack
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {techStack.map((tech, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl border" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-tertiary)" }}>
                <div className="text-2xl">{tech.icon}</div>
                <div>
                  <p className="font-bold text-sm" style={{ color: "var(--color-text-heading)" }}>{tech.name}</p>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{tech.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Developer & Academic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="theme-card rounded-2xl border theme-shadow p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "var(--color-text-heading)" }}>
              <FaUsers style={{ color: "var(--color-accent)" }} /> Developers
            </h2>
            <div style={{ color: "var(--color-text-secondary)" }}>
              <p className="text-sm mb-2">
                This project was created by the following team as part of a final-year academic program:
              </p>
              <ul className="space-y-1 mb-3">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--color-accent)" }}></span>
                  <strong style={{ color: "var(--color-text-heading)" }}>Patel Saurav</strong>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--color-accent)" }}></span>
                  <strong style={{ color: "var(--color-text-heading)" }}>Jani Dipti</strong>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--color-accent)" }}></span>
                  <strong style={{ color: "var(--color-text-heading)" }}>Sheth Urmitkumar</strong>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--color-accent)" }}></span>
                  <strong style={{ color: "var(--color-text-heading)" }}>Jadav Parth</strong>
                </li>
              </ul>
              <p className="text-sm flex items-center gap-2 mt-4 pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
                <a href="mailto:dipti.jani5005@gmail.com" className="font-bold hover:underline" style={{ color: "var(--color-accent)" }}>
                  dipti.jani5005@gmail.com
                </a>
              </p>
            </div>
          </div>

          <div className="theme-card rounded-2xl border theme-shadow p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "var(--color-text-heading)" }}>
              <FaShieldAlt style={{ color: "var(--color-accent)" }} /> Security
            </h2>
            <ul className="space-y-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
              <li className="flex items-start gap-2"><span style={{ color: "var(--color-accent)" }}>•</span> Bcrypt password hashing with salted encryption</li>
              <li className="flex items-start gap-2"><span style={{ color: "var(--color-accent)" }}>•</span> HTTP-only session cookies for authentication</li>
              <li className="flex items-start gap-2"><span style={{ color: "var(--color-accent)" }}>•</span> Server-side bid validation to prevent manipulation</li>
              <li className="flex items-start gap-2"><span style={{ color: "var(--color-accent)" }}>•</span> Cloudinary-secured image uploads with limits</li>
              <li className="flex items-start gap-2"><span style={{ color: "var(--color-accent)" }}>•</span> Login history with IP and device tracking</li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center theme-card rounded-2xl border theme-shadow p-8">
          <p className="text-lg font-medium mb-4" style={{ color: "var(--color-text-secondary)" }}>
            Have questions or feedback?
          </p>
          <Link
            to="/contact"
            className="inline-block px-8 py-3 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            Contact Us
          </Link>
        </div>

      </div>
    </div>
  );
};
