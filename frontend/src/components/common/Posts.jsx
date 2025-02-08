import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const Posts = ({ feedType, username, userId, affiliation }) => {
  const getPostEndpoint = () => {
    switch (feedType) {
      case "forYou":
        return `/api/affilaition/${affiliation}`; // Fetch by affiliation
      case "following":
        return "/api/posts/following"; // Fetch posts from users the current user follows
      case "posts":
        return `/api/posts/user/${username}`; // Fetch posts by specific user
      case "likes":
        return `/api/posts/likes/${userId}`; // Fetch posts liked by specific user
      default:
        return "/api/posts"; // Default endpoint when affiliation is not needed
    }
  };
 
  const POST_ENDPOINT = getPostEndpoint();
  console.log("Fetching from:", POST_ENDPOINT);
  const {
    data: posts,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["posts", affiliation], // Include affiliation only when needed
    queryFn: async () => {
      try {
        const res = await fetch(POST_ENDPOINT);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
  });

  useEffect(() => {
    refetch();
  }, [feedType, refetch, username, affiliation]); // Refetch when affiliation changes

  return (
    <>
      {(isLoading || isRefetching) && (
        <div className='flex flex-col justify-center'>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && !isRefetching && posts?.length === 0 && (
        <p className='text-center my-4'>No posts in this tab. Switch 👻</p>
      )}
      {!isLoading && !isRefetching && posts && (
        <div>
          {posts.map((post) => {
            // Define border color based on political affiliation
            const borderColor =
              post.user.politicalAffiliation === "conservative"
                ? "border-red-600 border-4"
                : post.user.politicalAffiliation === "liberal"
                ? "border-blue-600 border-4"
                : "border-gray-600 border-4";

            return <Post key={post._id} post={post} borderColor={borderColor} />;
          })}
        </div>
      )}
    </>
  );
};

export default Posts;
