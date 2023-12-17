import { Meta, StoryObj } from "@storybook/angular";
import { CartPageStory } from "./cart.page.story";

export default {
  title: 'Pages/Cart',
  component: CartPageStory,
} as Meta<CartPageStory>

export const Default: StoryObj<CartPageStory> = {}

Default.args = {
  items: [
    {
      product: {
        "imgPath": "InstaSim Duck Mug.webp",
        "category": {
            "categoryId": 3,
            "description": "Mugs",
            "slug": "mugs"
        },
        "productId": 1,
        "name": "InstaSim Duck Mug",
        "description": "Mug with the InstaSim Duck Emote&#13;&#13;\rMug Size: 11oz",
        "slug": "instasim-duck-mug",
        "price": 6.99,
      },
      quantity: 5
    }
  ]
}