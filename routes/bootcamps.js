const express = require("express");
const {
    getBootcamps,
    getBootcamp,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampsInRadious,
    bootcampPhotoUpload
} = require("../controllers/bootcamps");

const Bootcamp = require('../models/Bootcamp');
// advanced result
const advancedResults = require('../middleware/advancedResults');


// Include other resource routres
const courseRouter = require('./courses');

const router = express.Router();

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);


router.route("/radius/:zipcode/:distance").get(getBootcampsInRadious);

router.route("/:id/photo").put(bootcampPhotoUpload);

router.route("/").get(advancedResults(Bootcamp, 'courses'),getBootcamps).post(createBootcamp);


router.route("/:id").get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp);



module.exports = router;