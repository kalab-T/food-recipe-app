export interface BookmarkWithRecipe {
    id: string
    recipe: {
      id: string
      title: string
      description: string
      image: string
      user?: {
        id: string
        name: string
      }
      likes_aggregate?: {
        aggregate: {
          count: number
        }
      }
      bookmarks_aggregate?: {
        aggregate: {
          count: number
        }
      }
    }
  }
  