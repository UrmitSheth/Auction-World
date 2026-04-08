import { Link } from "react-router";

export default function Legal() {
  const legalPages = [
    {
      title: "Privacy Policy",
      description:
        "Learn how we collect, use, and protect your personal information.",
      to: "/legal/privacy-policy",
    },
    {
      title: "Terms of Service",
      description:
        "The terms and conditions governing your use of our platform.",
      to: "/legal/terms-of-service",
    },
    {
      title: "DMCA Policy",
      description: "Our policy for handling copyright infringement claims.",
      to: "/legal/dmca",
    },
    {
      title: "Code of Conduct",
      description:
        "Guidelines for respectful and appropriate behavior on our platform.",
      to: "/legal/code-of-conduct",
    },
    {
      title: "Acceptable Use Policy",
      description: "Rules about what you can and cannot do on our platform.",
      to: "/legal/acceptable-use-policy",
    },
  ];

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="p-8 pl-3">
          <h1 className="text-3xl font-bold theme-text-heading mb-2">
            Legal Documents
          </h1>
          <p className="text-lg theme-text-secondary mb-8">
            Please review our legal documents to understand your rights and
            responsibilities when using our online auction platform.
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {legalPages.map((page) => (
              <Link
                key={page.to}
                to={page.to}
                className="block p-6 theme-bg-secondary hover:bg-[var(--color-bg-tertiary)] border theme-border rounded-sm shadow-sm hover:shadow-md transition-all"
              >
                <h3 className="text-lg font-semibold theme-text-heading mb-2">
                  {page.title}
                </h3>
                <p className="theme-text-secondary text-sm">{page.description}</p>
              </Link>
            ))}
          </div>

          <div className="mt-12 p-6 theme-bg-secondary rounded-sm">
            <h2 className="text-xl font-semibold theme-text-heading mb-4">
              You Have Any Questions?
            </h2>
            <p className="theme-text-secondary leading-relaxed">
              If you have any questions about our legal policies, please contact
              us using <Link to={"/contact"} className="theme-accent hover:underline">contact page</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
