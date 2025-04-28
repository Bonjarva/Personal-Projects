import React, { useState } from "react";

export default function ContactPage() {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire this up to your contact API or email service
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-xl py-12 px-4">
      <h1 className="prose">Contact Us</h1>

      {!sent ? (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Your message..."
            required
            className="w-full rounded border-gray-300 p-2 focus:border-blue-500 focus:ring"
            rows={5}
          />
          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
          >
            Send Message
          </button>
        </form>
      ) : (
        <p className="mt-6 text-green-600">
          Thanks for reaching out—we’ll be in touch!
        </p>
      )}
    </div>
  );
}
