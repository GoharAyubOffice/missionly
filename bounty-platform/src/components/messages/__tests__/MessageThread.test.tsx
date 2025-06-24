import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MessageThread } from '../MessageThread';

// Mock Supabase
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(() => 'SUBSCRIBED'),
    })),
    removeChannel: jest.fn(),
  },
}));

// Mock server actions
jest.mock('@/app/actions/messages', () => ({
  sendMessage: jest.fn(() => Promise.resolve({ success: true, messageId: 'new-message-id' })),
  markMessagesAsRead: jest.fn(() => Promise.resolve({ success: true })),
}));

const mockBounty = {
  id: 'bounty-1',
  title: 'Test Bounty',
  client: {
    id: 'client-1',
    name: 'Client User',
    avatar: null,
  },
  freelancer: {
    id: 'freelancer-1', 
    name: 'Freelancer User',
    avatar: null,
  },
};

const mockMessages = [
  {
    id: 'message-1',
    content: 'Hello there!',
    type: 'TEXT' as const,
    readAt: null,
    createdAt: new Date().toISOString(),
    sender: {
      id: 'freelancer-1',
      name: 'Freelancer User',
      avatar: null,
    },
  },
];

describe('MessageThread', () => {
  it('renders messages correctly', () => {
    render(
      <MessageThread
        threadId="thread-1"
        initialMessages={mockMessages}
        currentUserId="client-1"
        bounty={mockBounty}
      />
    );

    expect(screen.getByText('Test Bounty')).toBeInTheDocument();
    expect(screen.getByText('Hello there!')).toBeInTheDocument();
  });

  it('shows connection status indicator', () => {
    render(
      <MessageThread
        threadId="thread-1"
        initialMessages={mockMessages}
        currentUserId="client-1"
        bounty={mockBounty}
      />
    );

    // Should show connected indicator by default
    const statusIndicator = screen.getByTitle('Connected');
    expect(statusIndicator).toBeInTheDocument();
  });

  it('allows sending messages', async () => {
    const { sendMessage } = require('@/app/actions/messages');
    
    render(
      <MessageThread
        threadId="thread-1"
        initialMessages={mockMessages}
        currentUserId="client-1"
        bounty={mockBounty}
      />
    );

    const textarea = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByText('Send');

    fireEvent.change(textarea, { target: { value: 'New test message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalledWith('thread-1', 'New test message');
    });
  });

  it('shows optimistic updates for sent messages', async () => {
    render(
      <MessageThread
        threadId="thread-1"
        initialMessages={mockMessages}
        currentUserId="client-1"
        bounty={mockBounty}
      />
    );

    const textarea = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByText('Send');

    fireEvent.change(textarea, { target: { value: 'Optimistic message' } });
    fireEvent.click(sendButton);

    // Message should appear immediately (optimistic update)
    expect(screen.getByText('Optimistic message')).toBeInTheDocument();
    expect(screen.getByText('Sending...')).toBeInTheDocument();
  });
});