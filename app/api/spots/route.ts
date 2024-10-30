export async function POST(req: Request) {
  const body = await req.json();
  console.log(JSON.stringify(body, null, 2));
  return Response.json({
    message: "Faizan is the best",
    receivedBody: body,
  });
}
