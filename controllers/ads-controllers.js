const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const Ad = require("../models/ad");
const User = require("../models/user");

const getAdById = async (req, res, next) => {
  const adId = req.params.aid;

  let ad;
  try {
    ad = await Ad.findById(adId);
  } catch (err) {
    const error = new HttpError(
      "Could not find Ad masla hogaya, please try again",
      500
    );
    return next(error);
  }

  if (!ad) {
    return next(
      new HttpError("Could not find a place for the provided user id.", 404)
    );
  }
  res.json({ ad: ad.toObject({ getters: true }) });
};

const getAdsByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  // let ads;
  let userWithAds;
  try {
    userWithAds = await User.findById(userId).populate("ads");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a place BY THIS USER ID.",
      500
    );
    return next(error);
  }
  if (!userWithAds || userWithAds.ads.length === 0) {
    return next(
      new HttpError("Could not find a place for the provided user id.", 404)
    );
  }
  // 'find' returns array aur array pe toObject() nhy laga sakte
  res.json({
    ads: userWithAds.ads.map((ad) => ad.toObject({ getters: true })),
  });
};

const createAd = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Error in input validation", 422));
  }
  const { title, description, rent, address, creator } = req.body;

  const createdAd = new Ad({
    title,
    description,
    rent,
    address,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQZ10O4O6BdT1_V2LRcJJhTKRyVaBLu18frYtckSYjujrUcZl4a&usqp=CAU",
    creator,
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    return next(
      new HttpError(
        "Creating AD failed try again jani masal hogaya. q k is id ka user nhy mila",
        422
      )
    );
  }

  if (!user) {
    return next(new HttpError("Could not find user for provided Id", 404));
  }
  console.log(user);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdAd.save({ session: sess });
    user.ads.push(createdAd);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(
      new HttpError("Creating ad failed bhai at session,try dubara", 500)
    );
  }

  // try {
  //   await createdAd.save();
  // } catch (err) {
  //   const error = new HttpError("Creating Ad failed,please try again", 500);
  //   return next(error);
  // }

  res.status(201).json({ ad: createdAd });
};

const updateAd = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Error in input validation", 422));
  }

  const { title, description, rent, address } = req.body;
  const adId = req.params.aid;
  // const updatedAd = new Ad({
  //   title,
  //   description,
  //   rent,
  //   address,
  // });

  let ad;
  try {
    ad = await Ad.findById(adId);
  } catch (err) {
    const error = new HttpError("Updtaing Ad failed,please try again", 500);
    return next(error);
  }
  // const adIndex = DUMMY_ADS.findIndex((a) => a.id === adId);
  ad.title = title;
  ad.description = description;
  ad.rent = rent;
  ad.address = address;

  try {
    await ad.save();
  } catch (err) {
    const error = new HttpError(
      "Updtaing Ad failed in SAVING,please try again",
      500
    );
    return next(error);
  }

  res.status(200).json({ ad: ad.toObject({ getters: true }) });
};

const deleteAd = async (req, res, next) => {
  const adId = req.params.aid;
  let ad;
  try {
    ad = await Ad.findById(adId).populate("creator");
  } catch (err) {
    return next(new HttpError("kusch masla hogya", 500));
  }

  if (!ad) {
    return next(new HttpError("Ad not found of this ID", 404));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await ad.remove({ session: sess });
    ad.creator.ads.pull(ad);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Deleting Ad failed in deleting,please try again",
      500
    );
    return next(error);
  }
  res.status(200).json({ message: "Ad Deleted" });
};

exports.getAdById = getAdById;
exports.getAdsByUserId = getAdsByUserId;
exports.createAd = createAd;
exports.updateAd = updateAd;
exports.deleteAd = deleteAd;
