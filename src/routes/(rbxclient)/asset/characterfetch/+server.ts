import { error } from "@sveltejs/kit"

export async function GET({ url, setHeaders }) {
	const userId = url.searchParams.get("userID")

	if (!userId || !/^\d+$/.test(userId)) throw error(400, "Invalid Request")

	let charApp = `https://banland.xyz/Asset/BodyColors.ashx?id=${userId}`

	setHeaders({
		Pragma: "no-cache",
		"Cache-Control": "no-cache",
	})

	return new Response(charApp)
}