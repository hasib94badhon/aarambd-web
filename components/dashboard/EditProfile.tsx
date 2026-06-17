"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, CheckCircle, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { Category } from "@/lib/types";

interface Props {
  phone: string;
  initialName: string;
  initialDescription: string;
  initialCatId: number;
  initialPhoto?: string;
}

export default function EditProfile({ phone, initialName, initialDescription, initialCatId, initialPhoto }: Props) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [catId, setCatId] = useState(String(initialCatId));
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api
      .get("/category/get_categories_name")
      .then((r) => setCategories(r.data.categories ?? []))
      .catch(() => {});
  }, []);

  const handlePhotoChange = (f: File | null) => {
    if (!f) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  const removePhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    const formData = new FormData();
    formData.append("phone", phone);
    formData.append("name", name);
    formData.append("description", description);
    formData.append("cat_id", catId);
    if (photoFile) formData.append("images[0]", photoFile);

    try {
      await api.post("/update_user_profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(true);
      removePhoto();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to update profile.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const currentPhotoSrc = photoPreview ?? (initialPhoto ? initialPhoto.split(",")[0] : null);

  return (
    <div className="max-w-lg">
      <p className="text-sm text-gray-500 mb-6">
        Update your public profile information.
      </p>

      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 bg-green-50 border border-green-200 text-blue-700 text-sm rounded-lg px-4 py-3 flex items-center gap-2">
          <CheckCircle size={16} /> Profile updated successfully
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Profile photo */}
        <div className="space-y-1.5">
          <Label>Profile Photo</Label>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex-shrink-0">
              {currentPhotoSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={currentPhotoSrc} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl bg-green-50">👤</div>
              )}
              {photoPreview && (
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                >
                  <X size={10} />
                </button>
              )}
            </div>
            <div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePhotoChange(e.target.files?.[0] ?? null)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => photoInputRef.current?.click()}
              >
                <Camera size={14} /> Change Photo
              </Button>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</p>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Business Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your business or services…"
            rows={4}
            className="resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={catId}
            onChange={(e) => setCatId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.cat_id} value={c.cat_id}>
                {c.cat_name}
              </option>
            ))}
          </select>
        </div>

        <Button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : null}
          Save Changes
        </Button>
      </form>
    </div>
  );
}
