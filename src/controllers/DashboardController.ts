import type { Request, Response } from "express";
import DashboardService from "../services/DashboardService.js";

export default class DashboardController {
    private dashboardService: DashboardService;

    constructor(dashboardService: DashboardService) {
        this.dashboardService = dashboardService;
    }

    public async getDashboardData(req: Request, res: Response) {
        const data = await this.dashboardService.getDashboardData();
        res.status(200).json(data);
    }
}
