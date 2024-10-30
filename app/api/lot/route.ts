import { clearAndSetSpots } from "@/db/spots";

export async function POST(req: Request) {
  const body = await req.json();
  await clearAndSetSpots(body.spots);

  return Response.json({
    success: true,
  });
}
