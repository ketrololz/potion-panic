export const INGREDIENTS = [
  {
    id: "leaf",
    textureUrl: "/assets/ingredients/leaf.webp",
  },
  {
    id: "flower",
    textureUrl: "/assets/ingredients/flower.webp",
  },
  {
    id: "crystal",
    textureUrl: "/assets/ingredients/crystal.webp",
  },
  {
    id: "blueberry",
    textureUrl: "/assets/ingredients/blueberry.webp",
  },
  {
    id: "pomegranate",
    textureUrl: "/assets/ingredients/pomegranate.webp",
  },
  {
    id: "mushroom",
    textureUrl: "/assets/ingredients/mushroom.webp",
  },
] as const;

export const INGREDIENTS_NAME = INGREDIENTS.map(({ id }) => {
  return id;
});
