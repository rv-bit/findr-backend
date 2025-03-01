import app from './app'
const PORT = process.env.PORT

Bun.serve({
	fetch: app.fetch,
	port: PORT,
})

console.log(`Server listening on ${PORT}`)
