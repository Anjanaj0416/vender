import { NextResponse } from "next/server";
import { getMockProducts } from "../../_mock-store";


export async function GET() {
  const products = getMockProducts();
  return NextResponse.json({
    data: products,
    totalResults: products.length,
    totalPages: 1,
    page: 0,
  });
}