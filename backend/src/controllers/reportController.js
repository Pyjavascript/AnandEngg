// const categoryModel = require('../models/categoryModel');
// const templateModel = require('../models/templateModel');
// const submissionModel = require('../models/submissionModel');
// const db = require('../config/db');
// const path = require('path');

// function requireRole(user, roleName) {
//   return user && user.role === roleName;
// }

// exports.CreateCategory = async (req, res) => {
//   if (!requireRole(req.user, 'admin')) return res.status(403).json({ message: 'Admin only' });
//   try {
//     const name = req.body.name;
//     if (!name) return res.status(400).json({ message: 'Name required' });
//     const result = await categoryModel.create(name);
//     res.status(201).json({ message: 'Category created', id: result.insertId });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// exports.GetCategories = async (req, res) => {
//   try {
//     const rows = await categoryModel.getAll();
//     res.json(rows);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// exports.DeleteCategory = async (req, res) => {
//   if (!requireRole(req.user, 'admin')) return res.status(403).json({ message: 'Admin only' });
//   try {
//     const id = req.params.id;
//     await categoryModel.delete(id);
//     res.json({ message: 'Category deleted' });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// exports.CreateTemplate = async (req, res) => {
//   if (!requireRole(req.user, 'admin')) return res.status(403).json({ message: 'Admin only' });
//   try {
//     const data = req.body;
//     const result = await templateModel.create(data);
//     res.status(201).json({ message: 'Template created', id: result.insertId });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// exports.UploadDiagram = async (req, res) => {
//   if (!requireRole(req.user, 'admin')) return res.status(403).json({ message: 'Admin only' });
//   try {
//     const templateId = req.params.id;
//     if (!req.file) return res.status(400).json({ message: 'File required (field name: diagram)' });
//     const relPath = path.join('/uploads/diagrams', req.file.filename).replace(/\\/g, '/');
//     await templateModel.updateDiagram(templateId, relPath);
//     res.json({ message: 'Uploaded', url: relPath });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// exports.CreateField = async (req, res) => {
//   if (!requireRole(req.user, 'admin')) return res.status(403).json({ message: 'Admin only' });
//   try {
//     const templateId = req.params.id;
//     const field = req.body;
//     const result = await templateModel.createField(templateId, field);
//     res.status(201).json({ message: 'Field added', id: result.insertId });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// exports.GetTemplateById = async (req, res) => {
//   try {
//     const id = req.params.id;
//     const tpl = await templateModel.getById(id);
//     if (!tpl) return res.status(404).json({ message: 'Template not found' });
//     const fields = await templateModel.getFields(id);
//     res.json({ template: tpl, fields });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// exports.CreateSubmission = async (req, res) => {
//   try {
//     const employeeId = req.user.id;
//     const payload = req.body;
//     if (!payload.template_id || !Array.isArray(payload.values)) {
//       return res.status(400).json({ message: 'template_id and values[] required' });
//     }
//     const subRes = await submissionModel.createSubmission({
//       template_id: payload.template_id,
//       employee_id: employeeId,
//       inspection_date: payload.inspection_date,
//       shift: payload.shift,
//       status: 'submitted'
//     });
//     const submissionId = subRes.insertId;
//     for (const v of payload.values) {
//       await submissionModel.addSubmissionValue(submissionId, v.field_id, v.value);
//     }
//     res.status(201).json({ message: 'Submitted', id: submissionId });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// exports.GetSubmissionById = async (req, res) => {
//   try {
//     const id = req.params.id;
//     const sub = await submissionModel.getById(id);
//     if (!sub) return res.status(404).json({ message: 'Submission not found' });
//     const values = await submissionModel.getValues(id);
//     res.json({ submission: sub, values });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// exports.InspectorReview = async (req, res) => {
//   if (!requireRole(req.user, 'quality_inspector')) return res.status(403).json({ message: 'Inspector only' });
//   try {
//     const id = req.params.id;
//     const { observation, remarks } = req.body;
//     await submissionModel.updateInspectorReview(id, req.user.id, observation, remarks);
//     res.json({ message: 'Marked as inspector_reviewed' });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// exports.ManagerReview = async (req, res) => {
//   if (!requireRole(req.user, 'quality_manager')) return res.status(403).json({ message: 'Manager only' });
//   try {
//     const id = req.params.id;
//     const { remarks, approved } = req.body;
//     const ok = approved === true || approved === 'true' || approved === 1;
//     await submissionModel.updateManagerReview(id, req.user.id, remarks, ok);
//     res.json({ message: ok ? 'Manager approved' : 'Manager rejected' });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// exports.RejectSubmission = async (req, res) => {
//   try {
//     const id = req.params.id;
//     const actorRole = req.user.role;
//     if (actorRole === 'quality_inspector') {
//       await submissionModel.updateInspectorReview(id, req.user.id, null, 'rejected');
//       return res.json({ message: 'Rejected by inspector' });
//     } else if (actorRole === 'quality_manager') {
//       await submissionModel.updateManagerReview(id, req.user.id, 'rejected', false);
//       return res.json({ message: 'Rejected by manager' });
//     }
//     res.status(403).json({ message: 'Only inspector or manager can reject' });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// exports.ListSubmissions = async (req, res) => {
//   try {
//     // simple role filtering can be added later; for now return all
//     const rows = await submissionModel.listAll();
//     res.json(rows);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // exports.CreateInspectionReport = async (req, res) => {
// //   try {
// //     const userId = req.user.id;
// //     const data = req.body;

