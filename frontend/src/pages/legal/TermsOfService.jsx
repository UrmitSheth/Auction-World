export default function TermsOfService() {
  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="p-8 pl-3">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Terms of Service
          </h1>
          <p className="text-sm text-gray-600 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Acceptance of Terms
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              By using this Online Auction System, you agree to follow all the rules and conditions mentioned below. If you do not agree, please do not use this platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              User Accounts
            </h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Users must be at least 18 years old to create an account.</li>
              <li>
                Each user is responsible for keeping their login details safe.
              </li>
              <li>Users must provide correct and complete information during registration.</li>
              <li>All activities done through your account are your responsibility.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Auction Rules
            </h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Once a bid is placed, it cannot be cancelled.</li>
              <li>The user with the highest bid at the end of the auction wins the item.</li>
              <li>The winning bidder must complete the payment within 48 hours.</li>
              <li>Sellers must provide correct details about the products they list.</li>
              <li>The admin has the right to cancel any auction if rules are not followed.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Payments
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The platform may charge listing or service fees. All fees are non-refundable unless stated otherwise.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Prohibited Activities
            </h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>List illegal or restricted items</li>
              <li>Place fake bids or manipulate auctions</li>
              <li>Create multiple accounts</li>
              <li>Harass or misuse other users</li>
              <li>Try to complete deals outside the platform</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Limitation of Liability
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              This platform is not responsible for any loss or damage caused during the use of the system. The platform’s responsibility is limited as per project rules.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Termination
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
             The admin can suspend or terminate any user account if the rules are violated or for security reasons.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
