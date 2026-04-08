import { Link } from "react-router";

export const Footer = () => {
  return (
      <footer style={{ backgroundColor: "var(--color-bg-secondary)", borderColor: "var(--color-border)" }} className="py-8 border-t">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold" style={{ color: "var(--color-text-heading)" }}>
                Auction World
              </h3>
              <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                Your trusted marketplace since 2026
              </p>
            </div>
            <div className="flex space-x-6">
              <Link
                to="/about"
                className="text-sm transition-colors hover:underline"
                style={{ color: "var(--color-text-secondary)" }}
              >
                About
              </Link>
              <Link
                to="/legal"
                className="text-sm transition-colors hover:underline"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Legal
              </Link>
              <Link
                to="/contact"
                className="text-sm transition-colors hover:underline"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-6 pt-6 text-center" style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "var(--color-border)" }}>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              © 2026 Auction World. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
  );
};
