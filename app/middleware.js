import { secureHeaders } from 'next-secure-headers';

export default function middleware(request) {
  return secureHeaders()(request);
}

export const config = {
  matcher: '/:path*',
};
