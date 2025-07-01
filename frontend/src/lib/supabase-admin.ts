import { createClient } from '@supabase/supabase-js';
import { clerkClient } from '@clerk/nextjs/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create admin client with service role key for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper function to verify Clerk token and get user info
export const verifyClerkToken = async (token: string) => {
  try {
    // For Next.js API routes, we can use the token directly
    // This is a simplified approach - in production you might want to verify the token properly
    const response = await fetch('https://api.clerk.dev/v1/sessions/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token })
    });

    if (!response.ok) {
      throw new Error('Invalid token');
    }

    const session = await response.json();
    return session;
  } catch (error) {
    console.error('Error verifying Clerk token:', error);
    throw new Error('Invalid token');
  }
};

// Helper function to check if user is admin
export const checkAdminStatus = async (clerkUserId: string) => {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return user?.is_admin || false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Helper function to get user by Clerk ID
export const getUserByClerkId = async (clerkUserId: string) => {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

// Helper function to get all users (admin only)
export const getAllUsers = async () => {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }

    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Helper function to get admin statistics
export const getAdminStats = async () => {
  try {
    // Get total users
    const { count: totalUsers, error: usersError } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (usersError) throw usersError;

    // Get total quiz results
    const { count: totalQuizzes, error: quizzesError } = await supabaseAdmin
      .from('quiz_results')
      .select('*', { count: 'exact', head: true });

    if (quizzesError) throw quizzesError;

    // Get total career reports
    const { count: totalReports, error: reportsError } = await supabaseAdmin
      .from('career_reports')
      .select('*', { count: 'exact', head: true });

    if (reportsError) throw reportsError;

    // Get active users (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const { count: activeUsers, error: activeError } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('last_active', twentyFourHoursAgo.toISOString());

    if (activeError) throw activeError;

    // Get total courses
    const { count: totalCourses, error: coursesError } = await supabaseAdmin
      .from('courses')
      .select('*', { count: 'exact', head: true });

    if (coursesError) throw coursesError;

    // Get total resources
    const { count: totalResources, error: resourcesError } = await supabaseAdmin
      .from('resources')
      .select('*', { count: 'exact', head: true });

    if (resourcesError) throw resourcesError;

    return {
      totalUsers: totalUsers || 0,
      totalQuizzes: totalQuizzes || 0,
      totalReports: totalReports || 0,
      activeUsers: activeUsers || 0,
      totalCourses: totalCourses || 0,
      totalResources: totalResources || 0,
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
};

// Helper function to get recent activity
export const getRecentActivity = async (limit: number = 20) => {
  try {
    const { data: activities, error } = await supabaseAdmin
      .from('user_activity')
      .select(`
        *,
        users:user_id (
          clerk_user_id,
          email,
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }

    return activities;
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    throw error;
  }
};

// Helper function to get pending resources
export const getPendingResources = async () => {
  try {
    const { data: resources, error } = await supabaseAdmin
      .from('resources')
      .select(`
        *,
        users:submitted_by (
          clerk_user_id,
          email,
          first_name,
          last_name
        )
      `)
      .eq('status', 'pending')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending resources:', error);
      throw error;
    }

    return resources;
  } catch (error) {
    console.error('Error fetching pending resources:', error);
    throw error;
  }
};

// Helper function to update resource status
export const updateResourceStatus = async (
  resourceId: string,
  status: 'approved' | 'rejected',
  adminUserId: string
) => {
  try {
    const updateData = {
      status,
      updated_at: new Date().toISOString(),
      ...(status === 'approved' 
        ? { approved_at: new Date().toISOString(), approved_by: adminUserId }
        : { rejected_at: new Date().toISOString(), rejected_by: adminUserId }
      )
    };

    const { data, error } = await supabaseAdmin
      .from('resources')
      .update(updateData)
      .eq('id', resourceId)
      .select()
      .single();

    if (error) {
      console.error('Error updating resource status:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating resource status:', error);
    throw error;
  }
};

// Helper function to log admin activity
export const logAdminActivity = async (
  adminUserId: string,
  action: string,
  details: any
) => {
  try {
    const { error } = await supabaseAdmin
      .from('admin_activity')
      .insert({
        admin_user_id: adminUserId,
        action,
        details,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error logging admin activity:', error);
    }
  } catch (error) {
    console.error('Error logging admin activity:', error);
  }
};

// Helper function to get site settings
export const getSiteSettings = async () => {
  try {
    const { data: settings, error } = await supabaseAdmin
      .from('site_settings')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching site settings:', error);
      // Return default settings if none exist
      return {
        siteName: 'VCE Subject Selection & Career Guidance Tool',
        siteDescription: 'AI-powered career guidance for VCE students',
        maintenanceMode: false,
        allowNewRegistrations: true,
        defaultUserRole: 'user',
        maxUploadSize: 10,
        allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx']
      };
    }

    return settings;
  } catch (error) {
    console.error('Error fetching site settings:', error);
    throw error;
  }
};

// Helper function to update site settings
export const updateSiteSettings = async (adminUserId: string, settings: any) => {
  try {
    const updateData = {
      ...settings,
      updated_at: new Date().toISOString(),
      updated_by: adminUserId
    };

    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .upsert(updateData, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Error updating site settings:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating site settings:', error);
    throw error;
  }
}; 