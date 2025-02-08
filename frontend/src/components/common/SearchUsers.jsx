import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner"; // Assuming you have a LoadingSpinner component

// Fetch search results from the API
const fetchUsers = async (query) => {
  const response = await fetch(`/api/users/search?q=${query}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }
  return data;
};

const SearchUsers = () => {
  const [query, setQuery] = useState("");
  const { data: users, isLoading, isError } = useQuery(
    ["searchUsers", query],
    () => fetchUsers(query),
    {
      enabled: query.length > 0, // Only make the request if there's a query
    }
  );

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <input
        type="text"
        placeholder="Search for users..."
        className="input input-bordered input-primary w-full max-w-xs"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {isLoading && <LoadingSpinner size="sm" />}
      {isError && <p className="text-red-500">Error fetching users</p>}

      {query && !isLoading && !isError && users && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md max-h-60 overflow-auto z-10">
          <ul>
            {users.length === 0 ? (
              <li className="p-2">No users found</li>
            ) : (
              users.map((user) => (
                <li key={user._id} className="p-2 hover:bg-gray-100">
                  <Link to={`/profile/${user.username}`} className="flex items-center gap-2">
                    <img
                      src={user.profileImg || "/avatar-placeholder.png"}
                      alt={user.fullName}
                      className="w-8 h-8 rounded-full"
                    />
                    <span>{user.fullName}</span>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchUsers;
