// This should be moved to asset thumbnails for every asset on Mercury, but for now we'll use it for the stamper tool (and other games which require it)

import { equery, surrealql, RecordId } from "$lib/server/surreal"
import { error, redirect } from "@sveltejs/kit"

export async function GET({ url }) {
	const width = +(url.searchParams.get("wd") as string)
	const height = +(url.searchParams.get("ht") as string)
	const assetId = +(url.searchParams.get("aid") as string)
	const stringAssetId = assetId.toString()

	if (!assetId || !width || !height) error(404, "Asset not found")

	const params = new URLSearchParams({
		assetIds: stringAssetId,
		returnPolicy: "Placeholder",
		size: `${width}x${height}`,
		format: "Png",
		isCircular: "false",
	})
	const [[cache]] = await equery<{ url: string }[][]>(
		surrealql`SELECT url FROM $asset`,
		{ asset: new RecordId("thumbnailCache", stringAssetId) }
	)

	if (cache) redirect(302, cache.url)

	const thumb = await fetch(
		`https://thumbnails.roblox.com/v1/assets?${params}`
	)

	if (thumb.status !== 200) error(400, "Invalid asset")

	const { imageUrl } = JSON.parse(await thumb.text()).data[0]
	await equery(surrealql`UPDATE $asset SET url = ${imageUrl}`, {
		asset: new RecordId("thumbnailCache", stringAssetId),
	})

	redirect(302, imageUrl)
}
