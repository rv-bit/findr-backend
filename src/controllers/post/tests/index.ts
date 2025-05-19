// export const testGetAllPosts = handler(async (req: Request, res: Response) => {
// 	const posts = await db.select().from(schema.posts).limit(500)

// 	if (!posts) {
// 		res.status(401).json({
// 			message: 'Failed to get posts',
// 		})

// 		logger.error('Failed to get posts', { posts })
// 		return
// 	}

// 	const allPosts = posts.map((post) => {
// 		return {
// 			id: post.id,
// 			slug: post.slug,
// 			title: post.title,
// 			content: post.content,
// 			userId: post.userId,
// 			createdAt: post.createdAt,
// 			updatedAt: post.updatedAt,
// 		}
// 	})

// 	// return all posts
// 	res.status(200).json(allPosts)
// })

// export const testWritePosts = handler(async (req: Request, res: Response) => {
// 	const length = await db.$count(schema.posts)
// 	const posts: schema.InsertPosts[] = []

// 	for (let i = length + 1; i < length + 1000; i++) {
// 		posts.push({
// 			id: crypto.randomUUID(),
// 			slug: `test-post-${i}-${Date.now()}`,
// 			title: 'Test Post ' + i,
// 			content: 'This is a test post ' + i,
// 			userId: 'o3P6NXURD4LwOiwEF8xryx4S9bXj4Jin',
// 			createdAt: new Date(),
// 			updatedAt: new Date(),
// 		})
// 	}

// 	await db.transaction(async (tx) => {
// 		await tx.insert(schema.posts).values(posts)
// 	})

// 	res.status(200).json({
// 		message: 'Success',
// 	})
// })
