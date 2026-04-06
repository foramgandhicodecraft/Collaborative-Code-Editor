import uploadRouter    from "./upload.js";
import roomsRouter     from "./rooms.js";
import outputRouter    from "./output.js";
import aiRouter        from "./ai.js";

export function registerRoutes(app) {
  app.use(uploadRouter);
  app.use(roomsRouter);
  app.use(outputRouter);
  app.use(aiRouter);
}
