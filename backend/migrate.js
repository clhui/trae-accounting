const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// 加载环境变量
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('Starting password reset tokens table migration...');
    
    // 读取SQL文件
    const sqlPath = path.join(__dirname, '..', 'create_password_reset_tokens.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Executing SQL migration...');
    
    // 执行SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }
    
    console.log('Migration completed successfully!');
    console.log('password_reset_tokens table created.');
    
  } catch (err) {
    console.error('Error during migration:', err.message);
    
    // 尝试直接执行SQL语句
    console.log('Trying alternative approach...');
    
    try {
      // 分步执行SQL
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          token VARCHAR(255) NOT NULL UNIQUE,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          used BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      
      const { error: createError } = await supabase.rpc('exec_sql', { sql_query: createTableSQL });
      
      if (createError) {
        console.error('Failed to create table:', createError);
        
        // 最后尝试：使用原生SQL执行
        console.log('Attempting direct SQL execution...');
        
        const { error: directError } = await supabase
          .from('password_reset_tokens')
          .select('*')
          .limit(1);
          
        if (directError && directError.code === '42P01') {
          console.log('Table does not exist. Please create it manually in Supabase SQL Editor.');
          console.log('\nSQL to execute in Supabase SQL Editor:');
          console.log('=====================================');
          const sqlContent = fs.readFileSync(path.join(__dirname, '..', 'create_password_reset_tokens.sql'), 'utf8');
          console.log(sqlContent);
          console.log('=====================================');
        } else {
          console.log('Table might already exist or there\'s another issue.');
        }
      } else {
        console.log('Table created successfully using alternative method!');
      }
      
    } catch (altErr) {
      console.error('Alternative approach failed:', altErr.message);
      console.log('\nPlease manually execute the SQL in Supabase SQL Editor:');
      console.log('=====================================');
      const sqlContent = fs.readFileSync(path.join(__dirname, '..', 'create_password_reset_tokens.sql'), 'utf8');
      console.log(sqlContent);
      console.log('=====================================');
    }
  }
}

runMigration();