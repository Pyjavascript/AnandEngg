// const express = require('express');
// const router = express.Router();
// const auth = require("../middleware/auth");
// const multer = require('multer');
// const path = require('path');
// const ReportController = require('../controllers/reportController');

// const storage = multer.diskStorage({
// 	destination: function (req, file, cb) {
// 		cb(null, path.join(__dirname, '../../uploads/diagrams'));
// 	},
// 	filename: function (req, file, cb) {
// 		const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
// 		cb(null, unique + path.extname(file.originalname));
// 	}
// });
// const upload = multer({ storage });

// // Categories
// router.post('/categories', auth, ReportController.CreateCategory);
// router.get('/categories', auth, ReportController.GetCategories);
// router.delete('/categories/:id', auth, ReportController.DeleteCategory);

// // Templates and fields (admin)
// router.post('/templates', auth, ReportController.CreateTemplate);
// router.post('/templates/:id/diagram', auth, upload.single('diagram'), ReportController.UploadDiagram);
// router.post('/templates/:id/fields', auth, ReportController.CreateField);
// router.get('/templates/:id', auth, ReportController.GetTemplateById);
// router.get('/templates-with-parts', auth, ReportController.GetAllTemplatesWithParts);


// // Submissions (employee)
// router.post('/submissions', auth, ReportController.CreateSubmission);
// // router.post('/create', auth, ReportController.CreateInspectionReport);
// router.get('/submissions', auth, ReportController.ListSubmissions);
// router.get('/submissions/:id', auth, ReportController.GetSubmissionById);
// // router.get('/reports-all', auth, ReportController.GetAllInjectionReports);
// // router.get('/reports-stats', auth, ReportController.GetReportTypesWithStats);

// // Reviewer actions
// router.put('/submissions/:id/inspect', auth, ReportController.InspectorReview);
// router.put('/submissions/:id/manager', auth, ReportController.ManagerReview);
// router.put('/submissions/:id/reject', auth, ReportController.RejectSubmission);

// module.exports = router;


const express = require('express');
const router = express.Router();
const auth = require("../middleware/auth");
const multer = require('multer');
const path = require('path');
const ReportController = require('../controllers/reportController');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, '../../uploads/diagrams'));
	},
	filename: function (req, file, cb) {
		const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
		cb(null, unique + path.extname(file.originalname));
	}
});
const upload = multer({ storage });

// Categories
router.post('/categories', auth, ReportController.CreateCategory);
router.get('/categories', auth, ReportController.GetCategories);
router.delete('/categories/:id', auth, ReportController.DeleteCategory);

// Templates and fields (admin)
router.post('/templates', auth, ReportController.CreateTemplate);
router.post('/templates/:id/diagram', auth, upload.single('diagram'), ReportController.UploadDiagram);
router.post('/templates/:id/fields', auth, ReportController.CreateField);
router.get('/templates/:id', auth, ReportController.GetTemplateById);
router.get('/templates-with-parts', auth, ReportController.GetAllTemplatesWithParts);


// Submissions (employee)
router.post('/submissions', auth, ReportController.CreateSubmission);
// router.post('/create', auth, ReportController.CreateInspectionReport);
router.get('/submissions', auth, ReportController.ListSubmissions);
router.get('/submissions/:id', auth, ReportController.GetSubmissionById);
// router.get('/reports-all', auth, ReportController.GetAllInjectionReports);
// router.get('/reports-stats', auth, ReportController.GetReportTypesWithStats);

// Reviewer actions
router.put('/submissions/:id/inspect', auth, ReportController.InspectorReview);
router.put('/submissions/:id/manager', auth, ReportController.ManagerReview);
router.put('/submissions/:id/reject', auth, ReportController.RejectSubmission);

module.exports = router;
