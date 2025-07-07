import { hash } from 'bcryptjs';
import { getDBModels } from '@/lib/db';

export async function POST(req) {
  console.log('Starting registration process...');
  
  try {
    // Parse and validate input
    const body = await req.json();
    const { name, email, password } = body;

    console.log('Validating registration data for:', email);

    // Input validation
    if (!name || !email || !password) {
      return Response.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return Response.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return Response.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Get database connection and models
    console.log('Initializing database connection...');
    let User;
    try {
      ({ User } = await getDBModels());
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return Response.json(
        { 
          message: 'Database connection failed',
          details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
        },
        { status: 500 }
      );
    }

    if (!User) {
      console.error('User model not initialized');
      return Response.json(
        { message: 'Registration system unavailable' },
        { status: 500 }
      );
    }

    // Check for existing user
    console.log('Checking for existing user...');
    const existingUser = await User.findOne({ 
      email: email.toLowerCase() 
    }).exec();

    if (existingUser) {
      console.log('User already exists:', email);
      return Response.json(
        { message: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    console.log('Creating password hash...');
    const hashedPassword = await hash(password, 12);

    // Create new user
    console.log('Creating new user...');
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      allergens: [],
      preferences: {
        notifications: true,
        language: 'en',
      },
    });

    console.log('User created successfully:', newUser._id.toString());

    // Prepare response (exclude sensitive data)
    const { password: _, __v, ...userResponse } = newUser.toObject();

    return Response.json(
      { 
        message: 'User created successfully',
        user: userResponse
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific errors
    if (error.code === 11000) {
      return Response.json(
        { message: 'User already exists' },
        { status: 409 }
      );
    }

    if (error.name === 'ValidationError') {
      return Response.json(
        { 
          message: 'Invalid input data',
          details: Object.values(error.errors).map(err => err.message)
        },
        { status: 400 }
      );
    }

    // Generic error response
    return Response.json(
      { 
        message: 'Registration failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