// //     if (!data.dimensions || !Array.isArray(data.dimensions)) {
// //       return res.status(400).json({ message: 'Dimensions array is required' });
// //     }

// //     // Transform frontend data into submission format
// //     const submissionData = {
// //       template_id: data.templateId || 'unknown',
// //       employee_id: userId,
// //       inspection_date: data.inspectionDate,
// //       shift: data.shift,
// //       customer: data.customer,
// //       part_no: data.partNumber,
// //       doc_no: data.docNo,
// //       rev_no: data.revNo,
// //       visual_observation: data.visualObservation || '',
// //       remarks: data.remarks || '',
// //       report_data: JSON.stringify({
// //         dimensions: data.dimensions,
// //         visualObservation: data.visualObservation,
// //         remarks: data.remarks,
// //       }),
// //       status: 'submitted',
// //     };

// //     // Create submission directly with JSON data
// //     const [result] = await db.query(
// //       `INSERT INTO reports (user_id, title, part_no, report_type, report_data, status)
// //        VALUES (?, ?, ?, ?, ?, ?)`,
// //       [
// //         userId,
// //         `Inspection Report - ${data.partNumber}`,
// //         data.partNumber,
// //         data.reportType,
// //         submissionData.report_data,
// //         'pending'
// //       ]
// //     );

// //     res.status(201).json({ 
// //       message: 'Inspection report submitted successfully', 
// //       id: result.insertId 
// //     });
// //   } catch (err) {
// //     console.log('Error creating inspection report:', err);
// //     res.status(500).json({ message: err.message });
// //   }
// // };

// // exports.GetAllInjectionReports = async (req, res) => {
// //   try {
// //     const [reports] = await db.query(
// //       `SELECT 
// //         r.id,
// //         r.user_id,
// //         r.title,
// //         r.part_no,
// //         r.report_type,
// //         r.report_data,
// //         r.status,
// //         r.created_at,
// //         u.name as submitted_by,
// //         u.employee_id
// //        FROM reports r
// //        LEFT JOIN users u ON r.user_id = u.id
// //        ORDER BY r.created_at DESC`
// //     );
// //     res.json(reports || []);
// //   } catch (err) {
// //     console.log('Error fetching reports:', err);
// //     res.status(500).json({ message: err.message });
// //   }
// // };

