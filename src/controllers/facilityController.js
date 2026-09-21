const pool = require('../config/db');
const parseBody = require('../core/bodyParser');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

// function render(res, viewName, data) {
//     ejs.renderFile(path.join(__dirname, '../../views/pages', viewName), data, (err, html) => {
//         if (err) {
//             res.writeHead(500);
//             return res.end('Template error: ' + err.message);
//         }
//         res.writeHead(200, { 'Content-Type': 'text/html' });
//         res.end(html);
//     });
// }

function render(res, viewName, data) {
    const filepath = path.join(__dirname, "..", "..", "views", "pages", viewName);
    const template = fs.readFileSync(filepath, "utf-8");
    const html = ejs.render(template, data);

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
}


function redirectToFacilities(res) {
    res.writeHead(302, { Location: '/facilities' });
    res.end();
}

async function listFacilities(req, res) {
    try {
        const result = await pool.query('SELECT * FROM facilities ORDER BY id');
        render(res, 'facilities.ejs', { facilities: result.rows });
    } catch (error) {
        res.writeHead(500);
        res.end('Database error: ' + error.message);
    }
}

function createFacility(req, res) {
    parseBody(req, async (error, data) => {
        if (error) { res.writeHead(400); return res.end('Bad request'); }
        try {
            const { name, address, erp_capacity, is_divisible } = data;
            await pool.query(
                `INSERT INTO facilities (name, address, erp_capacity, is_divisible)
                 VALUES ($1, $2, $3, $4)`,
                [name, address, erp_capacity, is_divisible === 'true']
            );
            redirectToFacilities(res);
        } catch (error) {
            res.writeHead(500);
            res.end('Database error: ' + error.message);
        }
    });
}

function updateFacility(req, res, params) {
    parseBody(req, async (error, data) => {
        if (error) { res.writeHead(400); return res.end('Bad request'); }
        try {
            const { name, address, erp_capacity, is_divisible } = data;
            const result = await pool.query(
                `UPDATE facilities SET name=$1, address=$2, erp_capacity=$3, is_divisible=$4
                 WHERE id=$5 RETURNING *`,
                [name, address, erp_capacity, is_divisible === 'true', params.id]
            );
            if (result.rows.length === 0) {
                res.writeHead(404);
                return res.end('Facility not found');
            }
            redirectToFacilities(res);
        } catch (error) {
            res.writeHead(500);
            res.end('Database error: ' + error.message);
        }
    });
}

async function deleteFacility(req, res, params) {
    try {
        const result = await pool.query('DELETE FROM facilities WHERE id = $1 RETURNING *', [params.id]);
        if (result.rows.length === 0) {
            res.writeHead(404);
            return res.end('Facility not found');
        }
        redirectToFacilities(res);
    } catch (error) {
        res.writeHead(500);
        res.end('Database error: ' + error.message);
    }
}

module.exports = { listFacilities, createFacility, updateFacility, deleteFacility };