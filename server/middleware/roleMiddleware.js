const supabase = require('../config/supabase');

const requireRole = (allowedRoles) => async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
       // Support decoded sub from Supabase JWT (it uses "sub" to store the id)
       if (req.user.sub) {
         req.user.id = req.user.sub;
       } else {
         return res.status(401).json({ error: 'Unauthorized: User missing' });
       }
    }

    // Fetch user role from db
    const { data: userProfile, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (error || !userProfile) {
      return res.status(403).json({ error: 'Forbidden: Role not assigned' });
    }

    // Attach role just in case downstream
    req.user.role = userProfile.role;

    if (!allowedRoles.includes(userProfile.role)) {
      return res.status(403).json({ error: `Forbidden: Requires one of [${allowedRoles.join(',')}]` });
    }

    next();
  } catch (error) {
    next(error);
  }
};

const requireAdmin = requireRole(['ADMIN']);
const requireInspector = requireRole(['INSPECTOR', 'ADMIN']); // Admin implicitly can do inspector things
const requireUserOrAbove = requireRole(['USER', 'INSPECTOR', 'ADMIN']);

module.exports = {
  requireAdmin,
  requireInspector,
  requireUserOrAbove
};
