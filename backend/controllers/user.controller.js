import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

// models
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

export const getUserProfile = async (req, res) => {
	const { username } = req.params;

	try {
		const user = await User.findOne({ username }).select("-password");
		if (!user) return res.status(404).json({ message: "User not found" });

		res.status(200).json(user);
	} catch (error) {
		console.log("Error in getUserProfile: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

export const followUnfollowUser = async (req, res) => {
	try {
		const { id } = req.params;
		const userToModify = await User.findById(id);
		const currentUser = await User.findById(req.user._id);

		if (id === req.user._id.toString()) {
			return res.status(400).json({ error: "You can't follow/unfollow yourself" });
		}

		if (!userToModify || !currentUser) return res.status(400).json({ error: "User not found" });

		const isFollowing = currentUser.following.includes(id);

		if (isFollowing) {
			// Unfollow the user
			await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
			await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

			res.status(200).json({ message: "User unfollowed successfully" });
		} else {
			// Follow the user
			await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
			await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
			// Send notification to the user
			const newNotification = new Notification({
				type: "follow",
				from: req.user._id,
				to: userToModify._id,
			});

			await newNotification.save();

			res.status(200).json({ message: "User followed successfully" });
		}
	} catch (error) {
		console.log("Error in followUnfollowUser: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

export const getSuggestedUsers = async (req, res) => {
	try {
		const userId = req.user._id;

		// Get the list of users the current user is following
		const usersFollowedByMe = await User.findById(userId).select("following");

		// Get the current user's political affiliation
		const affiliation = await User.findById(userId).select("politicalAffiliation");

		// Get users with the same political affiliation (same as the current user)
		const sameAffiliationUsers = await User.aggregate([
			{
				$match: {
					_id: { $ne: userId }, // Exclude the current user
					politicalAffiliation: affiliation, // Match same affiliation
				},
			},
			{ $sample: { size: 5 } }, // Get a random sample of 5 users
		]);

		// Get users with a different political affiliation (not the same as the current user)
		const differentAffiliationUsers = await User.aggregate([
			{
				$match: {
					_id: { $ne: userId }, // Exclude the current user
					politicalAffiliation: { $ne: affiliation }, // Match a different affiliation
				},
			},
			{ $sample: { size: 5 } }, // Get a random sample of 5 users
		]);

		// Balance the selection, choose 2 users from each group (same affiliation and different affiliation)
		const balancedUsers = [
			...sameAffiliationUsers.slice(0, 4),  // Take 2 users from the same affiliation
			...differentAffiliationUsers.slice(0, 4),  // Take 2 users from a different affiliation
		];

		// Filter out users already followed by the current user
		const filteredUsers = balancedUsers.filter((user) => !usersFollowedByMe.following.includes(user._id));

		// Shuffle the filtered users and ensure only 4 users are returned
		const suggestedUsers = shuffleArray(filteredUsers).slice(0, 4); // Ensure 4 users in the response

		// Remove sensitive data like password before returning the users
		suggestedUsers.forEach((user) => (user.password = null));

		// Send the final list of suggested users
		console.log(suggestedUsers)
		res.status(200).json(suggestedUsers);
	} catch (error) {
		console.log("Error in getSuggestedUsers: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

// Shuffle function to randomize user order
const shuffleArray = (array) => {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));  // Random index
		[array[i], array[j]] = [array[j], array[i]];  // Swap elements
	}
	return array;
};


export const updateUser = async (req, res) => {
	const { fullName, email, username, currentPassword, newPassword, bio, link, politicalAffiliation } = req.body;
	let { profileImg, coverImg } = req.body;

	const userId = req.user._id;

	try {
		let user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });

		if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
			return res.status(400).json({ error: "Please provide both current password and new password" });
		}

		if (currentPassword && newPassword) {
			const isMatch = await bcrypt.compare(currentPassword, user.password);
			if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });
			if (newPassword.length < 6) {
				return res.status(400).json({ error: "Password must be at least 6 characters long" });
			}

			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(newPassword, salt);
		}

		if (profileImg) {
			if (user.profileImg) {
				// https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
				await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
			}

			const uploadedResponse = await cloudinary.uploader.upload(profileImg);
			profileImg = uploadedResponse.secure_url;
		}

		if (coverImg) {
			if (user.coverImg) {
				await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
			}

			const uploadedResponse = await cloudinary.uploader.upload(coverImg);
			coverImg = uploadedResponse.secure_url;
		}

		user.fullName = fullName || user.fullName;
		user.email = email || user.email;
		user.username = username || user.username;
		user.bio = bio || user.bio;
		user.link = link || user.link;
		user.profileImg = profileImg || user.profileImg;
		user.coverImg = coverImg || user.coverImg;

		user = await user.save();

		// password should be null in response
		user.password = null;

		return res.status(200).json(user);
	} catch (error) {
		console.log("Error in updateUser: ", error.message);
		res.status(500).json({ error: error.message });
	}
};



export const searchUsers = async (req, res) => {
	const query = req.query.query?.trim() || ''; // Match frontend request & trim whitespace
  
	if (!query) {
	  return res.status(400).json({ error: "Search query is required" });
	}
  
	try {
	  // Perform a case-insensitive search on username & fullName fields
	  const users = await User.find({
		$or: [
		  { username: { $regex: query, $options: "i" } },
		  { fullName: { $regex: query, $options: "i" } }
		]
	  })
		.limit(10) // Limit results to prevent large responses
		.select("username fullName profileImg politicalAffiliation"); // Only return necessary fields
  
	  if (users.length === 0) {
		return res.status(404).json({ message: "No users found" });
	  }
  
	  res.status(200).json(users);
	} catch (error) {
	  console.error("Error in searchUsers:", error.message);
	  res.status(500).json({ error: "Internal server error" });
	}
  };
  
