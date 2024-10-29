export async function POST(req: Request) {
  const body = await req.json();

  return Response.json({
    message: "Faizan is the best",
    receivedBody: body,
  });
}
