const { supabase, supabaseAdmin } = require('./supabase');

// Database query utilities
const executeQuery = async (query, params = []) => {
  try {
    const { data, error } = await supabaseAdmin.rpc(query, params);
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Generic CRUD operations
const findById = async (table, id) => {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error finding ${table} by ID:`, error);
    throw error;
  }
};

const findMany = async (table, filters = {}, options = {}) => {
  try {
    let query = supabase.from(table).select('*');

    // Apply filters
    Object.keys(filters).forEach(key => {
      query = query.eq(key, filters[key]);
    });

    // Apply pagination
    if (options.page && options.limit) {
      const offset = (options.page - 1) * options.limit;
      query = query.range(offset, offset + options.limit - 1);
    }

    // Apply sorting
    if (options.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending || false });
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error finding ${table}:`, error);
    throw error;
  }
};

const create = async (table, data) => {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return result;
  } catch (error) {
    console.error(`Error creating ${table}:`, error);
    throw error;
  }
};

const update = async (table, id, data) => {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return result;
  } catch (error) {
    console.error(`Error updating ${table}:`, error);
    throw error;
  }
};

const deleteById = async (table, id) => {
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error(`Error deleting ${table}:`, error);
    throw error;
  }
};

module.exports = {
  executeQuery,
  findById,
  findMany,
  create,
  update,
  deleteById,
  supabase,
  supabaseAdmin
};