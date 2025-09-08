import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, User, Users, ExternalLink, MapPin, Building, Calendar, Star, GitFork, X, Loader2 } from 'lucide-react';
import {useLocalStorage} from './hooks/useLocalStorage'
import {useGitHubAPI} from './hooks/useGithubApi'
import {useInfiniteScroll} from './hooks/useInfiniteScroll'
import {useDebounce} from './hooks/useDebounce'

const ErrorMessage = React.memo(({ message }) => (
  <div >
    {message}
  </div>
));

const LoadingSpinner = React.memo(({ text = "Loading..." }) => (
  <div >
    <span >{text}</span>
  </div>
));

const UserList = React.memo(({ users}) => {
  const memoizedUsers = useMemo(() => users, [users]);

  if (memoizedUsers.length === 0) {
    return (
      <div>
        <Users/>
        <p >No users found</p>
        <p >Try searching for a different username</p>
      </div>
    );
  }

  return (
    <div >
      {memoizedUsers.map((user) => (
        <UserCard
          key={`${user.id}-${user.login}`}
          user={user}
        />
      ))}
    </div>
  );
});

const UserCard = React.memo(({ user }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div>
        <img
          src={user.avatar_url}
          alt={user.login}
        
          onError={(e) => {
            e.target.src = `https://github.com/identicons/${user.login}.png`;
          }}
        />
        <div >
          <h3 >
            {user.login}
          </h3>
          <p >
            ID: {user.id}
          </p>
        </div>
        <ExternalLink style={{ width: '20px', height: '20px', color: '#9CA3AF' }} />
      </div>
      
      <div >
        <span>
          {user.type}
        </span>
        <span >
          Score: {Math.round((user.score || 0) * 100) / 100}
        </span>
      </div>
    </div>
  );
});

const SearchInput = React.memo(({ value, onChange, loading }) => {
  return (
    <div >
      <div style={{ position: 'relative' }}>
        <Search  />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search GitHub users..."
      
          onFocus={(e) => {
            e.target.style.borderColor = '#3B82F6';
            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#D1D5DB';
            e.target.style.boxShadow = 'none';
          }}
        />
        {loading && <Loader2  />}
      </div>
      <style>{`
        @keyframes spin {
          from { transform: translateY(-50%) rotate(0deg); }
          to { transform: translateY(-50%) rotate(360deg); }
        }
      `}</style>
    </div>
  );
});

const App = () => {
  const [searchQuery, setSearchQuery] = useLocalStorage('search-query', '');

  const [initialLoaded, setInitialLoaded] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const { users, loading, error, hasMore, fetchUsers, fetchUserDetails, loadMore } = useGitHubAPI();

  useEffect(() => {
    fetchUsers(debouncedSearchQuery);
    if (!initialLoaded) {
      setInitialLoaded(true);
    }
  }, [debouncedSearchQuery, fetchUsers, initialLoaded]);


  useInfiniteScroll(
    useCallback(() => loadMore(debouncedSearchQuery), [loadMore, debouncedSearchQuery]),
    hasMore,
    loading
  );



if(loading){
  return <h1>Loading...</h1>
}
  return (
    <div >
      <div >
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          loading={loading && users.length === 0}
        />

        {error && <ErrorMessage message={error} />}

        {!initialLoaded && !debouncedSearchQuery.trim() ? (
          <LoadingSpinner text="Loading popular users..." />
        ) : (
          <>
            <UserList users={users} />
            
            {loading && users.length > 0 && (
              <LoadingSpinner text="Loading more users..." />
            )}

            {!hasMore && users.length > 0 && (
              <div >
                🎉 You've reached the end! No more users to load.
              </div>
            )}
          </>
        )}

    
      </div>
    </div>
  );
};

export default App;