import { Router } from "express";
import multer from "multer";
import multerConfig from "./config/multer";

import UserController from "./app/controllers/UserController";
import SessionController from "./app/controllers/SessionController";
import FileController from "./app/controllers/FileController";
import ChangePasswordController from "./app/controllers/ChangePasswordController";

import authMiddleware from "./app/middlewares/auth";

const routes = new Router();
const upload = multer(multerConfig);

routes.post("/users", UserController.store);
routes.post("/sessions", SessionController.store);

routes.put("/passwords", ChangePasswordController.update);

routes.use(authMiddleware);

routes.put("/users", UserController.update);
routes.get("/users", UserController.index);
routes.post("/users/like/:id", UserController.like);

routes.post("/files", upload.single("file"), FileController.store);

export default routes;
