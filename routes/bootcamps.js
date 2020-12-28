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


// Include other resource routres
const courseRouter = require('./courses');
const reviewRouter = require('./reviews')

const router = express.Router();

// advanced result
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter); //any one come with this is going to send on course Router.
router.use('/:bootcampId/reviews', reviewRouter);


router.route("/radius/:zipcode/:distance").get(getBootcampsInRadious);

router.route("/:id/photo").put(protect, authorize('publisher', 'admin'),bootcampPhotoUpload);

router.route("/").get(advancedResults(Bootcamp, 'courses'),getBootcamps).post(protect,authorize('publisher', 'admin'), createBootcamp);


router.route("/:id").get(getBootcamp).put(protect,authorize('publisher', 'admin'), updateBootcamp).delete(protect,authorize('publisher', 'admin'), deleteBootcamp);



module.exports = router;