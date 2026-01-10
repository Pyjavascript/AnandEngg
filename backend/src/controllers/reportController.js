// const Report = require("../models/reportModel");
// router.post('/create', auth, async (req, res) => {

// const CreateReport = async (req, res) => {
//   // console.log('REQ.USER =>', req.user);
//   // const userId = req.user.id;
//   return res.json({
//   userFromToken: req.user
// });


//   // await Report.create({
//   //   user_id: userId,
//   //   title: req.body.partDescription,
//   //   part_no: req.body.partNumber,
//   //   report_type: req.body.reportType,
//   //   report_data: req.body,
//   // });

//   // res.json({ message: "Report created" });
// };
// const CreateReport = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     await Report.create({
//       user_id: userId,
//       title: req.body.partDescription,
//       part_no: req.body.partNumber,
//       report_type: req.body.reportType,
//       report_data: req.body, // Remove JSON.stringify here
//     });
//     res.json({ message: 'Report created',userId,title: req.body.partDescription,
//       part_no: req.body.partNumber,
//       report_type: req.body.reportType,
//       report_data: req.body });
//   } catch (err) {
//     console.error('CREATE REPORT ERROR:', err);
//     res.status(500).json({ message: err.message });
//   }
// };
// const CreateReport = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     console.log('USER ID FROM TOKEN:', req.user.id);
//     await Report.create({
//       user_id: userId,
//       title: req.body.partDescription,
//       part_no: req.body.partNumber,
//       report_type: req.body.reportType,
//       report_data: JSON.stringify(req.body), // ✅ REQUIRED
//     });

//     res.status(201).json({
//       message: 'Report created successfully',
//       user_id: userId,
//     });
//   } catch (err) {
//     console.error('CREATE REPORT ERROR:', err);
//     res.status(500).json({ message: err.message });
//   }
// };



// // router.get('/my-reports', auth, async (req, res) => {
// const GetReport = async (req, res) => {
//   const reports = await Report.findByUser(req.user.id);
//   res.json(reports);
// };

// module.exports = { CreateReport, GetReport };

const Report = require('../models/reportModel');

exports.CreateReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await Report.create({
      user_id: userId,
      title: req.body.partDescription,
      part_no: req.body.partNumber,
      report_type: req.body.reportType,
      report_data: req.body,
    });

    res.status(201).json({ message: 'Report created', reportId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.GetReports = async (req, res) => {
  try {
    const { role, id } = req.user;
    const reports = await Report.findByRole(role, id);
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.ApproveByInspector = async (req, res) => {
  try {
    await Report.approveByInspector(req.params.id);
    res.json({ message: 'Approved by Inspector → sent to Manager' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.ApproveByManager = async (req, res) => {
  try {
    await Report.approveByManager(req.params.id);
    res.json({ message: 'Approved by Manager → Final Approved' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.RejectReport = async (req, res) => {
  try {
    await Report.rejectReport(req.params.id);
    res.json({ message: 'Report rejected' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.GetReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // 🔒 Optional ownership check (recommended)
    if (
      req.user.role === 'machine_operator' &&
      report.user_id !== req.user.id
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
