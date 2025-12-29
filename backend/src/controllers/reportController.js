const Report = require("../models/reportModel");
// router.post('/create', auth, async (req, res) => {

const CreateReport = async (req, res) => {
  const userId = req.user.id;

  await Report.create({
    user_id: userId,
    title: req.body.partDescription,
    part_no: req.body.partNumber,
    report_type: req.body.reportType,
    report_data: req.body,
  });

  res.json({ message: "Report created" });
};

// router.get('/my-reports', auth, async (req, res) => {
const GetReport = async (req, res) => {
  const reports = await Report.findByUser(req.user.id);
  res.json(reports);
};

module.exports = { CreateReport, GetReport };
