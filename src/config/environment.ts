const ENVIRONMENT = {
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000/api",
  S3_BUCKET_URL: process.env.NEXT_PUBLIC_S3_BUCKET_URL || "",
};
export default ENVIRONMENT;
