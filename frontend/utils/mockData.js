/**
 * Mock Data for Admin Panel
 * No backend calls - pure frontend simulation
 */

export const mockUsers = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    employeeId: 'EMP001',
    role: 'machine_operator',
    email: 'rajesh@anandengg.com',
    phone: '+91 98765 43210',
    department: 'Manufacturing',
    status: 'active',
    joinDate: '2023-01-15',
  },
  {
    id: 2,
    name: 'Priya Singh',
    employeeId: 'EMP002',
    role: 'quality_inspector',
    email: 'priya@anandengg.com',
    phone: '+91 97654 32109',
    department: 'Quality Assurance',
    status: 'active',
    joinDate: '2023-02-20',
  },
  {
    id: 3,
    name: 'Amit Patel',
    employeeId: 'EMP003',
    role: 'quality_manager',
    email: 'amit@anandengg.com',
    phone: '+91 96543 21098',
    department: 'Quality Assurance',
    status: 'active',
    joinDate: '2022-11-10',
  },
  {
    id: 4,
    name: 'Sanjay Verma',
    employeeId: 'EMP004',
    role: 'machine_operator',
    email: 'sanjay@anandengg.com',
    phone: '+91 95432 10987',
    department: 'Manufacturing',
    status: 'inactive',
    joinDate: '2023-03-05',
  },
  {
    id: 5,
    name: 'Neha Sharma',
    employeeId: 'EMP005',
    role: 'quality_inspector',
    email: 'neha@anandengg.com',
    phone: '+91 94321 09876',
    department: 'Quality Assurance',
    status: 'active',
    joinDate: '2023-04-12',
  },
];

export const mockRoles = [
  {
    id: 1,
    name: 'machine_operator',
    displayName: 'Machine Operator',
    description: 'Operates manufacturing machines',
    permissions: ['create_reports', 'view_own_reports'],
    protected: false,
  },
  {
    id: 2,
    name: 'quality_inspector',
    displayName: 'Quality Inspector',
    description: 'Inspects and validates product quality',
    permissions: ['create_reports', 'view_own_reports', 'approve_reports'],
    protected: false,
  },
  {
    id: 3,
    name: 'quality_manager',
    displayName: 'Quality Manager',
    description: 'Manages quality operations',
    permissions: [
      'create_reports',
      'view_all_reports',
      'approve_reports',
      'manage_inspectors',
    ],
    protected: false,
  },
  {
    id: 4,
    name: 'admin',
    displayName: 'Administrator',
    description: 'Full system access',
    permissions: ['*'],
    protected: true,
  },
];

export const mockReportTypes = [
  {
    id: 1,
    name: 'Daily Production Report',
    code: 'RPT_PROD_001',
    description: 'Daily production statistics and metrics',
    frequency: 'Daily',
    status: 'active',
    submittedCount: 245,
  },
  {
    id: 2,
    name: 'Quality Check Report',
    code: 'RPT_QC_001',
    description: 'Quality assurance and inspection reports',
    frequency: 'Per Batch',
    status: 'active',
    submittedCount: 1823,
  },
  {
    id: 3,
    name: 'Equipment Maintenance Log',
    code: 'RPT_MAINT_001',
    description: 'Machine maintenance and repair logs',
    frequency: 'As Needed',
    status: 'active',
    submittedCount: 456,
  },
  {
    id: 4,
    name: 'Weekly Summary',
    code: 'RPT_WEEK_001',
    description: 'Weekly production and quality summary',
    frequency: 'Weekly',
    status: 'active',
    submittedCount: 52,
  },
  {
    id: 5,
    name: 'Incident Report',
    code: 'RPT_INC_001',
    description: 'Safety incidents and near-misses',
    frequency: 'As Needed',
    status: 'inactive',
    submittedCount: 12,
  },
];

export const mockAllReports = [
  {
    id: 1,
    title: 'Daily Production Report - Jan 20',
    type: 'Daily Production Report',
    submittedBy: 'Rajesh Kumar',
    submittedDate: '2026-01-20',
    status: 'approved',
    approvedBy: 'Amit Patel',
  },
  {
    id: 2,
    title: 'Quality Check - Batch QC2601',
    type: 'Quality Check Report',
    submittedBy: 'Priya Singh',
    submittedDate: '2026-01-20',
    status: 'approved',
    approvedBy: 'Amit Patel',
  },
  {
    id: 3,
    title: 'Equipment Maintenance - Machine A3',
    type: 'Equipment Maintenance Log',
    submittedBy: 'Sanjay Verma',
    submittedDate: '2026-01-19',
    status: 'pending',
    approvedBy: null,
  },
  {
    id: 4,
    title: 'Weekly Summary - Week 3',
    type: 'Weekly Summary',
    submittedBy: 'Neha Sharma',
    submittedDate: '2026-01-18',
    status: 'approved',
    approvedBy: 'Amit Patel',
  },
  {
    id: 5,
    title: 'Quality Check - Batch QC2602',
    type: 'Quality Check Report',
    submittedBy: 'Priya Singh',
    submittedDate: '2026-01-20',
    status: 'rejected',
    approvedBy: null,
  },
];

