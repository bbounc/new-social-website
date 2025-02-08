import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		text: {
			type: String,
		},
		img: {
			type: String,
		},
		politicalAffiliation: {
			type: String,
			enum: ["liberal", "conservative", "other"], // Ensures only valid options are set
		},
		likes: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		comments: [
			{
				text: {
					type: String,
					required: true,
				},
				user: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
					required: true,
				},
				politicalAffiliation: {
					type: String,
					enum: ["liberal", "conservative", "other"], // Ensures only valid options are set
				},
			},
		],
	},
	{ timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
