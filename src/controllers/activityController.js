const pool = require('../config/db');
const scheduleService = require('../services/scheduleService');
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



function redirectToActivities(res) {
    res.writeHead(302, { Location: '/activities' });
    res.end();
}

async function listActivities(req, res) {
    try {
        const activitiesResult = await pool.query('SELECT * FROM activities ORDER BY id');
        const facilitiesResult = await pool.query('SELECT * FROM facilities ORDER BY name');
        const associationsResult = await pool.query('SELECT * FROM associations ORDER BY name');
        render(res, 'activities.ejs', {
            activities: activitiesResult.rows,
            facilities: facilitiesResult.rows,
            associations: associationsResult.rows
        });
    } catch (error) {
        res.writeHead(500);
        res.end('Database error: ' + error.message);
    }
}

function createActivity(req, res) {
    parseBody(req, async (error, data) => {
        if (error) { res.writeHead(400); return res.end('Bad request'); }
        try {
            const { facility_id, association_id, name, sport_type, is_high_risk, age_category, base_price, max_capacity, subzone, day_of_week, start_time, end_time } = data;
            const tooManyPeople = await scheduleService.exceedsErpCapacity(facility_id, max_capacity);
            if (tooManyPeople) {
                res.writeHead(400);
                return res.end('Capacité dépasse la jauge de sécurité de la salle.');
            }
            const conflict = await scheduleService.hasScheduleConflict(facility_id, subzone || null, day_of_week, start_time, end_time);
            if(conflict){
                res.writeHead(400);
                return res.end('Ce créneau est déjà occupé dans cette salle.');
            }
            await pool.query(
                `INSERT INTO activities (facility_id, association_id, name, sport_type, is_high_risk, age_category, base_price, max_capacity, subzone, day_of_week, start_time, end_time)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
                [facility_id, association_id, name, sport_type, is_high_risk === 'true', age_category, base_price, max_capacity, subzone || null, day_of_week, start_time, end_time]
            );
            redirectToActivities(res);
        } catch (error) {
            res.writeHead(500);
            res.end('Database error: ' + error.message);
        }
    });
}

function updateActivity(req, res, params) {
    parseBody(req, async (error, data) => {
        if (error) { res.writeHead(400); return res.end('Bad request'); }
        try {
            const { facility_id, association_id, name, sport_type, is_high_risk, age_category, base_price, max_capacity, subzone, day_of_week, start_time, end_time } = data;
            const tooManyPeople = await scheduleService.exceedsErpCapacity(facility_id, max_capacity);
            if(tooManyPeople){
                res.writeHead(400);
                return res.end('Capacité dépasse la jauge de sécurité de la salle.');
            }
            const conflict = await scheduleService.hasScheduleConflict(facility_id, subzone || null, day_of_week, start_time, end_time, params.id);
            if (conflict) {
                res.writeHead(400);
                return res.end('Ce créneau est déjà occupé dans cette salle.');
            }
            const result = await pool.query(
                `UPDATE activities SET facility_id=$1, association_id=$2, name=$3, sport_type=$4, is_high_risk=$5, age_category=$6, base_price=$7, max_capacity=$8, subzone=$9, day_of_week=$10, start_time=$11, end_time=$12
                 WHERE id=$13 RETURNING *`,
                [facility_id, association_id, name, sport_type, is_high_risk === 'true', age_category, base_price, max_capacity, subzone || null, day_of_week, start_time, end_time, params.id]
            );
            if (result.rows.length === 0) {
                res.writeHead(404);
                return res.end('Activity not found');
            }
            redirectToActivities(res);
        } catch (error) {
            res.writeHead(500);
            res.end('Database error: ' + error.message);
        }
    });
}

async function deleteActivity(req, res, params) {
    try {
        const result = await pool.query('DELETE FROM activities WHERE id = $1 RETURNING *', [params.id]);
        if (result.rows.length === 0) {
            res.writeHead(404);
            return res.end('Activity not found');
        }
        redirectToActivities(res);
    } catch (error) {
        res.writeHead(500);
        res.end('Database error: ' + error.message);
    }
}

module.exports = { listActivities, createActivity, updateActivity, deleteActivity };