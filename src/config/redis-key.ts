export const RedisKeys = {
  ALL_GENRES: "all_genres",
  ALL_AUTHORS: "all_authors",

  // 📚 Book-related
  FEATURED_BOOKS: "featured_books",
  TRENDING_BOOKS: "trending_books",
  ALL_BOOKS: "all_books",
  BOOK_DETAIL: (bookId: string) => `book_detail:${bookId}`,
  BOOKS_BY_GENRE: (genreId: string) => `books_by_genre:${genreId}`,
  BOOKS_BY_AUTHOR: (authorId: string) => `books_by_author:${authorId}`,
  BOOK_DETAIL_BY_SLUG: (slug: string) => `book_detail_slug:${slug}`,


  // 👤 User-specific
  RECOMMENDED_BOOKS: (userId: string) => `recommended_books:${userId}`,
  USER_PROFILE: (clerkId: string) => `user_profile:${clerkId}`,

  // 📖 Chapters
  CHAPTERS_BY_BOOK: (bookId: string) => `chapters_of_book:${bookId}`,

  // 🔍 Other Details
  GENRE_DETAIL: (id: string) => `genre_detail:${id}`,
  AUTHOR_DETAIL: (id: string) => `author_detail:${id}`,
};
