import { NextResponse } from 'next/server';

// Temporary simplified auth for build - replace with proper auth after deployment
export async function auth() {
  return {
    user: {
      id: 'temp-user',
      email: 'admin@example.com',
      role: 'ADMIN'
    }
  };
}

// Temporary auth handlers
export const GET = async () => {
  return NextResponse.json({ message: 'Auth endpoint' });
};

export const POST = async () => {
  return NextResponse.json({ message: 'Auth endpoint' });
};
