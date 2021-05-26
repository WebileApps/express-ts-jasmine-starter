import { createDeafultUser } from "./admin/module";

const app = require("./app");

const PORT = process.env.PORT || 4200;
createDeafultUser();

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
