const categoryModel = require('../models/categoryModel');
const templateModel = require('../models/templateModel');
const submissionModel = require('../models/submissionModel');
const path = require('path');

function requireRole(user, roleName) {
  return user && user.role === roleName;
}

exports.CreateCategory = async (req, res) => {
  if (!requireRole(req.user, 'admin')) return res.status(403).json({ message: 'Admin only' });
  try {
    const name = req.body.name;
    if (!name) return res.status(400).json({ message: 'Name required' });
    const result = await categoryModel.create(name);
    res.status(201).json({ message: 'Category created', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.GetCategories = async (req, res) => {
  try {
    const rows = await categoryModel.getAll();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.DeleteCategory = async (req, res) => {
  if (!requireRole(req.user, 'admin')) return res.status(403).json({ message: 'Admin only' });
  try {
    const id = req.params.id;
    await categoryModel.delete(id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.CreateTemplate = async (req, res) => {
  if (!requireRole(req.user, 'admin')) return res.status(403).json({ message: 'Admin only' });
  try {
    const data = req.body;
    const result = await templateModel.create(data);
    res.status(201).json({ message: 'Template created', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.UploadDiagram = async (req, res) => {
  if (!requireRole(req.user, 'admin')) return res.status(403).json({ message: 'Admin only' });
  try {
    const templateId = req.params.id;
    if (!req.file) return res.status(400).json({ message: 'File required (field name: diagram)' });
    const relPath = path.join('/uploads/diagrams', req.file.filename).replace(/\\/g, '/');
    await templateModel.updateDiagram(templateId, relPath);
    res.json({ message: 'Uploaded', url: relPath });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.CreateField = async (req, res) => {
  if (!requireRole(req.user, 'admin')) return res.status(403).json({ message: 'Admin only' });
  try {
    const templateId = req.params.id;
    const field = req.body;
    const result = await templateModel.createField(templateId, field);
    res.status(201).json({ message: 'Field added', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.GetTemplateById = async (req, res) => {
  try {
    const id = req.params.id;
    const tpl = await templateModel.getById(id);
    if (!tpl) return res.status(404).json({ message: 'Template not found' });
    const fields = await templateModel.getFields(id);
    res.json({ template: tpl, fields });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.CreateSubmission = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const payload = req.body;
    if (!payload.template_id || !Array.isArray(payload.values)) {
      return res.status(400).json({ message: 'template_id and values[] required' });
    }
    const subRes = await submissionModel.createSubmission({
      template_id: payload.template_id,
      employee_id: employeeId,
      inspection_date: payload.inspection_date,
      shift: payload.shift,
      status: 'submitted'
    });
    const submissionId = subRes.insertId;
    for (const v of payload.values) {
      await submissionModel.addSubmissionValue(submissionId, v.field_id, v.value);
    }
    res.status(201).json({ message: 'Submitted', id: submissionId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.GetSubmissionById = async (req, res) => {
  try {
    const id = req.params.id;
    const sub = await submissionModel.getById(id);
    if (!sub) return res.status(404).json({ message: 'Submission not found' });
    const values = await submissionModel.getValues(id);
    res.json({ submission: sub, values });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.InspectorReview = async (req, res) => {
  if (!requireRole(req.user, 'quality_inspector')) return res.status(403).json({ message: 'Inspector only' });
  try {
    const id = req.params.id;
    const { observation, remarks } = req.body;
    await submissionModel.updateInspectorReview(id, req.user.id, observation, remarks);
    res.json({ message: 'Marked as inspector_reviewed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.ManagerReview = async (req, res) => {
  if (!requireRole(req.user, 'quality_manager')) return res.status(403).json({ message: 'Manager only' });
  try {
    const id = req.params.id;
    const { remarks, approved } = req.body;
    const ok = approved === true || approved === 'true' || approved === 1;
    await submissionModel.updateManagerReview(id, req.user.id, remarks, ok);
    res.json({ message: ok ? 'Manager approved' : 'Manager rejected' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.RejectSubmission = async (req, res) => {
  try {
    const id = req.params.id;
    const actorRole = req.user.role;
    if (actorRole === 'quality_inspector') {
      await submissionModel.updateInspectorReview(id, req.user.id, null, 'rejected');
      return res.json({ message: 'Rejected by inspector' });
    } else if (actorRole === 'quality_manager') {
      await submissionModel.updateManagerReview(id, req.user.id, 'rejected', false);
      return res.json({ message: 'Rejected by manager' });
    }
    res.status(403).json({ message: 'Only inspector or manager can reject' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.ListSubmissions = async (req, res) => {
  try {
    // simple role filtering can be added later; for now return all
    const rows = await submissionModel.listAll();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


