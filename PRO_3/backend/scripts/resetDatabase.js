const mongoose = require('mongoose');
const User = require('../models/userModel');
const Problem = require('../models/problemModel');
const Chat = require('../models/chatModel');
const Notification = require('../models/notificationModel');
require('dotenv').config();

const resetDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear all collections
    await User.deleteMany({});
    await Problem.deleteMany({});
    await Chat.deleteMany({});
    await Notification.deleteMany({});
    console.log('All collections cleared');

    // Create sample users with proper data
    const users = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        points: 1000,
        badges: ['problem_solver'],
        role: 'user'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        points: 850,
        badges: ['chatty'],
        role: 'user'
      },
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        points: 2000,
        badges: ['problem_solver', 'chatty', 'admin'],
        role: 'admin'
      }
    ];

    // Insert users
    await User.insertMany(users);
    console.log('Sample users created');

    // Create sample problems
    const problems = [
      {
        title: 'Two Sum',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        difficulty: 'Easy',
        category: 'Array',
        testCases: [
          {
            input: 'nums = [2,7,11,15], target = 9',
            output: '[0,1]'
          }
        ],
        points: 100
      },
      {
        title: 'Reverse Linked List',
        description: 'Reverse a singly linked list.',
        difficulty: 'Easy',
        category: 'Linked List',
        testCases: [
          {
            input: 'head = [1,2,3,4,5]',
            output: '[5,4,3,2,1]'
          }
        ],
        points: 150
      }
    ];

    // Insert problems
    await Problem.insertMany(problems);
    console.log('Sample problems created');

    console.log('Database reset completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
};

resetDatabase(); 