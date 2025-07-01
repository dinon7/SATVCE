"use client";
import { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export interface FeedbackReport {
  id: string;
  strUserId?: string;
  strType: string;
  strMessage: string;
  strStatus: string;
  strAdminResponse?: string;
  created_at?: string;
  updated_at?: string;
}

export default function AdminFeedbackPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [feedback, setFeedback] = useState<FeedbackReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<FeedbackReport | null>(null);
  const [form, setForm] = useState<Partial<FeedbackReport>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
    }
  }, [isLoaded, user, router]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await fetch("/api/admin/feedback", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch feedback");
      const data = await response.json();
      setFeedback(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchFeedback();
  }, [user, fetchFeedback]);

  const handleEdit = (fb: FeedbackReport) => {
    setEditingFeedback(fb);
    setForm(fb);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this feedback?") ) return;
    try {
      setSaving(true);
      const token = await getToken();
      const response = await fetch(`/api/admin/feedback/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete feedback");
      await fetchFeedback();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete feedback");
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = await getToken();
      const response = await fetch(`/api/admin/feedback/${editingFeedback?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error("Failed to update feedback");
      setShowForm(false);
      setEditingFeedback(null);
      setForm({});
      await fetchFeedback();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update feedback");
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded) return <div>Loading...</div>;
  if (loading) return <div>Loading feedback...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin: Feedback & Bug Reports</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Type</th>
            <th className="p-2 border">Message</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">User</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {feedback.map((fb) => (
            <tr key={fb.id} className="border-b">
              <td className="p-2 border">{fb.strType}</td>
              <td className="p-2 border">{fb.strMessage}</td>
              <td className="p-2 border">{fb.strStatus}</td>
              <td className="p-2 border">{fb.strUserId || "-"}</td>
              <td className="p-2 border">
                <button
                  className="mr-2 px-2 py-1 bg-yellow-500 text-white rounded"
                  onClick={() => handleEdit(fb)}
                >
                  Update
                </button>
                <button
                  className="px-2 py-1 bg-red-600 text-white rounded"
                  onClick={() => handleDelete(fb.id)}
                  disabled={saving}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form
            className="bg-white p-6 rounded shadow-md w-full max-w-lg"
            onSubmit={handleFormSubmit}
          >
            <h2 className="text-xl font-bold mb-4">Update Feedback</h2>
            <label className="block mb-2">
              Status
              <select
                name="strStatus"
                value={form.strStatus || "open"}
                onChange={handleFormChange}
                className="w-full border p-2 rounded"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </label>
            <label className="block mb-2">
              Admin Response
              <textarea
                name="strAdminResponse"
                value={form.strAdminResponse || ""}
                onChange={handleFormChange}
                className="w-full border p-2 rounded"
              />
            </label>
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded"
                disabled={saving}
              >
                Save
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-gray-400 text-white rounded"
                onClick={() => {
                  setShowForm(false);
                  setEditingFeedback(null);
                  setForm({});
                }}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 