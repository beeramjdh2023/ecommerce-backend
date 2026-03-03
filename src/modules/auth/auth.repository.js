// we define our sql queries here like all functions that interect with mysql

import pool from '../../config/db.js'
import {v4 as uuidv4} from 'uuid'

export const findUserByEmail=async(email)=>{
    const query=`
      select * from users where email=?
    `;
   const [rows] =await pool.execute(query,[email]);

   return rows[0] || null
}

export const createUser=async({name,email,password_hash})=>{
    console.log(email,name,password_hash);
    const query=`
      INSERT INTO users (id,name,email,password_hash)
      VALUES (?,?,?,?)
    `;
    const id=uuidv4();
    await pool.execute(query,[id,name,email,password_hash]);

    const query2=`
    Select id,name,email,role,created_at from users where id=? `;
    const [rows]=await pool.execute(query2,[id]);
    return rows[0];
}




export const saveRefreshToken = async ({ token, user_id, expires_at }) => {
  const id = uuidv4()
  await pool.execute(
    'INSERT INTO refresh_tokens (id, token, user_id, expires_at) VALUES (?, ?, ?, ?)',
    [id, token, user_id, expires_at]
  )
}

export const findRefreshToken = async (token) => {
  const [rows] = await pool.execute(
    'SELECT * FROM refresh_tokens WHERE token = ?',
    [token]
  )
  return rows[0] || null
}

export const deleteRefreshToken = async (token) => {
  await pool.execute(
    'DELETE FROM refresh_tokens WHERE token = ?',
    [token]
  )
}

export const findUserById = async (id) => {
  const [rows] = await pool.execute(
    'SELECT id, name, email, role, is_active FROM users WHERE id = ?',
    [id]
  )
  return rows[0] || null
}