import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import setupDB from "./config/setup";
import swaggerSpec from "./config/swaggerConfig";
import userRoutes from "./routes/userRoutes";
import membershipRoutes from "./routes/membershipRoutes";
import squadRoutes from "./routes/squadRoutes";
import swaggerUi from "swagger-ui-express";

setupDB(); // Ensure database is ready before starting the server

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/users", userRoutes);
app.use("/api/memberships", membershipRoutes);
app.use("/api/squads", squadRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

//  npx ts-node src/server.ts 