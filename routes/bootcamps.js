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

const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);


router.route("/radius/:zipcode/:distance").get(getBootcampsInRadious);

router.route("/:id/photo").put(protect, authorize('publisher', 'admin'),bootcampPhotoUpload);

router.route("/").get(advancedResults(Bootcamp, 'courses'),getBootcamps).post(protect,authorize('publisher', 'admin'), createBootcamp);


router.route("/:id").get(getBootcamp).put(protect,authorize('publisher', 'admin'), updateBootcamp).delete(protect,authorize('publisher', 'admin'), deleteBootcamp);



module.exports = router;