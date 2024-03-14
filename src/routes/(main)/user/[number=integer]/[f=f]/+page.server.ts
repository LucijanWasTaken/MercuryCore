// The friends, followers, and following pages for a user.

import { query, squery, surql } from "$lib/server/surreal"
import { error } from "@sveltejs/kit"


const usersQueries = {
	friends: surql`
		SELECT number, status, username
		# "user->friends->user OR $user<-friends<-user" doesn't work
		# "user<->friends<->user" shows yourself in the list (twice)
		FROM array::concat($user->friends->user, $user<-friends<-user)`,
	followers: surql`
		SELECT number, status, username
		FROM $user<-follows<-user`,
	following: surql`
		SELECT number, status, username
		FROM $user->follows->user`,
}
const numberQueries = {
	friends: surql`count($user->friends->user) + count($user<-friends<-user)`,
	followers: surql`count($user<-follows<-user)`,
	following: surql`count($user->follows->user)`,
}

export async function load({ params }) {
	const number = +params.number

	const type = params.f as keyof typeof usersQueries
	const user = await squery<{
		id: string
		username: string
	}>(surql`SELECT id, username FROM user WHERE number = $number`, { number })

	if (!user) error(404, "Not found")

	return {
		type,
		username: user.username,
		users: await query<{
			number: number
			status: "Playing" | "Online" | "Offline"
			username: string
		}>(usersQueries[type], {
			user: user.id,
		}),
		number: await squery<number>(`[${numberQueries[type]}]`, {
			user: user.id,
		}),
	}
}