import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useFollow from "../../hooks/useFollow";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import LoadingSpinner from "./LoadingSpinner";

// Fetch current user info
const fetchCurrentUser = async () => {
  const res = await fetch("/api/auth/me");
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Something went wrong!");
  }
  return data;
};

const RightPanel = ({ setDisplayedAffiliation }) => { 
  if (typeof setDisplayedAffiliation !== "function") {
    console.error("setDisplayedAffiliation is not a function! Make sure it's passed correctly.");
    return null;
  }

  const { data: suggestedUsers, isLoading: isSuggestedUsersLoading } = useQuery({
    queryKey: ["suggestedUsers"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/users/suggested");
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong!");
        }
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  });

  const { data: currentUser, isLoading: isCurrentUserLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
  });

  const { follow, isPending } = useFollow();

  const affiliations = ["liberal", "conservative", "other"];
  const [displayedAffiliation, setLocalAffiliation] = useState("other");
  const [nextAffiliation, setNextAffiliation] = useState("liberal");
  const [timer, setTimer] = useState(1800000);

  useEffect(() => {
    if (currentUser) {
      const initialAffiliation = affiliations.find(
        (aff) => aff === currentUser.politicalAffiliation
      ) || "other";
      setLocalAffiliation(initialAffiliation);
      const nextIndex = (affiliations.indexOf(initialAffiliation) + 1) % affiliations.length;
      setNextAffiliation(affiliations[nextIndex]);
      setDisplayedAffiliation(initialAffiliation);
    }
  }, [currentUser, setDisplayedAffiliation]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTime) => {
        const newTime = prevTime - 1000;

        if (newTime <= 0) {
          const currentAffiliationIndex = affiliations.indexOf(displayedAffiliation);
          const nextAff = affiliations[(currentAffiliationIndex + 1) % affiliations.length];
          setLocalAffiliation(nextAff);
          setDisplayedAffiliation(nextAff);
          setNextAffiliation(affiliations[(currentAffiliationIndex + 2) % affiliations.length]);
          return 1800000;
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [displayedAffiliation, setDisplayedAffiliation]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <div className='hidden lg:block my-4 mx-2'>
      
        {/* Political Affiliation Display */}
        <div className="mb-4">
          <label className="block font-bold mb-1">Current Affiliation</label>
          <p className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black text-lg font-medium">
            {displayedAffiliation.charAt(0).toUpperCase() + displayedAffiliation.slice(1)}
          </p>
        </div>

        <div className="mb-4">
          <label className="block font-bold mb-1">Next Affiliation</label>
          <p className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black text-lg font-medium">
            {nextAffiliation.charAt(0).toUpperCase() + nextAffiliation.slice(1)}
          </p>
        </div>

        {/* Time Left Until Next Affiliation Change */}
        <div className="mb-4">
          <label className="block font-bold mb-1">Time till Next Change</label>
          <p className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black">
            {formatTime(timer)}
          </p>
        </div>

        {/* Who to follow section */}
        <p className='font-bold'>Who to follow</p>
        <div className='flex flex-col gap-4'>
          {(isSuggestedUsersLoading || isCurrentUserLoading) &&
            [...Array(4)].map((_, index) => (
              <RightPanelSkeleton key={`skeleton-${index}`} />
            ))}

          {!isSuggestedUsersLoading &&
            suggestedUsers?.map((user) => {
              const borderColor =
                user.politicalAffiliation === "conservative"
                  ? "border-red-600"
                  : user.politicalAffiliation === "liberal"
                  ? "border-blue-600"
                  : "border-gray-600";

              return (
                <Link
                  to={`/profile/${user.username}`}
                  className='flex items-center justify-between gap-4'
                  key={user._id}
                >
                  <div className='flex gap-2 items-center'>
                    <div className='avatar'>
                      <div className={`w-8 rounded-full border-4 ${borderColor}`}>
                        <img
                          src={user.profileImg || "/avatar-placeholder.png"}
                          alt={user.fullName}
                        />
                      </div>
                    </div>
                    <div className='flex flex-col'>
                      <span className='font-semibold tracking-tight truncate w-28'>
                        {user.fullName}
                      </span>
                      <span className='text-sm text-slate-500'>@{user.username}</span>
                    </div>
                  </div>
                  <button className='btn bg-white text-black rounded-full btn-sm' onClick={(e) => { e.preventDefault(); follow(user._id); }}>
                    {isPending ? <LoadingSpinner size='sm' /> : "Follow"}
                  </button>
                </Link>
              );
            })}
        </div>
      </div>
  );
};

export default RightPanel;