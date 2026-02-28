import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    backendData?: {
      vendorId:          string;
      email:             string;
      fullName:          string;
      profilePictureUrl: string;
      systemToken:       string;
    };
  }
  interface Session {
    vendorId:    string;
    fullName:    string;
    systemToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    vendorId:    string;
    fullName:    string;
    systemToken: string;
  }
}