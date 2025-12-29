const Report = require("../models/reportModel");
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
const CreateReport = async (req, res) => {
  try {
    const userId = req.user.id;
    await Report.create({
      user_id: userId,
      title: req.body.partDescription,
      part_no: req.body.partNumber,
      report_type: req.body.reportType,
      report_data: req.body, // Remove JSON.stringify here
    });
    res.json({ message: 'Report created',userId,title: req.body.partDescription,
      part_no: req.body.partNumber,
      report_type: req.body.reportType,
      report_data: req.body });
  } catch (err) {
    console.error('CREATE REPORT ERROR:', err);
    res.status(500).json({ message: err.message });
  }
};


// router.get('/my-reports', auth, async (req, res) => {
const GetReport = async (req, res) => {
  const reports = await Report.findByUser(req.user.id);
  res.json(reports);
};

module.exports = { CreateReport, GetReport };