// // exports.GetReportTypesWithStats = async (req, res) => {
// //   try {
// //     // Get all unique report types with submission count
// //     const [stats] = await db.query(
// //       `SELECT 
// //         report_type,
// //         COUNT(*) as submission_count,
// //         MIN(created_at) as first_created,
// //         MAX(created_at) as last_created
// //        FROM reports
// //        GROUP BY report_type
// //        ORDER BY report_type`
// //     );

// //     res.json(stats || []);
// //   } catch (err) {
// //     console.log('Error fetching report stats:', err);
// //     res.status(500).json({ message: err.message });
// //   }
// // };

// exports.GetAllTemplatesWithParts = async (req, res) => {
//   try {
//     const templates = await templateModel.getAllTemplatesWithDimensions();
    
//     // Get the base URL for images
//     const protocol = req.protocol || 'http';
//     const host = req.get('host') || 'localhost:3001';
//     const baseImageUrl = `${protocol}://${host}`;
    
//     // Structure data similar to the frontend format
//     const result = {};
    
//     for (const template of templates) {
//       // Use template name or a default if not available
//       const templateName = template.name || 'Inspection Report';
      
//       // Initialize template structure if not exists
//       if (!result[templateName]) {
//         result[templateName] = { customers: {} };
//       }
      
//       // Get customer from template
//       const customer = template.customer || 'General';
      
//       // Initialize customer array if not exists
//       if (!result[templateName].customers[customer]) {
//         result[templateName].customers[customer] = [];
//       }
      
//       // Fetch actual fields from template_fields table
//       let dimensions = [];
//       try {
//         const fields = await templateModel.getFields(template.id);
//         dimensions = fields.map((field, idx) => ({
//           slNo: field.position || idx + 1,
//           desc: field.label || '',
//           spec: field.specification || '',
//           unit: field.unit || 'mm',
//           actual: '',
//         }));
//       } catch (e) {
//         console.log('Error fetching fields:', e);
//         dimensions = [];
//       }
      
//       // Construct full image URL
//       let imageUrl = '';
//       if (template.diagram_url) {
//         imageUrl = template.diagram_url.startsWith('http') 
//           ? template.diagram_url 
//           : `${baseImageUrl}/${template.diagram_url}`;
//       }
      
//       // Add template as a part entry
//       const partEntry = {
//         partNo: template.part_no || template.code || `PART-${template.id}`,
//         img: { uri: imageUrl },
//         description: template.part_description || template.description || '',
//         docNo: template.doc_no || '',
//         revNo: template.rev_no || '00',
//         date: template.created_at ? new Date(template.created_at).toLocaleDateString('en-GB') : '',
//         dimensions: dimensions,
//         templateId: template.id,
//       };
      
//       result[templateName].customers[customer].push(partEntry);
//     }
    
//     res.json(result);
//   } catch (err) {
//     console.log('Error in GetAllTemplatesWithParts:', err);
//     res.status(500).json({ message: err.message });
//   }
// };

const categoryModel = require('../models/categoryModel');
const templateModel = require('../models/templateModel');
const submissionModel = require('../models/submissionModel');
const db = require('../config/db');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const { uploadRoot } = require('../config/uploads');

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

