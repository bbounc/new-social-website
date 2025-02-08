import { useState } from "react";
import Posts from "../../components/common/Posts";
import CreatePost from "./CreatePost";
import RightPanel from "../../components/common/RightPanel";
import SearchUsers from "../../components/common/SearchUsers";  // Import the SearchUsers component

const FeedTabs = ({ feedType, setFeedType }) => {
  return (
    <div className='flex w-full border-b border-gray-700'>
      {["forYou", "following"].map((type) => (
        <div
          key={type}
          className='flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 cursor-pointer relative'
          onClick={() => setFeedType(type)}
        >
          {type === "forYou" ? "For you" : "Following"}
          {feedType === type && (
            <div className='absolute bottom-0 w-10 h-1 rounded-full bg-primary'></div>
          )}
        </div>
      ))}
    </div>
  );
};

const HomePage = () => {
  const [feedType, setFeedType] = useState("forYou");
  const [displayedAffiliation, setDisplayedAffiliation] = useState("other");

  return (
    <div className='flex min-h-screen justify-center'>
      {/* Main Content (Ensuring consistent width and preventing shrinking) */}
      <div className='flex-[4] min-w-[600px] max-w-[800px] border-r border-gray-700'>
        <FeedTabs feedType={feedType} setFeedType={setFeedType} />
        
        {/* Place the Search Bar under the profile section */}
        <div className="mt-4">
          <SearchUsers /> {/* This will be your search bar */}
        </div>

        <CreatePost />
        <Posts feedType={feedType} affiliation={displayedAffiliation} />
      </div>

      {/* Right Panel */}
      <div className='flex-[1] hidden md:block'>
        <RightPanel setDisplayedAffiliation={setDisplayedAffiliation} />
      </div>
    </div>
  );
};

export default HomePage;
