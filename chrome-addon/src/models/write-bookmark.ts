import * as z from "valibot"

export const WriteBookmarkRequestSchema = z.object({
  bookmark: z.optional(
    z.object({
      id: z.string(),
      title: z.optional(z.string()),
      url: z.optional(z.string()),
      folderPath: z.optional(z.string()),
    })
  ),
  newBookmark: z.optional(
    z.object({
      folderPath: z.optional(
        z.pipe(z.string(), z.startsWith("/"), z.endsWith("/"))
      ),
      title: z.string(),
      url: z.string(),
    })
  ),
})
export type WriteBookmarkRequest = z.InferInput<
  typeof WriteBookmarkRequestSchema
>

export enum WriteBookmarkRequestType {
  Update,
  Create,
  Delete,
}

export type ValidatedBookmarkCreateRequest = {
  type: WriteBookmarkRequestType.Create
  folderPath?: string
  title: string
  url: string
}
export type ValidatedBookmarkUpdateRequest = {
  type: WriteBookmarkRequestType.Update
  id: string
  folderPath?: string
  title?: string
  url?: string
}
export type ValidatedBookmarkDeleteRequest = {
  type: WriteBookmarkRequestType.Delete
  id: string
}
