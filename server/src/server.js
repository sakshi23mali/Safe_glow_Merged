import { createApp } from "./app.js";

const PORT = Number(process.env.PORT || 4000);

const app = await createApp();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

