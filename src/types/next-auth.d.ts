import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    backendData?: any;
  }
  interface Session {
    backendData?: any;
    googleId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    backendData?: any;
    googleId?: string;
    idToken?: string;
  }
}