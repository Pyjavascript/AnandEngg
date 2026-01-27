const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const ReportController = require("../controllers/reportController");
const requireRole = require('../middleware/requireRole')

router.post("/create", auth, ReportController.CreateReport);
router.get("/my-reports", auth, ReportController.GetReports);
// router.put('/approve/inspector/:id', auth, ReportController.ApproveByInspector);
// router.put('/approve/manager/:id', auth, ReportController.ApproveByManager);
router.put(
  "/approve/inspector/:id",
  auth,
  requireRole(["quality_inspector"]),
  ReportController.ApproveByInspector,
);

router.put(
  "/approve/manager/:id",
  auth,
  requireRole(["quality_manager"]),
  ReportController.ApproveByManager,
);

router.put("/reject/:id", auth, ReportController.RejectReport);
router.get("/:id", auth, ReportController.GetReportById);

module.exports = router;
