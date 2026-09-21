    const fs = require('fs');
    const ejs = require('ejs');
    const path = require('path');
    const FindMyWay = require('find-my-way');
    
    const router = FindMyWay();
    router.on('GET', '/style.css', (req, res) => {
        fs.readFile('public/css/style.css', (err, data) => {
            if (err) {
            res.writeHead(404);
            res.end("File not found");
        } else {
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.end(data);
        }
    });
});

const homeController = require('../controllers/homeController');
router.on('GET', '/', homeController.home);
const facilityController = require('../controllers/facilityController');
const associationController = require('../controllers/associationController');
const activityController = require('../controllers/activityController');
const memberController = require('../controllers/memberController');
router.on('GET', '/facilities', facilityController.listFacilities);
router.on('POST', '/facilities', facilityController.createFacility);
router.on('POST', '/facilities/:id/update', facilityController.updateFacility);
router.on('POST', '/facilities/:id/delete', facilityController.deleteFacility);

router.on('GET', '/associations', associationController.listAssociations);
router.on('POST', '/associations', associationController.createAssociation);
router.on('POST', '/associations/:id/update', associationController.updateAssociation);
router.on('POST', '/associations/:id/delete', associationController.deleteAssociation);

router.on('GET', '/activities', activityController.listActivities);
router.on('POST', '/activities', activityController.createActivity);
router.on('POST', '/activities/:id/update', activityController.updateActivity);
router.on('POST', '/activities/:id/delete', activityController.deleteActivity);

router.on('GET', '/members', memberController.listMembers);
router.on('POST', '/members', memberController.createMember);
router.on('POST', '/members/:id/update', memberController.updateMember);
router.on('POST', '/members/:id/delete', memberController.deleteMember);
module.exports = router;