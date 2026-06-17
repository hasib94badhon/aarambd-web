"use client";

import { useState, useEffect, useRef } from "react";
import { ImagePlus, X, Send, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface DesCategory {
  des_cat_id: number;
  des_cat_name: string;
}

interface Props {
  userId: string;
}

export default function CreateThought({ userId }: Props) {
  const [categories, setCategories] = useState<DesCategory[]>([]);
  const [desCatId, setDesCatId] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api
      .get("/get_description_categories")
      .then((r) => {
        const cats: DesCategory[] = r.data.categories ?? [];
        setCategories(cats);
        if (cats.length > 0) setDesCatId(String(cats[0].des_cat_id));
      })
      .catch(() => {});
  }, []);

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const removeFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
  };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!description.trim() || !desCatId) {
      setError("Please write something and pick a category.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("user_id", userId);
      fd.append("description", description.trim());
      fd.append("des_cat_id", desCatId);
      if (file) fd.append("des_photo", file);
      await api.post("/update_user_description", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(true);
      setDescription("");
      setFile(null);
      setPreview(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to submit thought.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-bold text-gray-900 mb-4">Share a Thought or Need</h2>

      {success && (
        <div className="flex items-center gap-2 text-sm text-blue-700 bg-green-50 border border-green-100 rounded-xl px-4 py-3 mb-4">
          <CheckCircle size={16} /> Thought published!
        </div>
      )}
      {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
          <select
            value={desCatId}
            onChange={(e) => setDesCatId(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          >
            {categories.map((c) => (
              <option key={c.des_cat_id} value={String(c.des_cat_id)}>
                {c.des_cat_name}
              </option>
            ))}
          </select>
        </div>

        {/* Text */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what you're looking for or share a thought with the community…"
          rows={4}
          className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
        />

        {/* Image preview */}
        {preview && (
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="" className="h-36 rounded-xl object-cover" />
            <button
              type="button"
              onClick={removeFile}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition"
            >
              <X size={12} />
            </button>
          </div>
        )}

        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={!!file}
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus size={15} /> Add Photo
          </Button>

          <Button
            type="submit"
            disabled={submitting || !description.trim()}
            className="ml-auto bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Publish
          </Button>
        </div>
      </form>
    </div>
  );
}
