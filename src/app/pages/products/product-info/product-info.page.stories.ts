import { Meta, StoryObj, applicationConfig } from "@storybook/angular";
import { provideMockHttpResults } from ".storybook/utils/mock-http";
import { Product } from "src/app/core/http/products/products-in-category.get";
import { faker } from "@faker-js/faker";
import { ProductInfoPageStory } from "./product-info.page.story";

export default {
  title: "Pages/Products/Product Info",
  component: ProductInfoPageStory
} as Meta<ProductInfoPageStory>;

export const Default: StoryObj<ProductInfoPageStory> = {}

Default.decorators = [
  applicationConfig({
    providers: [
      provideMockHttpResults({
        "GetProductsInCategory": [
          {
            imgPath: "InstaSim Duck Mug.webp",
            productId: 1,
            category: {
              categoryId: 1,
              description: "",
              slug: ""
            },
            name: faker.lorem.words(),
            description: faker.lorem.paragraph(),
            price: 9.99,
            slug: ""
          }
        ] as Product[]
      })
    ]
  })
]

Default.args = {
  cart: [],
  categoryId: 1,
  productId: 1
}