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