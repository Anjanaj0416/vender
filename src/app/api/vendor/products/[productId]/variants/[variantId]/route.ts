import { NextRequest, NextResponse } from "next/server";
import { getMockProducts } from "src/app/api/_mock-store";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string; variantId: string }> }
) {
  try {
    const { productId, variantId } = await params;
    const body = await request.json();

    const products = getMockProducts();
    const product = products.find((p) => p.id === productId);
    if (product) {
      const variant = product.variants?.find((v) => v.id === variantId);
      if (variant) {
        variant.units        = body.units;
        variant.price        = body.price;
        variant.discount     = body.discount     ?? 0;
        variant.discountType = body.discountType ?? "%";
      }
    }

    await new Promise((r) => setTimeout(r, 500));

    return NextResponse.json({
      id: variantId,
      productId,
      units:        body.units,
      price:        body.price,
      discount:     body.discount     ?? 0,
      discountType: body.discountType ?? "%",
      message: "Variant updated successfully",
    });
  } catch {
    return NextResponse.json(
      { message: "Failed to update variant" },
      { status: 500 }
    );
  }
}