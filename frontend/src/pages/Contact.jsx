import { useState } from "react";
import { FiSend, FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { useMutation } from "@tanstack/react-query";
import { sendMessage } from "../api/contact";

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isError, setIsError] = useState("");

  const { isPending, mutate } = useMutation({
    mutationFn: () => sendMessage(formData),
    onSuccess: () => {
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
      setSubmitted(true);
    },
    onError: (error) => {
      setIsError(error?.response?.data?.error || "Something went wrong. Please try again.");
      setTimeout(() => {
        setIsError("");
      }, 10000);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(formData);
  };

  return (
    <main className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-200" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold theme-text-heading tracking-tight">
            Get in Touch
          </h1>
          <p className="mt-4 text-lg theme-text-secondary">
            Have questions about auctions or need support? We're here to help.
          </p>
        </div>

        <div className="theme-card rounded-2xl shadow-xl overflow-hidden flex flex-col lg:flex-row border" style={{ borderColor: "var(--color-border)" }}>
          
          {/* Left Side: Contact Information */}
          <div className="p-10 lg:w-1/3 flex flex-col justify-between" style={{ backgroundColor: "var(--color-accent)", color: "#fff" }}>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-6 text-white">Contact Information</h3>
              <p className="mb-8 leading-relaxed text-white/90">
                Fill out the form and our team will get back to you within 24 hours.
              </p>
              
              <div className="space-y-6 text-white">
                <div className="flex items-center group">
                  <div className="p-3 bg-white/20 rounded-lg mr-4 transition-colors">
                    <FiMail className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-lg font-medium">dipti.jani2005@gmail.com</span>
                </div>
                <div className="flex items-center group">
                  <div className="p-3 bg-white/20 rounded-lg mr-4 transition-colors">
                    <FiMapPin className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-lg font-medium">Auction World HQ</span>
                </div>
                <div className="flex items-center group">
                  <div className="p-3 bg-white/20 rounded-lg mr-4 transition-colors">
                    <FiPhone className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-lg font-medium">+1 (555) 123-4567</span>
                </div>
              </div>
            </div>
            
            {/* Optional decorative element */}
            <div className="mt-12 opacity-30 pointer-events-none relative z-0">
               <svg width="100%" height="80" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="10" fill="currentColor" />
                  <circle cx="60" cy="60" r="15" fill="currentColor" />
                  <circle cx="120" cy="30" r="8" fill="currentColor" />
                  <circle cx="180" cy="80" r="12" fill="currentColor" />
               </svg>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="p-10 lg:w-2/3" style={{ backgroundColor: "var(--color-card)" }}>
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center animate-fade-in-up">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-inner" style={{ backgroundColor: "var(--color-bg-tertiary)" }}>
                  <FiSend className="w-10 h-10" style={{ color: "var(--color-accent)" }} />
                </div>
                <h2 className="text-3xl font-bold theme-text-heading mb-4">
                  Message Sent!
                </h2>
                <p className="text-lg theme-text-secondary mb-8 max-w-md">
                  Thank you for reaching out. We have received your message and will respond to <span className="font-semibold theme-text-heading">{formData.email}</span> shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-8 py-3 text-white font-medium rounded-lg transition-transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                  style={{ backgroundColor: "var(--color-accent)" }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {isError && (
                  <div className="p-4 rounded-xl mb-4 text-sm font-medium" style={{ backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger)" }}>
                    {isError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold theme-text-secondary mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="theme-input block w-full px-5 py-3 rounded-lg border transition-colors focus:ring-2 focus:outline-none"
                      style={{ borderColor: "var(--color-border)" }}
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold theme-text-secondary mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="theme-input block w-full px-5 py-3 rounded-lg border transition-colors focus:ring-2 focus:outline-none"
                      style={{ borderColor: "var(--color-border)" }}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold theme-text-secondary mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="theme-input block w-full px-5 py-3 rounded-lg border transition-colors focus:ring-2 focus:outline-none"
                    style={{ borderColor: "var(--color-border)" }}
                    placeholder="How can we help you?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold theme-text-secondary mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="theme-input block w-full px-5 py-3 rounded-lg border transition-colors resize-none focus:ring-2 focus:outline-none"
                    style={{ borderColor: "var(--color-border)" }}
                    placeholder="Write your message here..."
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full sm:w-auto flex justify-center items-center px-8 py-3.5 text-white text-lg font-medium rounded-lg focus:outline-none transition-all active:scale-95 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    style={{ backgroundColor: "var(--color-accent)" }}
                  >
                    {isPending ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      <>
                        Send Message
                        <FiSend className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};