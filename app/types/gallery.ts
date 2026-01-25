export type GalleryItem = {
  id: string;
  createdAt: string;
  roomType?: string;
  style?: string;
  prompt?: string;
  thumbUrl: string;
  imageUrl: string;
  isFavorite?: boolean;
};
