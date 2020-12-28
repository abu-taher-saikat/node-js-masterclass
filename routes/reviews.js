const express = require("express");
const Review = require('../models/Review');

const {
    getReviews
} = require("../controllers/reviews");

const router = express.Router({ mergeParams : true});

const advancedResults = require('../middleware/advancedResults');
const { protect , authorize } = require('../middleware/auth');



router.route('/')
    .get(advancedResults(Review,{ path : 'bootcamp', select : 'name description'}), getReviews);




module.exports = router;
