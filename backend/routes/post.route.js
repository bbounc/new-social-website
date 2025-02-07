import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
	commentOnPost,
	createPost,
	deletePost,
	getAllPosts,
	getFollowingPosts,
	getLikedPosts,
	getUserPosts,
	likeUnlikePost,
	getConservativePosts,
	getLiberalPosts,
	getOtherPosts,
} from "../controllers/post.controller.js";

const router = express.Router();

router.get("/all", protectRoute, getAllPosts);
router.get("/:politicalAffiliation", protectRoute, async (req, res, next) => {
	const { politicalAffiliation } = req.params;
  
	if (politicalAffiliation === "conservative") {
	  return getConservativePosts(req, res);
	} else if (politicalAffiliation === "liberal") {
	  return getLiberalPosts(req, res);
	} else if (politicalAffiliation === "other") {
	  return getOtherPosts(req, res);
	} else {
	  return res.status(400).json({ error: "Invalid political affiliation" });
	}
  });

router.get("/following", protectRoute, getFollowingPosts);
router.get("/likes/:id", protectRoute, getLikedPosts);
router.get("/user/:username", protectRoute, getUserPosts);
router.post("/create", protectRoute, createPost);
router.post("/like/:id", protectRoute, likeUnlikePost);
router.post("/comment/:id", protectRoute, commentOnPost);
router.delete("/:id", protectRoute, deletePost);

export default router;
