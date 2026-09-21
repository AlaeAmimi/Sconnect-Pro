const pool = require('../config/db');
const parseBody = require('../core/bodyParser');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

function render(res, viewName, data) {
    const filepath = path.join(__dirname, "..", "..", "views", "pages", viewName);
    const template = fs.readFileSync(filepath, "utf-8");
    const html = ejs.render(template, data);

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
}


function redirectToAssociations(res) {
    res.writeHead(302, { Location: '/associations' });
    res.end();
}

async function listAssociations(req, res) {
    try {
        const result = await pool.query('SELECT * FROM associations ORDER BY id');
        render(res, 'associations.ejs', { associations: result.rows });
    } catch (error) {
        res.writeHead(500);
        res.end('Database error: ' + error.message);
    }
}

function createAssociation(req, res) {
    parseBody(req, async (error, data) => {
        if (error) { res.writeHead(400); return res.end('Bad request'); }
        try {
            const { name, contact_email, contact_phone } = data;
            await pool.query(
                `INSERT INTO associations (name, contact_email, contact_phone)
                 VALUES ($1, $2, $3)`,
                [name, contact_email, contact_phone]
            );
            redirectToAssociations(res);
        } catch (error) {
            res.writeHead(500);
            res.end('Database error: ' + error.message);
        }
    });
}

function updateAssociation(req, res, params) {
    parseBody(req, async (error, data) => {
        if (error) { res.writeHead(400); return res.end('Bad request'); }
        try {
            const { name, contact_email, contact_phone } = data;
            const result = await pool.query(
                `UPDATE associations SET name=$1, contact_email=$2, contact_phone=$3
                 WHERE id=$4 RETURNING *`,
                [name, contact_email, contact_phone, params.id]
            );
            if (result.rows.length === 0) {
                res.writeHead(404);
                return res.end('Association not found');
            }
            redirectToAssociations(res);
        } catch (error) {
            res.writeHead(500);
            res.end('Database error: ' + error.message);
        }
    });
}

async function deleteAssociation(req, res, params) {
    try {
        const result = await pool.query('DELETE FROM associations WHERE id = $1 RETURNING *', [params.id]);
        if (result.rows.length === 0) {
            res.writeHead(404);
            return res.end('Association not found');
        }
        redirectToAssociations(res);
    } catch (error) {
        res.writeHead(500);
        res.end('Database error: ' + error.message);
    }
}

module.exports = { listAssociations, createAssociation, updateAssociation, deleteAssociation };