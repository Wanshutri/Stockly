import express from "express";

const app = express();

app.use(express.json());

// Rutas
//app.use("/api/users", userRoutes); EJEMPLO

export default app;
