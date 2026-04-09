const supabase = require('../config/supabase');

/**
 * Log an administrative or sensitive action to the audit logs.
 * @param {Object} params
 * @param {string} params.userId - ID of the user performing the action
 * @param {string} params.role - Role of the user
 * @param {string} params.actionType - Type of action (e.g., 'CERT_APPROVE', 'REPORT_RESOLVE')
 * @param {string} params.targetType - Type of entity affected (e.g., 'certification', 'report')
 * @param {string} params.targetId - ID of the entity affected
 * @param {Object} params.metadata - Additional JSON metadata
 */
const logAction = async ({ userId, role, actionType, targetType, targetId, metadata = {} }) => {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert([{
        actor_user_id: userId,
        actor_role: role,
        action_type: actionType,
        target_type: targetType,
        target_id: targetId,
        metadata
      }]);

    if (error) {
      console.error('FAILED TO WRITE AUDIT LOG:', error.message);
    }
  } catch (err) {
    console.error('AUDIT SERVICE CRITICAL ERROR:', err.message);
  }
};

module.exports = {
  logAction
};
