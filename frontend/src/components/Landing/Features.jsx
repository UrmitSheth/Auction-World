import { FaClock, FaGavel, FaShieldAlt, FaRobot, FaComments, FaPalette } from "react-icons/fa";

export const Features = () => {
  const features = [
    {
      icon: <FaGavel className="text-2xl theme-accent" />,
      bg: "bg-[var(--color-bg-tertiary)]",
      title: "Smart Bidding",
      desc: "Place manual bids or set an auto-bid limit and let our proxy system bid for you automatically, ensuring you never overpay.",
    },
    {
      icon: <FaShieldAlt className="text-2xl theme-accent" />,
      bg: "bg-[var(--color-bg-tertiary)]",
      title: "Secure & Trusted",
      desc: "Every transaction is protected with encrypted passwords, server-side validation, and session-based authentication.",
    },
    {
      icon: <FaClock className="text-2xl theme-accent" />,
      bg: "bg-[var(--color-bg-tertiary)]",
      title: "Real-Time Updates",
      desc: "Live bid notifications, auction countdowns, and instant alerts keep you informed the moment something happens.",
    },
    {
      icon: <FaRobot className="text-2xl theme-accent" />,
      bg: "bg-[var(--color-bg-tertiary)]",
      title: "Auto-Bid (Proxy Bidding)",
      desc: "Set your maximum budget and our system places the smallest winning bid on your behalf — automatically and strategically.",
    },
    {
      icon: <FaComments className="text-2xl theme-accent" />,
      bg: "bg-[var(--color-bg-tertiary)]",
      title: "Built-In Chat",
      desc: "Message any buyer or seller directly through our real-time chat system. Ask questions, negotiate, and build trust.",
    },
    {
      icon: <FaPalette className="text-2xl theme-accent" />,
      bg: "bg-[var(--color-bg-tertiary)]",
      title: "Customizable Themes",
      desc: "Choose from 5 stunning themes — Light, Dark, Emerald, Ocean, and Sunset. Make the platform truly yours.",
    },
  ];

  return (
    <section className="py-16 md:py-24 theme-bg-secondary">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black theme-text-heading mb-4">
            Why Choose Auction World?
          </h2>
          <p className="text-lg theme-text-secondary max-w-2xl mx-auto font-medium">
            A feature-rich platform built for serious bidders and sellers, with everything you need in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="theme-card p-6 rounded-2xl border theme-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-14 h-14 ${f.bg} rounded-xl flex items-center justify-center mb-4`}>
                {f.icon}
              </div>
              <h3 className="text-lg font-bold theme-text-heading mb-2">{f.title}</h3>
              <p className="theme-text-muted text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
