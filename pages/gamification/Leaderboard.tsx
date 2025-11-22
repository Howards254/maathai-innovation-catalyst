import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUsers } from '../../contexts/UserContext';

const Leaderboard = () => {
  const { getLeaderboard } = useUsers();
  const [timeFilter, setTimeFilter] = useState<'all' | 'month' | 'week'>('all');
  const leaderboard = getLeaderboard().slice(0, 50);

  return (
    <div className="bg-gray-50 min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                🏆 Leaderboard
              </h1>
              <p className="text-gray-600 text-sm mt-1">Top environmental champions making a difference</p>
            </div>
            
            {/* Time Filter */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['all', 'month', 'week'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all capitalize ${
                    timeFilter === filter
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {filter === 'all' ? 'All Time' : `This ${filter}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Top 3 Podium */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {leaderboard.slice(0, 3).map((user, index) => {
              const rank = index + 1;
              const isFirst = rank === 1;
              const podiumColors = {
                1: 'from-yellow-400 via-yellow-500 to-yellow-600',
                2: 'from-gray-300 via-gray-400 to-gray-500', 
                3: 'from-orange-400 via-orange-500 to-orange-600'
              };
              const medals = ['🥇', '🥈', '🥉'];
              
              return (
                <Link
                  key={user.id}
                  to={`/app/profile/${user.username}`}
                  className={`group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border-2 ${
                    isFirst ? 'border-yellow-200 md:scale-105' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  {isFirst && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        👑 Champion
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${podiumColors[rank as keyof typeof podiumColors]} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform`}>
                      {medals[index]}
                    </div>
                    
                    <div className="relative mb-4">
                      <img 
                        src={user.avatarUrl} 
                        alt={user.username} 
                        className="w-16 h-16 rounded-full mx-auto ring-4 ring-white shadow-lg" 
                      />
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        isFirst ? 'bg-yellow-500' : rank === 2 ? 'bg-gray-500' : 'bg-orange-500'
                      }`}>
                        #{rank}
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-gray-900 mb-1">{user.fullName}</h3>
                    <p className="text-sm text-gray-500 mb-3">@{user.username}</p>
                    
                    <div className="space-y-2">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full font-bold">
                        {user.impactPoints.toLocaleString()} pts
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.badges.length} badge{user.badges.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Full Rankings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              📊 Full Rankings
              <span className="text-green-100 text-sm font-normal">({leaderboard.length} participants)</span>
            </h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            {leaderboard.slice(3).map((user, index) => {
              const rank = index + 4;
              return (
                <Link 
                  key={user.id} 
                  to={`/app/profile/${user.username}`}
                  className="flex items-center px-6 py-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600 text-sm group-hover:bg-green-100 group-hover:text-green-700 transition-colors">
                    #{rank}
                  </div>
                  
                  <div className="ml-4 flex-shrink-0">
                    <img 
                      src={user.avatarUrl} 
                      alt={user.username} 
                      className="w-12 h-12 rounded-full ring-2 ring-gray-100 group-hover:ring-green-200 transition-all" 
                    />
                  </div>
                  
                  <div className="ml-4 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 truncate group-hover:text-green-700 transition-colors">
                        {user.fullName}
                      </p>
                      {user.badges.length > 5 && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
                          ⭐ Pro
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-green-600 text-lg">
                      {user.impactPoints.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <span>🏅</span>
                      {user.badges.length} badge{user.badges.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  <div className="ml-4 text-gray-400 group-hover:text-gray-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;