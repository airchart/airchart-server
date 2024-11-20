const express = require("express");
const router = express.Router();
const crawlingController = require("../controllers/crawlingController");

router.post("/start", crawlingController.startCrawling);
router.post("/stop", crawlingController.stopCrawling);

module.exports = router;
