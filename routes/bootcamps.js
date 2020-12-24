const express = require("express");
const {
    getBootcamps,
    getBootcamp,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampsInRadious
} = require("../controllers/bootcamps");

// Include other resource routres
const courseRouter = require('./courses');

const router = express.Router();

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);


router.route("/radius/:zipcode/:distance").get(getBootcampsInRadious);

router.route("/").get(getBootcamps).post(createBootcamp);


router.route("/:id").get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp);



module.exports = router;