// exports.DeleteCategory = async (req, res) => {
//   if (!requireRole(req.user, 'admin')) return res.status(403).json({ message: 'Admin only' });
//   try {
//     const id = req.params.id;
//     await categoryModel.delete(id);
//     res.json({ message: 'Category deleted' });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
exports.DeleteCategory = async (req, res) => {
  if (!requireRole(req.user, 'admin')) {
    return res.status(403).json({ message: 'Admin only' });
  }

  const id = req.params.id;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [templates] = await connection.query(
      'SELECT id FROM report_templates WHERE category_id = ?',
      [id]
    );

    const templateIds = templates.map(t => t.id);

    if (templateIds.length > 0) {
      const [submissionRows] = await connection.query(
        'SELECT id FROM report_submissions WHERE template_id IN (?)',
        [templateIds]
      );
      const submissionIds = submissionRows.map(s => s.id);

      if (submissionIds.length > 0) {
        await connection.query(
          'DELETE FROM submission_values WHERE submission_id IN (?)',
          [submissionIds]
        );
      }

      await connection.query(
        'DELETE FROM report_submissions WHERE template_id IN (?)',
        [templateIds]
      );

      await connection.query(
        'DELETE sv FROM submission_values sv JOIN template_fields tf ON sv.field_id = tf.id WHERE tf.template_id IN (?)',
        [templateIds]
      );

      await connection.query(
        'DELETE FROM template_fields WHERE template_id IN (?)',
        [templateIds]
      );

      await connection.query(
        'DELETE FROM report_templates WHERE category_id = ?',
        [id]
      );
    }

    await connection.query(
      'DELETE FROM report_categories WHERE id = ?',
      [id]
    );

    await connection.commit();

    return res.json({ message: 'Category and related data deleted successfully' });

  } catch (err) {
    await connection.rollback();
    console.error(err);
    return res.status(500).json({ message: err.message });
  } finally {
    connection.release();
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
    const status = payload.status === 'draft' ? 'draft' : 'submitted';
    if (!payload.template_id) {
      return res.status(400).json({ message: 'template_id is required' });
    }
    if (status === 'submitted' && !Array.isArray(payload.values)) {
      return res
        .status(400)
        .json({ message: 'values[] required when submitting a report' });
    }
    const subRes = await submissionModel.createSubmission({
      template_id: payload.template_id,
      employee_id: employeeId,
      inspection_date: payload.inspection_date,
      shift: payload.shift,
      status,
    });
    const submissionId = subRes.insertId;
    const values = Array.isArray(payload.values) ? payload.values : [];
    for (const v of values) {
      await submissionModel.addSubmissionValue(
        submissionId,
        v.field_id,
        v.value,
      );
    }
    res.status(201).json({
      message: status === 'draft' ? 'Draft saved' : 'Submitted',
      id: submissionId,
      status,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.UpdateTemplate = async (req, res) => {
  if (!requireRole(req.user, 'admin')) return res.status(403).json({ message: 'Admin only' });
  try {
    const templateId = Number(req.params.id);
    if (!templateId) {
      return res.status(400).json({ message: 'Valid template id is required' });
    }

    const existing = await templateModel.getById(templateId);
    if (!existing) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const data = req.body || {};
    const categoryId = Number(data.category_id || existing.category_id);
    if (!categoryId) {
      return res.status(400).json({ message: 'category_id is required' });
    }

    await templateModel.update(templateId, {
      category_id: categoryId,
      doc_no: data.doc_no ?? existing.doc_no,
      customer: data.customer ?? existing.customer,
      part_no: data.part_no ?? existing.part_no,
      part_description: data.part_description ?? existing.part_description,
      rev_no: data.rev_no ?? existing.rev_no,
    });

    if (Array.isArray(data.fields)) {
      for (let i = 0; i < data.fields.length; i += 1) {
        const field = data.fields[i] || {};
        const label = String(field.label || '').trim();
        if (!label) continue;

        const payload = {
          label,
          specification: field.specification || null,
          unit: field.unit || 'mm',
          position: Number(field.position || i + 1),
        };

        if (field.id) {
          await templateModel.updateField(templateId, Number(field.id), payload);
        } else {
          await templateModel.createField(templateId, payload);
        }
      }
    }

    const template = await templateModel.getById(templateId);
    const fields = await templateModel.getFields(templateId);
    return res.json({ message: 'Template updated', template, fields });
  } catch (err) {
    return res.status(500).json({ message: err.message });
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

// exports.CreateInspectionReport = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const data = req.body;

//     if (!data.dimensions || !Array.isArray(data.dimensions)) {
//       return res.status(400).json({ message: 'Dimensions array is required' });
//     }

//     // Transform frontend data into submission format
//     const submissionData = {
//       template_id: data.templateId || 'unknown',
//       employee_id: userId,
//       inspection_date: data.inspectionDate,
//       shift: data.shift,
//       customer: data.customer,
//       part_no: data.partNumber,
//       doc_no: data.docNo,
//       rev_no: data.revNo,
//       visual_observation: data.visualObservation || '',
//       remarks: data.remarks || '',
//       report_data: JSON.stringify({
//         dimensions: data.dimensions,
//         visualObservation: data.visualObservation,
//         remarks: data.remarks,
//       }),
//       status: 'submitted',
//     };

//     // Create submission directly with JSON data
//     const [result] = await db.query(
//       `INSERT INTO reports (user_id, title, part_no, report_type, report_data, status)
//        VALUES (?, ?, ?, ?, ?, ?)`,
//       [
//         userId,
//         `Inspection Report - ${data.partNumber}`,
//         data.partNumber,
//         data.reportType,
//         submissionData.report_data,
//         'pending'
//       ]
//     );

//     res.status(201).json({ 
//       message: 'Inspection report submitted successfully', 
//       id: result.insertId 
//     });
//   } catch (err) {
//     console.log('Error creating inspection report:', err);
//     res.status(500).json({ message: err.message });
//   }
// };

// exports.GetAllInjectionReports = async (req, res) => {
//   try {
//     const [reports] = await db.query(
//       `SELECT 
//         r.id,
//         r.user_id,
//         r.title,
//         r.part_no,
//         r.report_type,
//         r.report_data,
//         r.status,
//         r.created_at,
//         u.name as submitted_by,
//         u.employee_id
//        FROM reports r
//        LEFT JOIN users u ON r.user_id = u.id
//        ORDER BY r.created_at DESC`
//     );
//     res.json(reports || []);
//   } catch (err) {
//     console.log('Error fetching reports:', err);
//     res.status(500).json({ message: err.message });
//   }
// };

// exports.GetReportTypesWithStats = async (req, res) => {
//   try {
//     // Get all unique report types with submission count
//     const [stats] = await db.query(
//       `SELECT 
//         report_type,
//         COUNT(*) as submission_count,
//         MIN(created_at) as first_created,
//         MAX(created_at) as last_created
//        FROM reports
//        GROUP BY report_type
//        ORDER BY report_type`
//     );

//     res.json(stats || []);
//   } catch (err) {
//     console.log('Error fetching report stats:', err);
//     res.status(500).json({ message: err.message });
//   }
// };

exports.GetAllTemplatesWithParts = async (req, res) => {
  try {
    const templates = await templateModel.getAllTemplatesWithDimensions();
    
    // Get the base URL for images
    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:3001';
    const baseImageUrl = `${protocol}://${host}`;
    
    // Structure data similar to the frontend format
    const result = {};
    
    for (const template of templates) {
      // Group employee selection by category name.
      const templateName = template.category_name || 'Uncategorized';
      
      // Initialize template structure if not exists
      if (!result[templateName]) {
        result[templateName] = { customers: {} };
      }
      
      // Get customer from template
      const customer = template.customer || 'General';
      
      // Initialize customer array if not exists
      if (!result[templateName].customers[customer]) {
        result[templateName].customers[customer] = [];
      }
      
      // Fetch actual fields from template_fields table
      let dimensions = [];
      try {
        const fields = await templateModel.getFields(template.id);
        dimensions = fields.map((field, idx) => ({
          slNo: field.position || idx + 1,
          desc: field.label || '',
          spec: field.specification || '',
          unit: field.unit || 'mm',
          actual: '',
        }));
      } catch (e) {
        console.log('Error fetching fields:', e);
        dimensions = [];
      }
      
      // Construct full image URL
      let imageUrl = '';
      if (template.diagram_url) {
        imageUrl = template.diagram_url.startsWith('http') 
          ? template.diagram_url 
          : `${baseImageUrl}${template.diagram_url}`;  //made change here to remove extra slash since diagram_url already starts with /uploads/diagrams/...
      }
      
      // Add template as a part entry
      const partEntry = {
        partNo: template.part_no || template.code || `PART-${template.id}`,
        img: { uri: imageUrl },
        description: template.part_description || template.description || '',
        docNo: template.doc_no || '',
        revNo: template.rev_no || '00',
        date: template.created_at ? new Date(template.created_at).toLocaleDateString('en-GB') : '',
        dimensions: dimensions,
        templateId: template.id,
      };
      
      result[templateName].customers[customer].push(partEntry);
    }
    
    res.json(result);
  } catch (err) {
    console.log('Error in GetAllTemplatesWithParts:', err);
    res.status(500).json({ message: err.message });
  }
};

function escapeCsv(value) {
  const s = value == null ? '' : String(value);
  if (s.includes('"') || s.includes(',') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCsv(rows) {
  const header = [
    'ID',
    'Category',
    'Report Type',
    'Doc No',
    'Part No',
    'Status',
    'Inspection Date',
    'Shift',
    'Submitted By',
    'Inspector',
    'Manager',
    'Created At',
    'Actual Values',
  ];

  const lines = [header.join(',')];
  rows.forEach((r) => {
    lines.push([
      r.id,
      r.category_name || '',
      r.template_label || '',
      r.doc_no || '',
      r.part_no || '',
      r.status || '',
      r.inspection_date ? new Date(r.inspection_date).toISOString().slice(0, 10) : '',
      r.shift || '',
      r.submitted_by_name || '',
      r.inspector_name || '',
      r.manager_name || '',
      r.created_at ? new Date(r.created_at).toISOString() : '',
      r.actual_values || '',
    ].map(escapeCsv).join(','));
  });
  return lines.join('\n');
}

function escapePdfText(text) {
  return String(text || '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function buildSimplePdf(lines) {
  const maxLines = 44;
  const pageLines = lines.slice(0, maxLines);
  let content = 'BT\n/F1 10 Tf\n50 790 Td\n';
  pageLines.forEach((line, idx) => {
    if (idx > 0) content += '0 -16 Td\n';
    content += `(${escapePdfText(line)}) Tj\n`;
  });
  content += 'ET';

  const objects = [];
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  objects.push('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n');
  objects.push('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');
  objects.push(`5 0 obj\n<< /Length ${Buffer.byteLength(content, 'utf8')} >>\nstream\n${content}\nendstream\nendobj\n`);

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((obj) => {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += obj;
  });

  const xrefStart = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(pdf, 'utf8');
}

function resolveDiagramFilePath(diagramUrl) {
  if (!diagramUrl) return null;
  let parsedPath = diagramUrl;
  if (/^https?:\/\//i.test(diagramUrl)) {
    try {
      parsedPath = new URL(diagramUrl).pathname || '';
    } catch {
      return null;
    }
  }

  if (!parsedPath.startsWith('/uploads/')) return null;
  const relative = parsedPath.replace(/^\/uploads\//, '');
  const absPath = path.join(uploadRoot, relative);
  return fs.existsSync(absPath) ? absPath : null;
}

function pushFieldRow(doc, left, top, colWidths, row, isHeader = false) {
  const rowHeight = 22;
  const font = isHeader ? 'Helvetica-Bold' : 'Helvetica';
  const size = isHeader ? 9 : 8.5;

  let x = left;
  row.forEach((cell, idx) => {
    doc
      .rect(x, top, colWidths[idx], rowHeight)
      .strokeColor('#DCE6F3')
      .lineWidth(0.7)
      .stroke();
    doc
      .font(font)
      .fontSize(size)
      .fillColor('#1F2937')
      .text(String(cell ?? '-'), x + 4, top + 6, {
        width: colWidths[idx] - 8,
        height: rowHeight - 8,
        ellipsis: true,
      });
    x += colWidths[idx];
  });
  return rowHeight;
}

async function buildDetailedPdf(detail) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 36 });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const left = doc.page.margins.left;

    doc
      .font('Helvetica-Bold')
      .fontSize(18)
      .fillColor('#114A76')
      .text('Inspection Report', left, 34);

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#475569')
      .text(`Submission ID: ${detail.id}`, left, 58);

    doc.moveTo(left, 74).lineTo(left + pageWidth, 74).strokeColor('#DCE6F3').stroke();

    const infoPairs = [
      ['Category', detail.category_name || '-'],
      ['Report Type', detail.part_description || '-'],
      ['Customer', detail.customer || '-'],
      ['Part No', detail.part_no || '-'],
      ['Doc No / Rev No', `${detail.doc_no || '-'} / ${detail.rev_no || '-'}`],
      ['Inspection Date', formatDate(detail.inspection_date)],
      ['Shift', detail.shift || '-'],
      ['Status', detail.status || '-'],
      ['Submitted By', detail.submitted_by_name || '-'],
      ['Inspector', detail.inspector_name || '-'],
      ['Manager', detail.manager_name || '-'],
      ['Created At', formatDate(detail.created_at)],
    ];

    let y = 84;
    const colGap = 12;
    const colWidth = (pageWidth - colGap) / 2;
    infoPairs.forEach((pair, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = left + col * (colWidth + colGap);
      const yy = y + row * 18;
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#334155').text(`${pair[0]}:`, x, yy, { width: 90 });
      doc.font('Helvetica').fontSize(8.5).fillColor('#111827').text(String(pair[1]), x + 92, yy, { width: colWidth - 92 });
    });

    y += Math.ceil(infoPairs.length / 2) * 18 + 12;

    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor('#123A59')
      .text('Part Diagram', left, y);
    y += 16;

    const diagramPath = resolveDiagramFilePath(detail.diagram_url);
    if (diagramPath) {
      doc.rect(left, y, pageWidth, 150).strokeColor('#DCE6F3').stroke();
      doc.image(diagramPath, left + 8, y + 8, {
        fit: [pageWidth - 16, 134],
        align: 'center',
        valign: 'center',
      });
      y += 160;
    } else {
      doc.rect(left, y, pageWidth, 60).strokeColor('#DCE6F3').stroke();
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#6B7280')
        .text(detail.diagram_url ? `Diagram not found on server: ${detail.diagram_url}` : 'No diagram attached', left + 10, y + 23);
      y += 70;
    }

    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor('#123A59')
      .text('Dimensions & Measurements', left, y);
    y += 14;

    const colWidths = [28, 140, 140, pageWidth - 28 - 140 - 140];
    y += pushFieldRow(doc, left, y, colWidths, ['No', 'Dimension', 'Specification', 'Actual Values'], true);

    const rows = Array.isArray(detail.values) ? detail.values : [];
    if (rows.length === 0) {
      y += pushFieldRow(doc, left, y, colWidths, ['-', 'No values', '-', '-']);
    } else {
      rows.forEach((v, idx) => {
        const spec = v.specification
          ? `${v.specification}${v.unit ? ` (${v.unit})` : ''}`
          : '-';
        const actual = Array.isArray(v.actual_values) && v.actual_values.length
          ? v.actual_values.join(' | ')
          : '-';
        if (y > doc.page.height - 72) {
          doc.addPage();
          y = doc.page.margins.top;
          y += pushFieldRow(doc, left, y, colWidths, ['No', 'Dimension', 'Specification', 'Actual Values'], true);
        }
        y += pushFieldRow(doc, left, y, colWidths, [idx + 1, v.label || '-', spec, actual]);
      });
    }

    doc.end();
  });
}

function formatDate(value) {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleDateString('en-GB');
  } catch {
    return String(value);
  }
}

function toDetailedReportLines(detail) {
  const lines = [];
  lines.push('Inspection Report');
  lines.push('------------------------------------------------------------');
  lines.push(`Submission ID: ${detail.id}`);
  lines.push(`Category: ${detail.category_name || '-'}`);
  lines.push(`Report Type: ${detail.part_description || '-'}`);
  lines.push(`Customer: ${detail.customer || '-'}`);
  lines.push(`Part No: ${detail.part_no || '-'}`);
  lines.push(`Doc No / Rev No: ${detail.doc_no || '-'} / ${detail.rev_no || '-'}`);
  lines.push(`Inspection Date: ${formatDate(detail.inspection_date)}`);
  lines.push(`Shift: ${detail.shift || '-'}`);
  lines.push(`Status: ${detail.status || '-'}`);
  lines.push(`Submitted By: ${detail.submitted_by_name || '-'}`);
  lines.push(`Inspector: ${detail.inspector_name || '-'}`);
  lines.push(`Manager: ${detail.manager_name || '-'}`);
  lines.push(`Created At: ${formatDate(detail.created_at)}`);
  lines.push('------------------------------------------------------------');
  lines.push('Part Diagram');
  lines.push(
    detail.diagram_url
      ? `Diagram URL: ${detail.diagram_url}`
      : 'Diagram URL: Not attached',
  );
  lines.push('------------------------------------------------------------');
  lines.push('Dimensions & Measurements');
  lines.push('No | Dimension | Specification | Actual Values');
  lines.push('------------------------------------------------------------');

  if (!Array.isArray(detail.values) || detail.values.length === 0) {
    lines.push('No measurement values available');
  } else {
    detail.values.forEach((v, idx) => {
      const actual = Array.isArray(v.actual_values) && v.actual_values.length
        ? v.actual_values.join(' | ')
        : '-';
      const spec = v.specification
        ? `${v.specification}${v.unit ? ` (${v.unit})` : ''}`
        : '-';
      lines.push(`${idx + 1} | ${v.label || '-'} | ${spec} | ${actual}`);
    });
  }
  return lines;
}

exports.DownloadSubmissions = async (req, res) => {
  try {
    const format = String(req.query.format || 'csv').toLowerCase();
    if (!['csv', 'pdf'].includes(format)) {
      return res.status(400).json({ message: 'format must be csv or pdf' });
    }

    const filters = {
      submissionId: req.query.submissionId || null,
      reportType: req.query.reportType || 'all',
      status: req.query.status || 'all',
      fromDate: req.query.fromDate || null,
      toDate: req.query.toDate || null,
    };

    const rows = await submissionModel.listForExport(filters, req.user);
    const now = new Date().toISOString().replace(/[:.]/g, '-');

    if (format === 'csv') {
      const csv = toCsv(rows);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="report-export-${now}.csv"`);
      return res.status(200).send(csv);
    }

    let lines = [];
    let detail = null;
    if (filters.submissionId) {
      detail = await submissionModel.getSubmissionDetailForExport(
        Number(filters.submissionId),
        req.user,
      );
      if (!detail) {
        lines = ['Inspection Report', 'No report found for selected submission ID.'];
      } else {
        if (detail.diagram_url && !/^https?:\/\//i.test(detail.diagram_url)) {
          detail.diagram_url = `${req.protocol}://${req.get('host')}${detail.diagram_url}`;
        }
        lines = toDetailedReportLines(detail);
      }
    } else {
      lines.push('Inspection Report Export');
      lines.push(`Generated: ${new Date().toLocaleString('en-GB')}`);
      lines.push(`Filters -> Report ID: ${filters.submissionId || 'all'}, Type: ${filters.reportType}, Status: ${filters.status}, From: ${filters.fromDate || '-'}, To: ${filters.toDate || '-'}`);
      lines.push('--------------------------------------------------------------------');
      rows.forEach((r) => {
        lines.push(
          `#${r.id} | ${r.template_label || 'Report'} | ${r.status || ''} | ${r.submitted_by_name || ''} | ${r.created_at ? new Date(r.created_at).toLocaleDateString('en-GB') : ''}`
        );
      });
      if (rows.length === 0) {
        lines.push('No submissions found for selected filters.');
      }
    }

    const pdfBuffer = filters.submissionId
      ? await buildDetailedPdf(detail || { id: filters.submissionId, values: [] })
      : buildSimplePdf(lines);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="report-export-${now}.pdf"`);
    return res.status(200).send(pdfBuffer);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};




