const supabase = require('../config/supabase');

const signup = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // 1. Sign up user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // 2. Insert into public.users table using service role (bypass RLS)
    const userId = authData.user?.id;
    if (userId) {
      const { error: dbError } = await supabase
        .from('users')
        .insert([{ id: userId, email, name }]);
        
      if (dbError) {
        // If it fails, let's just log it or maybe rollback. For now, log it.
        console.error("Failed to insert user profile:", dbError);
        return res.status(500).json({ error: 'Failed to create user profile in database' });
      }
    }

    // Supabase signUp returns session/token if email confirmations are disabled.
    // If enabled, it might just return user object. We will just pass the data back.
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: userId, email, name },
      session: authData.session
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from('users')
      .select('name, role')
      .eq('id', data.user.id)
      .single();

    res.status(200).json({
      message: 'Logged in successfully',
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile?.name,
        role: profile?.role || 'USER'
      },
      token: data.session.access_token,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login
};
