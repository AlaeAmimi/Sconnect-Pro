
const pool = require('../config/db');
async function exceedsErpCapacity(facility_id, max_capacity) {
    const result = await pool.query('SELECT * FROM facilities WHERE id = $1', [facility_id]);
    if(result.rows.length === 0) throw new Error('Facility not found');
    const facility = result.rows[0];
    return facility.erp_capacity < max_capacity;
}

function normalizeTime(t) {
    return t.length === 5 ? t + ':00' : t;
}

async function hasScheduleConflict(facility_id, subzone, day_of_week, start_time, end_time, excludeActivityId = null) {
    const normalizedStart = normalizeTime(start_time);
    const normalizedEnd = normalizeTime(end_time);
    let query = 'SELECT * FROM activities WHERE facility_id = $1 AND day_of_week = $2';
    let values = [facility_id, day_of_week];

    if(excludeActivityId){
        query += ' AND id != $3';
        values.push(excludeActivityId);
    }
    const result = await pool.query(query, values);
    const otherActivities = result.rows;

    for(const activity of otherActivities){
        const sameSubZone = activity.subzone === subzone || activity.subzone === null || subzone === null;
        if(!sameSubZone){
            continue;
        }
        const overlaps = normalizedStart < activity.end_time && activity.end_time < normalizedEnd;
        if(overlaps){
            return true;
        }
    }
    return false;
}

module.exports = { exceedsErpCapacity, hasScheduleConflict };