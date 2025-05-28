import { login } from '@/app/api/controllers/userController';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  return login(req);
}

export async function GET(req: NextRequest) {
  return login(req);
}

