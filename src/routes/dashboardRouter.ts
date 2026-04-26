import { Router } from "express";
import DashboardController from "../controllers/DashboardController.js";
import DashboardService from "../services/DashboardService.js";

const dashboardRouter = Router();

const dashboardService = new DashboardService();
const dashboardController = new DashboardController(dashboardService);

dashboardRouter.get("/dashboard", (req, res) => dashboardController.getDashboardData(req, res));

export default dashboardRouter;
