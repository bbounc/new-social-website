import Post from "../models/post.model.js";


export const getPostsByAffiliation = async (req, res) => {
    try {
        console.log("Request received at /api/posts/:affiliation with params:", req.params);

        const { affiliation } = req.params; // Expect 'liberal', 'conservative', or 'other'

        if (!["liberal", "conservative", "other"].includes(affiliation)) {
            console.log("Invalid affiliation received:", affiliation);
            return res.status(400).json({ error: "Invalid political affiliation" });
        }

        console.log("Fetching posts for affiliation:", affiliation);
        const posts = await Post.find({ politicalAffiliation: affiliation })
            .sort({ createdAt: -1 })
            .populate({
                path: "user",
                select: "-password",
            })
            .populate({
                path: "comments.user",
                select: "-password",
            });

        res.status(200).json(posts);
    } catch (error) {
        console.log("Error in getPostsByAffiliation controller: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
