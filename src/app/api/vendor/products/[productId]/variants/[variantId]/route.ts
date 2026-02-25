import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { productId: string; variantId: string } }
) {
  try {
    const body = await request.json();
    // Simulate network delay so loading states are visible
    await new Promise((r) => setTimeout(r, 500));
    return NextResponse.json({
      id: params.variantId,
      units: body.units,
      price: body.price,
      message: "Variant updated successfully",
    });
  } catch {
    return NextResponse.json(
      { message: "Failed to update variant" },
      { status: 500 }
    );
  }
}
