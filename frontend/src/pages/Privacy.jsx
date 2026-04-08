import { useState } from "react";
import { Link } from "react-router";
import {
  CiCalendar,
  CiGlobe,
  CiMapPin,
  CiServer,
  CiMonitor,
} from "react-icons/ci";
import { useQuery } from "@tanstack/react-query";
import { loginHistory } from "../api/user";
import LoadingScreen from "../components/LoadingScreen";

export default function Privacy() {
  const { data, isLoading } = useQuery({
    queryFn: loginHistory,
    queryKey: ["userLogins"],
    staleTime: 60 * 1000 * 5,
  });

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="theme-bg theme-text min-h-screen flex transition-colors">
      {/* Page content */}
      <main className="p-4 sm:p-6 lg:p-8 mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold theme-text-heading">
            Privacy & Security
          </h1>
          <p className="theme-text-muted pb-4">
            View your login history and security settings
          </p>

          {data && (
            <div className="flex flex-col gap-4">
              {data.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-sm border theme-card theme-border p-4 shadow-sm"
                >
                  <div className="grid grid-cols-1 gap-y-2 sm:grid-cols-2 sm:gap-x-4 lg:grid-cols-3">
                    <div className="flex items-center">
                      <CiCalendar className="size-4 text-gray-500 mr-2" />
                      <span className="text-sm font-medium theme-text-heading">
                        Date & Time:
                      </span>
                      <span className="ml-2 text-sm theme-text-secondary">
                        {entry.dateTime}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <CiGlobe className="size-4 text-gray-500 mr-2" />
                      <span className="text-sm font-medium theme-text-heading">
                        IP Address:
                      </span>
                      <span className="ml-2 text-sm theme-text-secondary">
                        {entry.ipAddress}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <CiMapPin className="size-4 text-gray-500 mr-2" />
                      <span className="text-sm font-medium theme-text-heading">
                        Location:
                      </span>
                      <span className="ml-2 text-sm theme-text-secondary">
                        {entry.location}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <CiServer className="size-4 text-gray-500 mr-2" />
                      <span className="text-sm font-medium theme-text-heading">
                        ISP:
                      </span>
                      <span className="ml-2 text-sm theme-text-secondary">
                        {entry.isp}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <CiMonitor className="size-4 text-gray-500 mr-2" />
                      <span className="text-sm font-medium theme-text-heading">
                        Device:
                      </span>
                      <span className="ml-2 text-sm theme-text-secondary">
                        {entry.device}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security settings */}
        <div>
          <h2 className="text-lg font-medium theme-text-heading mb-4">
            Security Settings
          </h2>
          <div className="theme-card theme-border shadow overflow-hidden border rounded-md divide-y divide-[var(--color-border)]">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium theme-text-heading">
                    Two-Factor Authentication
                  </h3>
                  <p className="text-sm theme-text-muted mt-1">
                    Add an extra layer of security to your account by requiring
                    a verification code in addition to your password.
                  </p>
                </div>
                <div className="ml-4">
                  <button
                    disabled
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white theme-accent-bg opacity-50 cursor-not-allowed"
                  >
                    Enable
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium theme-text-heading">
                    Password
                  </h3>
                  <p className="text-sm theme-text-muted mt-1">
                    Change you password
                  </p>
                </div>
                <div className="ml-4">
                  <Link
                    to="/profile"
                    className="px-4 py-2 border theme-border text-sm font-medium rounded-md theme-text-heading theme-bg-secondary hover:bg-[var(--color-bg-tertiary)] focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-[var(--color-accent)]"
                  >
                    Change
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
