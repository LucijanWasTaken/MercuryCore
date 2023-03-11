import { error } from "@sveltejs/kit"
import { prisma } from "$lib/server/prisma"

export async function GET({ url, setHeaders }) {
	const ID = url.searchParams.get("id")
	if (!ID || !/^\d+$/.test(ID)) throw error(400, "Invalid Request")

	const userInfo = await prisma.user.findUnique({
		where: { number: parseInt(ID) },
		select: { bodyColours: true },
	})

	if (!userInfo) throw error(404, "User Not Found")

	const colors: any = userInfo.bodyColours

	setHeaders({
		Pragma: "no-cache",
		"Cache-Control": "no-cache",
	})

	return new Response(`
<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<roblox xmlns:xmime="http://www.w3.org/2005/05/xmlmime" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.roblox.com/roblox.xsd" version="4">
	<External>null</External>
	<External>nil</External>
	<Item class="BodyColors">
		<Properties>
			<int name="HeadColor">${colors.Head}</int>
			<int name="LeftArmColor">${colors.LeftArm}</int>
			<int name="LeftLegColor">${colors.LeftLeg}</int>
			<string name="Name">Body Colors</string>
			<int name="RightArmColor">${colors.RightArm}</int>
			<int name="RightLegColor">${colors.RightLeg}</int>
			<int name="TorsoColor">${colors.Torso}</int>
			<bool name="archivable">true</bool>
		</Properties>
	</Item>
</roblox>
    `)
}