import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { clearOldDataOnce } from './utils/clearStorage';
import { AuthProvider } from './contexts/AuthContext';
import { CampaignProvider } from './contexts/CampaignContext';
import { UserProvider } from './contexts/UserContext';
import { DiscussionProvider } from './contexts/DiscussionContext';
import { EventProvider } from './contexts/EventContext';
import { GamificationProvider } from './contexts/GamificationContext';
import { InnovationProvider } from './contexts/InnovationContext';
import { StoriesProvider } from './contexts/StoriesContext';
import { MessagingProvider } from './contexts/MessagingContext';
import { GroupsProvider } from './contexts/GroupsContext';
import { LiveStreamProvider } from './contexts/LiveStreamContext';
import { ActivityFeedProvider } from './contexts/ActivityFeedContext';
import { MatchmakingProvider } from './contexts/MatchmakingContext';
import { FollowProvider } from './contexts/FollowContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import AppLayout from './components/layout/AppLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AuthCallback from './pages/auth/Callback';
import Dashboard from './pages/Dashboard';
import CampaignList from './pages/campaigns/CampaignList';
import CampaignDetails from './pages/campaigns/CampaignDetails';
import CreateCampaign from './pages/campaigns/CreateCampaign';
import Badges from './pages/gamification/Badges';
import EventsList from './pages/events/EventsList';
import DiscussionsFeed from './pages/discussions/DiscussionsFeed';
import DiscussionDetail from './pages/discussions/DiscussionDetail';
import UserProfile from './pages/profile/UserProfile';
import ProfileEdit from './pages/profile/ProfileEdit';
import Leaderboard from './pages/gamification/Leaderboard';
import ResourcesList from './pages/resources/ResourcesList';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import CreateEvent from './pages/events/CreateEvent';
import EventDetails from './pages/events/EventDetails';
import InnovationHub from './pages/innovation/InnovationHub';
import SubmitInnovation from './pages/innovation/SubmitInnovation';
import MyProjects from './pages/innovation/MyProjects';
import InnovationDetails from './pages/innovation/InnovationDetails';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Stories from './pages/Stories';
import Messages from './pages/Messages';
import Groups from './pages/Groups';
import LiveStreams from './pages/LiveStreams';
import LiveFeed from './pages/LiveFeed';
import GreenMatchmaking from './pages/GreenMatchmaking';

// Placeholder components for routes not fully detailed yet
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-8 text-center bg-white rounded-lg shadow-sm border border-gray-200">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
    <p className="text-gray-500">This feature is currently under development.</p>
  </div>
);

const App: React.FC = () => {
  // Clear old mock data on first run
  useEffect(() => {
    clearOldDataOnce();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <UserProvider>
        <DiscussionProvider>
          <EventProvider>
            <GamificationProvider>
              <InnovationProvider>
                <CampaignProvider>
                  <StoriesProvider>
                    <MessagingProvider>
                      <GroupsProvider>
                        <LiveStreamProvider>
                          <ActivityFeedProvider>
                            <MatchmakingProvider>
                              <FollowProvider>
                <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        {/* App Routes (Protected Layout) */}
        <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Campaigns */}
          <Route path="campaigns" element={<CampaignList />} />
          <Route path="campaigns/:id" element={<CampaignDetails />} />
          <Route path="campaigns/create" element={<CreateCampaign />} />

          {/* Events */}
          <Route path="events" element={<EventsList />} />
          <Route path="events/create" element={<CreateEvent />} />
          <Route path="events/:id" element={<EventDetails />} />

          {/* Discussions */}
          <Route path="discussions" element={<DiscussionsFeed />} />
          <Route path="discussions/:id" element={<DiscussionDetail />} />

          {/* Resources */}
          <Route path="resources" element={<ResourcesList />} />

          {/* Profile & Gamification */}
          <Route path="profile/:username" element={<UserProfile />} />
          <Route path="profile/:username/edit" element={<ProfileEdit />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="badges" element={<Badges />} />

          {/* Innovation Hub */}
          <Route path="innovation" element={<InnovationHub />} />
          <Route path="innovation/submit" element={<SubmitInnovation />} />
          <Route path="innovation/my-projects" element={<MyProjects />} />
          <Route path="innovation/:id" element={<InnovationDetails />} />
          
          {/* Admin */}
          <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          
          {/* Social Features */}
          <Route path="stories" element={<Stories />} />
          <Route path="messages" element={<Messages />} />
          <Route path="groups" element={<Groups />} />
          
          {/* Live Features */}
          <Route path="live-streams" element={<LiveStreams />} />
          <Route path="live-feed" element={<LiveFeed />} />
          
          {/* Matchmaking */}
          <Route path="matchmaking" element={<GreenMatchmaking />} />
          
          {/* Marketplace */}
          <Route path="marketplace" element={<Placeholder title="Tree Exchange Marketplace" />} />
        </Route>
      </Routes>
          </HashRouter>
                              </FollowProvider>
                            </MatchmakingProvider>
                          </ActivityFeedProvider>
                        </LiveStreamProvider>
                      </GroupsProvider>
                    </MessagingProvider>
                  </StoriesProvider>
                </CampaignProvider>
              </InnovationProvider>
            </GamificationProvider>
          </EventProvider>
        </DiscussionProvider>
          </UserProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;