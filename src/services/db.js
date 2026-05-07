const { Pool } = require('pg');

// POOL HERE
// \/

module.exports = {
    query: (text, params) => pool.query(text, params),
};