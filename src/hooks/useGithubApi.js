import { useState, useCallback } from "react";
export const useGitHubAPI = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetchUsers = useCallback(async (query, pageNum = 1, append = false) => {
    setLoading(true);
    setError(null);

    try {
      const url = query.trim() 
        ? `https://api.github.com/search/users?q=${encodeURIComponent(query)}&page=${pageNum}&per_page=30`
        :`https://api.github.com/search/users?q=USERNAME&page=1&per_page=30`
        // : `https://api.github.com/search/users?q=followers:>1000&sort=followers&order=desc&page=${pageNum}&per_page=30`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (append) {
        setUsers(prev => [...prev, ...data.items]);
      } else {
        setUsers(data.items);
        setPage(pageNum);
      }

      setHasMore(data.items.length === 30 && data.total_count > pageNum * 30);
    } catch (err) {
      setError(err.message);
      if (!append) {
        setUsers([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserDetails = useCallback(async (username) => {
    try {
      const response = await fetch(`https://api.github.com/users/${username}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Failed to fetch user details:', err);
      throw err;
    }
  }, []);

  const loadMore = useCallback((query) => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchUsers(query, nextPage, true);
    }
  }, [loading, hasMore, page, fetchUsers]);

  return {
    users,
    loading,
    error,
    hasMore,
    fetchUsers,
    fetchUserDetails,
    loadMore
  };
};