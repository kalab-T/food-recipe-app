import gql from 'graphql-tag'

export const ADD_FULL_RECIPE = gql`
  mutation AddFullRecipe(
    $title: String!
    $description: String!
    $image: String!
    $ingredients: [ingredients_insert_input!]!
    $steps: [steps_insert_input!]!
    $recipe_categories: [recipe_categories_insert_input!]!
  ) {
    insert_recipes_one(
      object: {
        title: $title
        description: $description
        image: $image
        ingredients: { data: $ingredients }
        steps: { data: $steps }
        recipe_categories: { data: $recipe_categories }
      }
    ) {
      id
      title
    }
  }
`

export const UPDATE_RECIPE = gql`
  mutation UpdateRecipe(
    $id: uuid!
    $title: String!
    $description: String!
    $image: String
    $ingredients: [ingredients_insert_input!]!
    $steps: [steps_insert_input!]!
    $recipe_categories: [recipe_categories_insert_input!]!
  ) {
    delete_ingredients(where: { recipe_id: { _eq: $id } }) {
      affected_rows
    }
    delete_steps(where: { recipe_id: { _eq: $id } }) {
      affected_rows
    }
    delete_recipe_categories(where: { recipe_id: { _eq: $id } }) {
      affected_rows
    }
    update_recipes_by_pk(
      pk_columns: { id: $id }
      _set: {
        title: $title
        description: $description
        image: $image
      }
    ) {
      id
    }
    insert_ingredients(objects: $ingredients) {
      affected_rows
    }
    insert_steps(objects: $steps) {
      affected_rows
    }
    insert_recipe_categories(objects: $recipe_categories) {
      affected_rows
    }
  }
`
export const DELETE_RECIPE = gql`
  mutation DeleteRecipe($id: uuid!) {
    delete_recipes_by_pk(id: $id) {
      id
    }
  }
`
export const ADD_BOOKMARK = gql`
  mutation AddBookmark($recipe_id: uuid!, $user_id: uuid!) {
    insert_bookmarks_one(object: { recipe_id: $recipe_id, user_id: $user_id }) {
      id
    }
  }
`;

export const REMOVE_BOOKMARK = gql`
  mutation RemoveBookmark($recipe_id: uuid!, $user_id: uuid!) {
    delete_bookmarks(
      where: { recipe_id: { _eq: $recipe_id }, user_id: { _eq: $user_id } }
    ) {
      affected_rows
    }
  }
`;


