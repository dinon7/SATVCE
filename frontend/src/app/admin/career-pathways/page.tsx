"use client";
import { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export interface CareerPathway {
  id: string;
  strCareerTitle: string;
  arrSubjectsRequired: string[];
  arrCoursesLinked: string[];
  strGrowthStats?: string;
  strIndustryField?: string;
  txtAIAdvice?: string;
  strAddedBy?: string;
  created_at?: string;
  updated_at?: string;
}

export default function AdminCareerPathwaysPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [pathways, setPathways] = useState<CareerPathway[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPathway, setEditingPathway] = useState<CareerPathway | null>(null);
  const [form, setForm] = useState<Partial<CareerPathway>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
    }
  }, [isLoaded, user, router]);

  const fetchPathways = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await fetch("/api/admin/career-pathways", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch career pathways");
      const data = await response.json();
      setPathways(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch career pathways");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchPathways();
  }, [user, fetchPathways]);

  const handleEdit = (pathway: CareerPathway) => {
    setEditingPathway(pathway);
    setForm(pathway);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this career pathway?")) return;
    try {
      setSaving(true);
      const token = await getToken();
      const response = await fetch(`/api/admin/career-pathways/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete career pathway");
      await fetchPathways();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete career pathway");
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormArrayChange = (name: keyof CareerPathway, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value.split(",").map((v) => v.trim()) }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = await getToken();
      const method = editingPathway ? "PUT" : "POST";
      const url = editingPathway ? `/api/admin/career-pathways/${editingPathway.id}` : "/api/admin/career-pathways";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error("Failed to save career pathway");
      setShowForm(false);
      setEditingPathway(null);
      setForm({});
      await fetchPathways();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save career pathway");
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded) return <div>Loading...</div>;
  if (loading) return <div>Loading career pathways...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin: Career Pathway Management</h1>
      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => {
          setEditingPathway(null);
          setForm({});
          setShowForm(true);
        }}
      >
        Add Career Pathway
      </button>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Career Title</th>
            <th className="p-2 border">Subjects Required</th>
            <th className="p-2 border">Courses Linked</th>
            <th className="p-2 border">Industry</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pathways.map((pathway) => (
            <tr key={pathway.id} className="border-b">
              <td className="p-2 border">{pathway.strCareerTitle}</td>
              <td className="p-2 border">{pathway.arrSubjectsRequired.join(", ")}</td>
              <td className="p-2 border">{pathway.arrCoursesLinked.join(", ")}</td>
              <td className="p-2 border">{pathway.strIndustryField || ""}</td>
              <td className="p-2 border">
                <button
                  className="mr-2 px-2 py-1 bg-yellow-500 text-white rounded"
                  onClick={() => handleEdit(pathway)}
                >
                  Edit
                </button>
                <button
                  className="px-2 py-1 bg-red-600 text-white rounded"
                  onClick={() => handleDelete(pathway.id)}
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
            <h2 className="text-xl font-bold mb-4">{editingPathway ? "Edit Career Pathway" : "Add Career Pathway"}</h2>
            <label className="block mb-2">
              Career Title
              <input
                name="strCareerTitle"
                value={form.strCareerTitle || ""}
                onChange={handleFormChange}
                className="w-full border p-2 rounded"
                required
              />
            </label>
            <label className="block mb-2">
              Subjects Required (comma separated)
              <input
                name="arrSubjectsRequired"
                value={form.arrSubjectsRequired ? form.arrSubjectsRequired.join(", ") : ""}
                onChange={(e) => handleFormArrayChange("arrSubjectsRequired", e.target.value)}
                className="w-full border p-2 rounded"
              />
            </label>
            <label className="block mb-2">
              Courses Linked (comma separated)
              <input
                name="arrCoursesLinked"
                value={form.arrCoursesLinked ? form.arrCoursesLinked.join(", ") : ""}
                onChange={(e) => handleFormArrayChange("arrCoursesLinked", e.target.value)}
                className="w-full border p-2 rounded"
              />
            </label>
            <label className="block mb-2">
              Industry Field
              <input
                name="strIndustryField"
                value={form.strIndustryField || ""}
                onChange={handleFormChange}
                className="w-full border p-2 rounded"
              />
            </label>
            <label className="block mb-2">
              Growth Stats
              <input
                name="strGrowthStats"
                value={form.strGrowthStats || ""}
                onChange={handleFormChange}
                className="w-full border p-2 rounded"
              />
            </label>
            <label className="block mb-2">
              AI Advice
              <textarea
                name="txtAIAdvice"
                value={form.txtAIAdvice || ""}
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
                  setEditingPathway(null);
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