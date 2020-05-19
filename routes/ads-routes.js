const express = require("express");
const { check } = require("express-validator");
const adsControllers = require("../controllers/ads-controllers");

const router = express.Router();

router.get("/:aid", adsControllers.getAdById);

router.get("/user/:uid", adsControllers.getAdsByUserId);

router.post(
  "/",
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
    check("rent").not().isEmpty(),
  ],
  adsControllers.createAd
);

router.patch(
  "/:aid",
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
    check("rent").not().isEmpty(),
  ],
  adsControllers.updateAd
);

router.delete("/:aid", adsControllers.deleteAd);

module.exports = router;
