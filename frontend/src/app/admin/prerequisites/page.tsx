"use client";
import { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export interface Prerequisite {
  id: string;
  strCourseCode: string;
  strCourseTitle: string;
  arrRequiredSubjects: string[];
  strUniversity: string;
  strNotes?: string;
  created_at?: string;
  updated_at?: string;
}

export default function AdminPrerequisitesPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [prereqs, setPrereqs] = useState<Prerequisite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPrereq, setEditingPrereq] = useState<Prerequisite | null>(null);
  const [form, setForm] = useState<Partial<Prerequisite>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
    }
  }, [isLoaded, user, router]);

  const fetchPrereqs = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await fetch("/api/admin/prerequisites", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch prerequisites");
      const data = await response.json();
      setPrereqs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch prerequisites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchPrereqs();
  }, [user, fetchPrereqs]);

  const handleEdit = (prereq: Prerequisite) => {
    setEditingPrereq(prereq);
    setForm(prereq);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this prerequisite?")) return;
    try {
      setSaving(true);
      const token = await getToken();
      const response = await fetch(`/api/admin/prerequisites/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete prerequisite");
      await fetchPrereqs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete prerequisite");
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormArrayChange = (name: keyof Prerequisite, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value.split(",").map((v) => v.trim()) }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = await getToken();
      const method = editingPrereq ? "PUT" : "POST";
      const url = editingPrereq ? `/api/admin/prerequisites/${editingPrereq.id}` : "/api/admin/prerequisites";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error("Failed to save prerequisite");
      setShowForm(false);
      setEditingPrereq(null);
      setForm({});
      await fetchPrereqs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save prerequisite");
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded) return <div>Loading...</div>;
  if (loading) return <div>Loading prerequisites...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin: University Prerequisites Management</h1>
      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => {
          setEditingPrereq(null);
          setForm({});
          setShowForm(true);
        }}
      >
        Add Prerequisite
      </button>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Course Code</th>
            <th className="p-2 border">Course Title</th>
            <th className="p-2 border">Required Subjects</th>
            <th className="p-2 border">University</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {prereqs.map((prereq) => (
            <tr key={prereq.id} className="border-b">
              <td className="p-2 border">{prereq.strCourseCode}</td>
              <td className="p-2 border">{prereq.strCourseTitle}</td>
              <td className="p-2 border">{prereq.arrRequiredSubjects.join(", ")}</td>
              <td className="p-2 border">{prereq.strUniversity}</td>
              <td className="p-2 border">
                <button
                  className="mr-2 px-2 py-1 bg-yellow-500 text-white rounded"
                  onClick={() => handleEdit(prereq)}
                >
                  Edit
                </button>
                <button
                  className="px-2 py-1 bg-red-600 text-white rounded"
                  onClick={() => handleDelete(prereq.id)}
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
            <h2 className="text-xl font-bold mb-4">{editingPrereq ? "Edit Prerequisite" : "Add Prerequisite"}</h2>
            <label className="block mb-2">
              Course Code
              <input
                name="strCourseCode"
                value={form.strCourseCode || ""}
                onChange={handleFormChange}
                className="w-full border p-2 rounded"
                required
              />
            </label>
            <label className="block mb-2">
              Course Title
              <input
                name="strCourseTitle"
                value={form.strCourseTitle || ""}
                onChange={handleFormChange}
                className="w-full border p-2 rounded"
                required
              />
            </label>
            <label className="block mb-2">
              Required Subjects (comma separated)
              <input
                name="arrRequiredSubjects"
                value={form.arrRequiredSubjects ? form.arrRequiredSubjects.join(", ") : ""}
                onChange={(e) => handleFormArrayChange("arrRequiredSubjects", e.target.value)}
                className="w-full border p-2 rounded"
              />
            </label>
            <label className="block mb-2">
              University
              <input
                name="strUniversity"
                value={form.strUniversity || ""}
                onChange={handleFormChange}
                className="w-full border p-2 rounded"
                required
              />
            </label>
            <label className="block mb-2">
              Notes
              <textarea
                name="strNotes"
                value={form.strNotes || ""}
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
                  setEditingPrereq(null);
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