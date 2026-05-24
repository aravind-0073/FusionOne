const { Room, LiveQueue } = require('../models');

class SocketService {
  /**
   * Handle user joining a room
   */
  static async handleRoomJoin(io, socket, { roomId, userId, username }) {
    try {
      socket.join(roomId);
      
      // Update room participants
      await Room.findByIdAndUpdate(
        roomId,
        {
          $push: {
            currentParticipants: {
              userId,
              username,
              joinedAt: new Date(),
              role: 'viewer'
            }
          },
          $inc: { participantCount: 1 },
          lastActivityAt: new Date()
        }
      );

      // Notify others
      io.to(roomId).emit('userJoined', {
        userId,
        username,
        timestamp: new Date()
      });

      // Send current queue to new user
      const queue = await LiveQueue.findOne({ roomId });
      socket.emit('queueSync', queue);
    } catch (error) {
      socket.emit('error', { message: 'Failed to join room' });
    }
  }

  /**
   * Handle queue update
   */
  static async handleQueueUpdate(io, socket, { roomId, items }) {
    try {
      await LiveQueue.findOneAndUpdate(
        { roomId },
        {
          items,
          totalItems: items.length,
          updatedAt: new Date()
        }
      );

      io.to(roomId).emit('queueUpdated', { items });
    } catch (error) {
      socket.emit('error', { message: 'Failed to update queue' });
    }
  }

  /**
   * Handle vote on queue item
   */
  static async handleVote(io, socket, { roomId, queueItemId, userId, voteType }) {
    try {
      const queue = await LiveQueue.findOne({ roomId });
      
      const item = queue.items.find(i => i.queueItemId.toString() === queueItemId);
      if (item) {
        if (voteType === 'upvote') {
          item.votes += 1;
        } else {
          item.votes = Math.max(0, item.votes - 1);
        }
      }

      await queue.save();
      
      // Re-sort and emit
      queue.items.sort((a, b) => b.votes - a.votes);
      io.to(roomId).emit('voteUpdated', { items: queue.items });
    } catch (error) {
      socket.emit('error', { message: 'Failed to vote' });
    }
  }

  /**
   * Handle message in room
   */
  static async handleMessage(io, socket, { roomId, userId, username, message }) {
    try {
      const cleanMessage = message.substring(0, 500); // Limit message length
      
      await Room.findByIdAndUpdate(
        roomId,
        {
          $push: {
            chatHistory: {
              userId,
              username,
              message: cleanMessage,
              timestamp: new Date()
            }
          }
        }
      );

      io.to(roomId).emit('newMessage', {
        userId,
        username,
        message: cleanMessage,
        timestamp: new Date()
      });
    } catch (error) {
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  /**
   * Handle user leaving room
   */
  static async handleRoomLeave(io, socket, { roomId, userId }) {
    try {
      socket.leave(roomId);
      
      await Room.findByIdAndUpdate(
        roomId,
        {
          $pull: { currentParticipants: { userId } },
          $inc: { participantCount: -1 },
          lastActivityAt: new Date()
        }
      );

      io.to(roomId).emit('userLeft', {
        userId,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  }
}

module.exports = SocketService;
