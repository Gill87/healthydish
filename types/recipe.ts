export type Ingredient = {
  item: string;
  amount: string;
};

export type Recipe = {
  title: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: string;
  ingredients: Ingredient[];
  instructions: string[];
  tips: string[];
};
