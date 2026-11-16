"use client";

import { useState, useRef } from "react";
import { Eye, MessageCircle, Clock, Trash2, Loader2, Pencil, X, ImagePlus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface PostItem {
  post_id: string;
  post_description: string;
  post_media: string[];
  post_time: string;
  post_viewed: number;
  post_comments: number;
  main_description?: string;
}

interface Props {
  posts: PostItem[];
  hasMore: boolean;
  onLoadMore: () => void;
  loadingMore: boolean;
  onDeleted: (postId: string) => void;
  onEdited: (postId: string, newMainDesc: string) => void;
}

export default function MyPosts({ posts, hasMore, onLoadMore, loadingMore, onDeleted, onEdited }: Props) {
  if (posts.length === 0 && !loadingMore) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">📭</div>
        <p className="text-gray-500 font-medium">No posts yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Create your first post using the &ldquo;+ New Post&rdquo; tab above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostRow key={post.post_id} post={post} onDeleted={onDeleted} onEdited={onEdited} />
      ))}

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={onLoadMore} disabled={loadingMore} className="gap-2 px-8">
            {loadingMore ? <Loader2 size={14} className="animate-spin" /> : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}

function PostRow({
  post,
  onDeleted,
  onEdited,
}: {
  post: PostItem;
  onDeleted: (id: string) => void;
  onEdited: (id: string, newMainDesc: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editDesc, setEditDesc] = useState(post.main_description ?? "");
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const img = post.post_media?.[0];
  const timeShort = post.post_time?.split(" ").slice(1, 4).join(" ") ?? "";

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.post("/delete_post", { post_id: post.post_id });
      onDeleted(post.post_id);
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleAddFiles = (fl: FileList | null) => {
    if (!fl) return;
    const added = Array.from(fl).slice(0, 5 - newFiles.length);
    setNewFiles((p) => [...p, ...added]);
    setNewPreviews((p) => [...p, ...added.map((f) => URL.createObjectURL(f))]);
  };

  const removeNewFile = (i: number) => {
    URL.revokeObjectURL(newPreviews[i]);
    setNewFiles((p) => p.filter((_, idx) => idx !== i));
    setNewPreviews((p) => p.filter((_, idx) => idx !== i));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const fd = new FormData();
      fd.append("post_id", post.post_id);
      fd.append("main_description", editDesc.trim());
      newFiles.forEach((f, i) => {
        fd.append("post_media[]", f);
        fd.append(`post_description${i + 1}`, "");
      });
      await api.post("/edit_post", fd, { headers: { "Content-Type": "multipart/form-data" } });
      onEdited(post.post_id, editDesc.trim());
      setEditing(false);
      setNewFiles([]);
      setNewPreviews([]);
    } catch {
      setSaveError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id={`post-${post.post_id}`} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden scroll-mt-24">
      {/* Picture, big, on top */}
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt="post" className="w-full h-64 sm:h-80 object-cover" />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
          <span className="text-4xl opacity-30">📝</span>
        </div>
      )}

      {/* Text, below */}
      <div className="p-4 flex flex-col gap-2 min-w-0">
          {!editing ? (
            <>
              {post.main_description && (
                <p className="font-semibold text-gray-900 text-sm leading-snug">
                  {post.main_description}
                </p>
              )}
              <p className="text-sm text-gray-600 leading-relaxed">{post.post_description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-400 pt-3 mt-1 border-t border-gray-50">
                <span className="flex items-center gap-1"><Clock size={10} /> {timeShort}</span>
                <span className="flex items-center gap-1"><Eye size={10} /> {post.post_viewed}</span>
                <span className="flex items-center gap-1"><MessageCircle size={10} /> {post.post_comments}</span>
                <button
                  onClick={() => { setEditing(true); setSaveError(""); }}
                  className="ml-auto flex items-center gap-1 text-gray-400 hover:text-[#6C78DF] transition"
                  title="Edit post"
                >
                  <Pencil size={13} />
                </button>
                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition"
                    title="Delete post"
                  >
                    <Trash2 size={13} />
                  </button>
                ) : (
                  <span className="flex items-center gap-2">
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="text-xs bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 disabled:opacity-60"
                    >
                      {deleting ? <Loader2 size={10} className="animate-spin" /> : null}
                      Delete
                    </button>
                    <button onClick={() => setConfirmDelete(false)} className="text-gray-400 hover:text-gray-600">
                      Cancel
                    </button>
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-2 py-1">
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={3}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#6C78DF]/40"
                placeholder="Main description…"
                autoFocus
              />
              {/* New image previews */}
              {newPreviews.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {newPreviews.map((src, i) => (
                    <div key={i} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="w-16 h-16 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeNewFile(i)}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {saveError && <p className="text-xs text-red-500">{saveError}</p>}
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleAddFiles(e.target.files)}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={newFiles.length >= 5}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#6C78DF] transition"
                >
                  <ImagePlus size={13} /> Add photo
                </button>
                <div className="ml-auto flex gap-2">
                  <button
                    onClick={() => { setEditing(false); setSaveError(""); }}
                    className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded-lg border border-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="text-xs bg-[#6C78DF] hover:bg-[#5A64D4] text-white px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 disabled:opacity-60"
                  >
                    {saving ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
