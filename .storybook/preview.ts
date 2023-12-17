import { provideRouter } from "@angular/router";
import { applicationConfig, type Preview } from "@storybook/angular";
import { routes } from "src/routes";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    applicationConfig({
      providers: [
        provideRouter(routes)
      ]
    })
  ]
};

export default preview;
