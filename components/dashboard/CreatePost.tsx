"use client";

import { useState, useRef } from "react";
import { ImagePlus, X, Send, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface Props {
  phone: string;
  onCreated?: () => void;
}

export default function CreatePost({ phone, onCreated }: Props) {
  const [mainDesc, setMainDesc] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [captions, setCaptions] = useState<string[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (selected: FileList | null) => {
    if (!selected) return;
    const newFiles = Array.from(selected).slice(0, 5 - files.length);
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setFiles((prev) => [...prev, ...newFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
    setCaptions((prev) => [...prev, ...newFiles.map(() => "")]);
  };

  const removeFile = (i: number) => {
    URL.revokeObjectURL(previews[i]);
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
    setCaptions((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!mainDesc.trim() && files.length === 0) {
      setError("Please write something or add a photo.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("phone", phone);
      if (mainDesc.trim()) fd.append("main_description", mainDesc.trim());
      files.forEach((f, i) => {
        fd.append("post_media[]", f);
        fd.append(`post_description${i + 1}`, captions[i] ?? "");
      });
      await api.post("/submit_post", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(true);
      setMainDesc("");
      setFiles([]);
      setPreviews([]);
      setCaptions([]);
      onCreated?.();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        "Failed to submit post.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-bold text-gray-900 mb-4">Create a Post</h2>

      {success && (
        <div className="flex items-center gap-2 text-sm text-blue-700 bg-green-50 border border-green-100 rounded-xl px-4 py-3 mb-4">
          <CheckCircle size={16} /> Post published successfully!
        </div>
      )}
      {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={mainDesc}
          onChange={(e) => setMainDesc(e.target.value)}
          placeholder="What's on your mind? Share an update, offer, or announcement…"
          rows={4}
          className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
        />

        {/* Image previews */}
        {previews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {previews.map((src, i) => (
              <div key={i} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="w-full h-32 object-cover rounded-xl" />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition"
                >
                  <X size={12} />
                </button>
                <input
                  value={captions[i]}
                  onChange={(e) => {
                    const c = [...captions];
                    c[i] = e.target.value;
                    setCaptions(c);
                  }}
                  placeholder="Caption (optional)"
                  className="mt-1 w-full text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300"
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* Hidden file input */}
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={files.length >= 5}
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus size={15} /> Add Photo
          </Button>
          <span className="text-xs text-gray-400">{files.length}/5 photos</span>

          <Button
            type="submit"
            disabled={submitting || (!mainDesc.trim() && files.length === 0)}
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
