import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Server is working !',
    routes: [
        '/routes/users/login', 
        // '/routes/admin/login'
    ],
  });
}