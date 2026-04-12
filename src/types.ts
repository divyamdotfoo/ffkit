export type Category = "image" | "audio" | "video";

export interface CommandDescriptor {
  id: string;
  category: Category;
  name: string;
  description: string;
}
