import { PostByPhone } from '@/app/api/controllers/userController';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  return PostByPhone(req);
}
