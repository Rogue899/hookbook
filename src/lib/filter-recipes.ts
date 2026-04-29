export type RecipeRow = {
  slug: string;
  title: string;
  category: string;
  event: string;
  trust: string;
  description: string;
};

export type Filters = {
  category?: string;
  trust?: string;
  event?: string;
  query?: string;
};

export function filterRecipes(recipes: RecipeRow[], f: Filters): RecipeRow[] {
  return recipes.filter((r) => {
    if (f.category && f.category !== 'all' && r.category !== f.category) return false;
    if (f.trust && f.trust !== 'all' && r.trust !== f.trust) return false;
    if (f.event && f.event !== 'all' && r.event !== f.event) return false;
    if (f.query && f.query.trim()) {
      const q = f.query.trim().toLowerCase();
      if (!r.title.toLowerCase().includes(q) && !r.description.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}
