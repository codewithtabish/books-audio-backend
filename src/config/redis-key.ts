export const RedisKeys = {
  ALL_GENRES: "all_genres",
  ALL_AUTHORS: "all_authors",
  FEATURED_BOOKS: "featured_books",
  TRENDING_BOOKS: "trending_books",
  RECOMMENDED_BOOKS: (userId: string) => `recommended_books:${userId}`,
  USER_PROFILE: (clerkId: string) => `user_profile:${clerkId}`,
  CHAPTERS_BY_BOOK: (bookId: string) => `chapters_of_book:${bookId}`,
  BOOK_DETAIL: (bookId: string) => `book_detail:${bookId}`,
  GENRE_DETAIL: (id: string) => `genre_detail:${id}`, // ✅ New key
};
