import { notFound } from "next/navigation";

type IndexNowKeyProps = {
  params: Promise<{
    indexNowKey: string;
  }>;
};

export async function GET(_request: Request, { params }: IndexNowKeyProps) {
  const { indexNowKey } = await params;
  const configuredKey = process.env.INDEXNOW_KEY;

  if (!configuredKey || indexNowKey !== `${configuredKey}.txt`) {
    notFound();
  }

  return new Response(configuredKey, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400"
    }
  });
}
