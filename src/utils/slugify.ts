import { prisma } from "../lib/db";

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-') // Replace spaces and non-word chars with -
    .replace(/^-+|-+$/g, '');  // Remove leading/trailing dashes
}



export async function generateUniqueBookSlug(title: string): Promise<string> {
  let baseSlug = slugify(title);
  let slug = baseSlug;
  let count = 1;

  while (true) {
    const existing = await prisma.book.findUnique({ where: { slug } });
    if (!existing) break;
    count += 1;
    slug = `${baseSlug}-${count}`;
  }

  return slug;
}




/**
 * Generates a unique slug for a chapter based on its title.
 */
export async function generateUniqueChapterSlug(title: string): Promise<string> {
  let baseSlug = slugify(title);
  let slug = baseSlug;
  let count = 1;

  while (true) {
    const existing = await prisma.chapter.findUnique({ where: { slug } });
    if (!existing) break;
    count += 1;
    slug = `${baseSlug}-${count}`;
  }

  return slug;
}
