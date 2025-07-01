"use client";
import { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export interface Subject {
  id: string;
  title: string;
  description: string;
  atar_scaling: number;
  difficulty_rating: number;
  related_careers: string[];
  popularity_score: number;
  prerequisites: string[];
  recommended_subjects: string[];
  created_at?: string;
  updated_at?: string;
}

export default function AdminSubjectsPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [form, setForm] = useState<Partial<Subject>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
    }
  }, [isLoaded, user, router]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await fetch("/api/admin/subjects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch subjects");
      const data = await response.json();
      setSubjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch subjects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchSubjects();
  }, [user, fetchSubjects]);

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setForm(subject);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this subject?")) return;
    try {
      setSaving(true);
      const token = await getToken();
      const response = await fetch(`/api/admin/subjects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete subject");
      await fetchSubjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete subject");
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormArrayChange = (name: keyof Subject, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value.split(",").map((v) => v.trim()) }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = await getToken();
      const method = editingSubject ? "PUT" : "POST";
      const url = editingSubject ? `/api/admin/subjects/${editingSubject.id}` : "/api/admin/subjects";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          atar_scaling: Number(form.atar_scaling),
          difficulty_rating: Number(form.difficulty_rating),
        }),
      });
      if (!response.ok) throw new Error("Failed to save subject");
      setShowForm(false);
      setEditingSubject(null);
      setForm({});
      await fetchSubjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save subject");
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded) return <div>Loading...</div>;
  if (loading) return <div>Loading subjects...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin: Subject Management</h1>
      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => {
          setEditingSubject(null);
          setForm({});
          setShowForm(true);
        }}
      >
        Add Subject
      </button>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Title</th>
            <th className="p-2 border">Description</th>
            <th className="p-2 border">ATAR Scaling</th>
            <th className="p-2 border">Difficulty</th>
            <th className="p-2 border">Related Careers</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((subject) => (
            <tr key={subject.id} className="border-b">
              <td className="p-2 border">{subject.title}</td>
              <td className="p-2 border">{subject.description}</td>
              <td className="p-2 border">{subject.atar_scaling}</td>
              <td className="p-2 border">{subject.difficulty_rating}</td>
              <td className="p-2 border">{subject.related_careers.join(", ")}</td>
              <td className="p-2 border">
                <button
                  className="mr-2 px-2 py-1 bg-yellow-500 text-white rounded"
                  onClick={() => handleEdit(subject)}
                >
                  Edit
                </button>
                <button
                  className="px-2 py-1 bg-red-600 text-white rounded"
                  onClick={() => handleDelete(subject.id)}
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
            <h2 className="text-xl font-bold mb-4">{editingSubject ? "Edit Subject" : "Add Subject"}</h2>
            <label className="block mb-2">
              Title
              <input
                name="title"
                value={form.title || ""}
                onChange={handleFormChange}
                className="w-full border p-2 rounded"
                required
              />
            </label>
            <label className="block mb-2">
              Description
              <textarea
                name="description"
                value={form.description || ""}
                onChange={handleFormChange}
                className="w-full border p-2 rounded"
                required
              />
            </label>
            <label className="block mb-2">
              ATAR Scaling
              <input
                name="atar_scaling"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={form.atar_scaling || ""}
                onChange={handleFormChange}
                className="w-full border p-2 rounded"
                required
              />
            </label>
            <label className="block mb-2">
              Difficulty Rating
              <input
                name="difficulty_rating"
                type="number"
                min="1"
                max="5"
                value={form.difficulty_rating || ""}
                onChange={handleFormChange}
                className="w-full border p-2 rounded"
                required
              />
            </label>
            <label className="block mb-2">
              Related Careers (comma separated)
              <input
                name="related_careers"
                value={form.related_careers ? form.related_careers.join(", ") : ""}
                onChange={(e) => handleFormArrayChange("related_careers", e.target.value)}
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
                  setEditingSubject(null);
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