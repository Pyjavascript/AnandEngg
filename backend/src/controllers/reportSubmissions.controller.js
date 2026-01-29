const Submission = require('../models/reportSubmission.model');

exports.approveByInspector = async (req, res) => {
  await Submission.approveByInspector(req.params.id);
  res.json({ message: 'Approved by Inspector' });
};

exports.rejectSubmission = async (req, res) => {
  await Submission.reject(req.params.id);
  res.json({ message: 'Submission rejected' });
};