/**
 * Simulate storing/retrieving user list
 * In production, this would come from backend
 */
export const UserService = {
  // Get all users
  getAllUsers: async () => {
    return new Promise(resolve => {
      setTimeout(() => resolve(mockUsers), 500);
    });
  },

  // Get single user
  getUserById: async (id) => {
    return new Promise(resolve => {
      setTimeout(() => {
        const user = mockUsers.find(u => u.id === id);
        resolve(user || null);
      }, 300);
    });
  },

  // Delete user (frontend simulation)
  deleteUser: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockUsers.findIndex(u => u.id === id);
        if (index > -1) {
          mockUsers.splice(index, 1);
          resolve({ success: true, message: 'User deleted successfully' });
        } else {
          resolve({ success: false, message: 'User not found' });
        }
      }, 300);
    });
  },

  // Update user role
  updateUserRole: async (id, newRole) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = mockUsers.find(u => u.id === id);
        if (user) {
          user.role = newRole;
          resolve({ success: true, message: 'Role updated successfully' });
        } else {
          resolve({ success: false, message: 'User not found' });
        }
      }, 300);
    });
  },
};

/**
 * Simulate role management
 */
export const RoleService = {
  // Get all roles
  getAllRoles: async () => {
    return new Promise(resolve => {
      setTimeout(() => resolve(mockRoles), 300);
    });
  },

  // Add new role
  addRole: async (roleData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newRole = {
          id: mockRoles.length + 1,
          ...roleData,
          protected: false,
        };
        mockRoles.push(newRole);
        resolve({ success: true, data: newRole });
      }, 300);
    });
  },

  // Delete role (can't delete protected roles)
  deleteRole: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const role = mockRoles.find(r => r.id === id);
        if (role?.protected) {
          resolve({
            success: false,
            message: 'Cannot delete protected roles',
          });
        } else {
          const index = mockRoles.findIndex(r => r.id === id);
          if (index > -1) {
            mockRoles.splice(index, 1);
            resolve({ success: true, message: 'Role deleted successfully' });
          } else {
            resolve({ success: false, message: 'Role not found' });
          }
        }
      }, 300);
    });
  },

  // Update role
  updateRole: async (id, updates) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const role = mockRoles.find(r => r.id === id);
        if (role) {
          Object.assign(role, updates);
          resolve({ success: true, data: role });
        } else {
          resolve({ success: false, message: 'Role not found' });
        }
      }, 300);
    });
  },
};

// /**
//  * Simulate report type management
//  */
// export const ReportTypeService = {
//   // Get all report types
//   getAllReportTypes: async () => {
//     return new Promise(resolve => {
//       setTimeout(() => resolve(mockReportTypes), 300);
//     });
//   },

//   // Get all submitted reports
//   getAllReports: async () => {
//     return new Promise(resolve => {
//       setTimeout(() => resolve(mockAllReports), 500);
//     });
//   },

//   // Add new report type
//   addReportType: async (reportData) => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         const newReport = {
//           id: mockReportTypes.length + 1,
//           ...reportData,
//           submittedCount: 0,
//         };
//         mockReportTypes.push(newReport);
//         resolve({ success: true, data: newReport });
//       }, 300);
//     });
//   },

//   // Delete report type
//   deleteReportType: async (id) => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         const index = mockReportTypes.findIndex(r => r.id === id);
//         if (index > -1) {
//           mockReportTypes.splice(index, 1);
//           resolve({
//             success: true,
//             message: 'Report type deleted successfully',
//           });
//         } else {
//           resolve({ success: false, message: 'Report type not found' });
//         }
//       }, 300);
//     });
//   },

//   // Update report type
//   updateReportType: async (id, updates) => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         const reportType = mockReportTypes.find(r => r.id === id);
//         if (reportType) {
//           Object.assign(reportType, updates);
//           resolve({ success: true, data: reportType });
//         } else {
//           resolve({ success: false, message: 'Report type not found' });
//         }
//       }, 300);
//     });
//   },
// };

// // Statistics helper
// export const AdminStatsService = {
//   getOverviewStats: async () => {
//     return new Promise(resolve => {
//       setTimeout(() => {
//         resolve({
//           totalUsers: mockUsers.length,
//           activeUsers: mockUsers.filter(u => u.status === 'active').length,
//           totalRoles: mockRoles.length,
//           totalReportTypes: mockReportTypes.length,
//           totalSubmittedReports: mockAllReports.length,
//           systemHealth: 'Healthy',
//         });
//       }, 300);
//     });
//   },
// };
