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

      await connection.query(
        'DELETE FROM report_submissions WHERE template_id IN (?)',
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
          : `${baseImageUrl}/${template.diagram_url}`;
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

    const lines = [];
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

    const pdfBuffer = buildSimplePdf(lines);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="report-export-${now}.pdf"`);
    return res.status(200).send(pdfBuffer);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};




