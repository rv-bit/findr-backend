import Bun from 'bun'

export const S3_CLIENT_AVATAR_BUCKET = new Bun.S3Client({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	bucket: 'avatar-findr',

	endpoint: 'https://s3.us-east-1.amazonaws.com',
	region: 'us-east-1',
})

export async function uploadUserAvatar(base64Image: string, userId?: string) {
	try {
		if (!base64Image.startsWith('data:image/')) {
			console.error('Invalid image format')
			return null
		}

		// Extract MIME type (e.g., "image/png" -> "png")
		const matches = base64Image.match(/^data:(image\/\w+);base64,(.+)$/)
		if (!matches) {
			console.error('Invalid image format')
			return null
		}

		const contentType = matches[1] // Extract "image/png"
		const base64Data = matches[2] // Extract Base64 string
		const fileExtension = contentType.split('/')[1] // Extract "png"

		// Convert Base64 to Buffer
		const buffer = Buffer.from(base64Data, 'base64')

		// Ensure reasonable file size (limit to 5MB)
		const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
		if (buffer.length > MAX_FILE_SIZE) {
			console.error('File size too large')
			return null
		}

		// Generate unique filename: userId (if provided) + timestamp
		const timestamp = Date.now()
		const objectKey = `${userId ? `${userId}_` : ''}${timestamp}.${fileExtension}`

		await S3_CLIENT_AVATAR_BUCKET.write(objectKey, buffer, {
			type: contentType,
		})

		return objectKey
	} catch (error) {
		console.error('Error uploading image:', error)
		return null
	}
}

export async function deleteUserAvatar(objectKey: string | undefined | null) {
	if (!objectKey) return

	try {
		await S3_CLIENT_AVATAR_BUCKET.delete(objectKey)
	} catch (error) {
		console.error('Error deleting image:', error)
	}
}
