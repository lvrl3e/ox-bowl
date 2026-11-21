/** Public URL for a file in a public Supabase Storage bucket (e.g. "assets"). */
export function publicStorageUrl(bucket: string, path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}
