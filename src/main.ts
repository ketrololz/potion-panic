import { createApp } from "./app/createApp";
import "./style.css";

async function bootstrap() {
  const root = document.querySelector<HTMLDivElement>("#app");

  if (!root) {
    throw new Error("#app не найден");
  }

  const app = await createApp(root);

  if (import.meta.hot) {
    import.meta.hot.dispose(() => app.destroy());
  }
}

bootstrap().catch(console.error);
