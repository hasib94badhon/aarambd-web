export interface User {
  user_id: string;
  name: string;
  phone: string;
  description: string;
  cat_id: number;
  cat_name?: string;
  photo: string;
  location?: string;
  user_viewed?: number;
  user_called?: number;
  user_shared?: number;
  call_status?: number;
  subscription_type?: string;
  nid?: string;
  tin?: string;
}

export interface Post {
  post_id: string;
  post_description: string;
  post_media: string[];
  post_time: string;
  post_viewed: number;
  post_comments: number;
  main_description?: string;
  name?: string;
  phone?: string;
  cat_name?: string;
  user_id?: string;
}

// Feed post shape returned by /get_today_post
export interface FeedPost {
  post_id: number;
  name: string;
  phone: string;
  user_photo?: string;
  category: string;
  photo_description: string;
  photo: string;
  view: number;
  time: string;
  comment_count: number;
  user_id: number;
  main_description: string;
}

export interface FeedComment {
  com_id: number;
  com_text: string;
  com_time: string;
  user_id: number;
  photo: string;
  commenter_name: string;
}

export interface Category {
  cat_id: number;
  cat_name: string;
  yes_service: number;
  yes_shop: number;
  cat_logo?: string;
  count?: number;
}

export interface Review {
  review_id: number;
  reviewer_id: number;
  reviewer_name: string;
  reviewer_photo?: string;
  rating: "good" | "bad";
  comment: string;
  created_at: string;
}

export interface AuthUser {
  user_id: number;
  reg_id: number;
  name: string;
  phone: string;
}
