import campaignData from "../../../data/campaign.json";

export async function GET() {
  return Response.json(campaignData, {
    headers: { "Cache-Control": "no-store" },
  });
}
