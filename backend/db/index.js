import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.PG_URI,
});

const query = async (sqlText, param, callback) => {
  return pool.query(sqlText, param, callback);
};
export { query };
