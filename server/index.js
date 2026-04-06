import { app, server } from "./config/server.js";
import { registerRoutes } from "./routes/index.js";
import { registerSocket } from "./socket/index.js";

const PORT = process.env.PORT || 3001;

registerRoutes(app);
registerSocket(server);

server.listen(PORT, () => console.log(`[Server] Running on :${PORT}`));
