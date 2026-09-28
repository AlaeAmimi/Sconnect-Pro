// src/controllers/memberController.js
const pool = require('../config/db');
const parseBody = require('../core/bodyParser');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
const { getAgeCategory, isMedicalCertificateValid } = require('../services/eligibilityService');

function render(res, viewName, data) {
    const filepath = path.join(__dirname, "..", "..", "views", "pages", viewName);
    const template = fs.readFileSync(filepath, "utf-8");
    const html = ejs.render(template, data);

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
}

function redirectToMembers(res) {
    res.writeHead(302, { Location: '/members' });
    res.end();
}

async function listMembers(req, res) {
    try {
        const membersResult = await pool.query('SELECT * FROM members ORDER BY id');
        const familiesResult = await pool.query('SELECT * FROM families ORDER BY name');

        const membersWithEligibility = membersResult.rows.map(member => ({...member,
            age_category: getAgeCategory(member.birth_date),
            certificate_valid: isMedicalCertificateValid(member.medical_certificate_date, false)
        }));

        render(res, 'members.ejs', {
            members: membersWithEligibility,
            families: familiesResult.rows
        });
    } catch (error) {
        res.writeHead(500);
        res.end('Database error: ' + error.message);
    }
}

function createMember(req, res) {
    parseBody(req, async (error, data) => {
        if (error) { res.writeHead(400); return res.end('Bad request'); }
        try {
            const { family_id, first_name, last_name, birth_date, is_resident, medical_certificate_date, pass_sport_code } = data;
            await pool.query(
                `INSERT INTO members (family_id, first_name, last_name, birth_date, is_resident, medical_certificate_date, pass_sport_code)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [family_id, first_name, last_name, birth_date, is_resident === 'true', medical_certificate_date || null, pass_sport_code || null]
            );
            redirectToMembers(res);
        } catch (error) {
            res.writeHead(500);
            res.end('Database error: ' + error.message);
        }
    });
}

function updateMember(req, res, params) {
    parseBody(req, async (error, data) => {
        if (error) { res.writeHead(400); return res.end('Bad request'); }
        try {
            const { family_id, first_name, last_name, birth_date, is_resident, medical_certificate_date, pass_sport_code } = data;
            const result = await pool.query(
                `UPDATE members SET family_id=$1, first_name=$2, last_name=$3, birth_date=$4, is_resident=$5, medical_certificate_date=$6, pass_sport_code=$7
                 WHERE id=$8 RETURNING *`,
                [family_id, first_name, last_name, birth_date, is_resident === 'true', medical_certificate_date || null, pass_sport_code || null, params.id]
            );
            if (result.rows.length === 0) {
                res.writeHead(404);
                return res.end('Member not found');
            }
            redirectToMembers(res);
        } catch (error) {
            res.writeHead(500);
            res.end('Database error: ' + error.message);
        }
    });
}

async function deleteMember(req, res, params) {
    try {
        const result = await pool.query('DELETE FROM members WHERE id = $1 RETURNING *', [params.id]);
        if (result.rows.length === 0) {
            res.writeHead(404);
            return res.end('Member not found');
        }
        redirectToMembers(res);
    } catch (error) {
        res.writeHead(500);
        res.end('Database error: ' + error.message);
    }
}

module.exports = { listMembers, createMember, updateMember, deleteMember };