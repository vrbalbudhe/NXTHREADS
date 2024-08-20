const express = require("express");
const router = express.Router();
const { totalFollowingIo } = require("../Controller/sockets");

router.get("/total-following/:id", totalFollowingIo);

module.exports = router;
