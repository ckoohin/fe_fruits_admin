export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface CreateTagRequest {
  name: string;
  slug: string;
}

export interface UpdateTagRequest {
  name?: string;
}