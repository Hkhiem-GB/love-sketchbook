export interface PhotoItem {
  id: string;
  url: string;
  caption?: string;
  rotation?: number; // slight hand-pasted rotation angle in degrees (-4 to 4)
  file?: File; // temporary for upload
}

export interface GiftData {
  id: string;
  slug: string;
  recipient_name: string;
  sender_name: string;
  opening_message?: string;
  messages: string[];
  closing_message?: string;
  photos: PhotoItem[];
  created_at?: string;
  theme_color?: string;
}

export type ExperienceStep = 'game' | 'messages' | 'tree';
