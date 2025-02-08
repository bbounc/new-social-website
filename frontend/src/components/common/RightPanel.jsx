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

const RightPanel = ({ setDisplayedAffiliation }) => { // Ensure prop is received
  if (typeof setDisplayedAffiliation !== "function") {
    console.error("setDisplayedAffiliation is not a function! Make sure it's passed correctly.");
    return null; // Avoid rendering component if the function is missing
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
  const [displayedAffiliation, setLocalAffiliation] = useState("");
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const savedTime = localStorage.getItem("timer");
    if (savedTime) {
      setTimer(Number(savedTime));
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      const initialAffiliation = currentUser.politicalAffiliation || "other";
      setLocalAffiliation(initialAffiliation);
      setDisplayedAffiliation(initialAffiliation); // Update HomePage state

      const now = Date.now();
      const savedTime = localStorage.getItem("timer");

      if (savedTime) {
        setTimer(Number(savedTime));
      } else {
        const timeLeft = (30 * 60 * 1000) - (now % (30 * 60 * 1000));
        setTimer(timeLeft);
        localStorage.setItem("timer", timeLeft);
      }
    }
  }, [currentUser, setDisplayedAffiliation]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTime) => {
        const newTime = prevTime - 1000;
        localStorage.setItem("timer", newTime);

        if (newTime <= 0) {
          const currentAffiliationIndex = affiliations.indexOf(displayedAffiliation);
          const nextAffiliation = affiliations[(currentAffiliationIndex + 1) % affiliations.length];
          setLocalAffiliation(nextAffiliation);
          setDisplayedAffiliation(nextAffiliation); // Update HomePage state
          localStorage.setItem("timer", 30 * 60 * 1000);
          return 30 * 60 * 1000;
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [displayedAffiliation, setDisplayedAffiliation]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / (1000 * 60));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <div className='hidden lg:block my-4 mx-2'>
      <div className='bg-primary p-4 rounded-md sticky top-2'>
        {/* Political Affiliation Display */}
        <div className="mb-4">
          <label className="block font-bold mb-1">Your Affiliation</label>
          <div className="relative">
            <p className="w-full p-2 border border-gray-300 rounded-md bg-white text-black">
              {displayedAffiliation}
            </p>
          </div>
        </div>

        {/* Time Left Until Next Affiliation Change */}
        <div className="mb-4">
          <label className="block font-bold mb-1">Time till Next Change</label>
          <div className="relative">
            <p className="w-full p-2 border border-gray-300 rounded-md bg-white text-black">
              {formatTime(timer)}
            </p>
          </div>
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
                  <div>
                    <button className='btn bg-white text-black rounded-full btn-sm' onClick={(e) => { e.preventDefault(); follow(user._id); }}>
                      {isPending ? <LoadingSpinner size='sm' /> : "Follow"}
                    </button>
                  </div>
                </Link>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
