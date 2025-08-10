import { supabase } from './supabase/client';

export interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type: 'message' | 'suggestion' | 'crisis_warning';
  created_at?: string;
}

export const chatService = {
  // Save a chat message to the database
  async saveMessage(message: ChatMessage): Promise<ChatMessage | null> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        return null;
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .insert([{
          user_id: user.id,
          content: message.content,
          sender: message.sender,
          type: message.type,
          timestamp: message.timestamp.toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error saving chat message:', error);
        return null;
      }

      return {
        ...data,
        timestamp: new Date(data.timestamp)
      };
    } catch (error) {
      console.error('Error in saveMessage:', error);
      return null;
    }
  },

  // Get chat history for the current user
  async getChatHistory(): Promise<ChatMessage[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        return [];
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: true })
        .limit(100); // Limit to last 100 messages

      if (error) {
        console.error('Error fetching chat history:', error);
        return [];
      }

      return data.map(message => ({
        ...message,
        timestamp: new Date(message.timestamp)
      }));
    } catch (error) {
      console.error('Error in getChatHistory:', error);
      return [];
    }
  },

  // Clear chat history
  async clearChatHistory(): Promise<boolean> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        return false;
      }

      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing chat history:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in clearChatHistory:', error);
      return false;
    }
  },

  // Get recent chat sessions (grouped by date)
  async getRecentSessions(): Promise<Array<{
    date: string;
    messageCount: number;
    lastMessage: string;
  }>> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        return [];
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching recent sessions:', error);
        return [];
      }

      // Group messages by date
      const sessions = data.reduce((acc: any, message) => {
        const date = new Date(message.timestamp).toDateString();
        if (!acc[date]) {
          acc[date] = {
            date,
            messageCount: 0,
            lastMessage: message.content
          };
        }
        acc[date].messageCount++;
        return acc;
      }, {});

      return Object.values(sessions);
    } catch (error) {
      console.error('Error in getRecentSessions:', error);
      return [];
    }
  }
};
