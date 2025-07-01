"use client";
import { useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";

export default function FeedbackPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [form, setForm] = useState({ strType: "bug", strMessage: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      let token = "";
      if (user && isLoaded) {
        token = await getToken();
      }
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error("Failed to submit feedback");
      setSuccess(true);
      setForm({ strType: "bug", strMessage: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Submit Feedback or Bug Report</h1>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow">
        <label className="block mb-2">
          Type
          <select
            name="strType"
            value={form.strType}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="bug">Bug</option>
            <option value="suggestion">Suggestion</option>
            <option value="question">Question</option>
          </select>
        </label>
        <label className="block mb-2">
          Message
          <textarea
            name="strMessage"
            value={form.strMessage}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </label>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
          disabled={loading}
        >
          Submit
        </button>
        {success && <div className="text-green-600 mt-2">Thank you for your feedback!</div>}
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </form>
    </div>
  );
} 