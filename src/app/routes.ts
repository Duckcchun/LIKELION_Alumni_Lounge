import { createBrowserRouter } from 'react-router';
import { Layout } from './pages/Layout';
import { Home } from './pages/Home';
import { Vote } from './pages/Vote';
import { Submit } from './pages/Submit';
import { Feedback } from './pages/Feedback';
import { FeedbackAdmin } from './pages/FeedbackAdmin';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'vote', Component: Vote },
      { path: 'submit', Component: Submit },
      { path: 'feedback', Component: Feedback },
      { path: 'feedback/admin', Component: FeedbackAdmin },
    ],
  },
]);