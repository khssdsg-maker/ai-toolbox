// app/api/resource-metadata/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { commitFile, getFileContent } from '@/lib/github'
import type { ResourceMetadata } from '@/types/resource-metadata'

export const runtime = 'edge'



export async function GET() {
    try {
        const data = await getFileContent('navsphere/content/resource-metadata.json') as ResourceMetadata
        if (!data?.metadata || !Array.isArray(data.metadata)) {
            throw new Error('Invalid data structure');
        }
        return NextResponse.json(data)
    } catch (error) {
        console.error('Failed to fetch resource metadata:', error)
        return NextResponse.json({ error: 'Failed to fetch resource metadata' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.accessToken) {
            return new Response('Unauthorized', { status: 401 });
        }

        const { image } = await request.json(); // Get the Base64 image
        const base64Data = image.split(",")[1]; // Extract the Base64 part
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0)); // Convert Base64 to binary

        // Now you can use the binary data to upload to GitHub
        const imageUrl = await uploadImageToGitHub(binaryData, session.user.accessToken); // Pass Uint8Array directly

        // Handle metadata
        const metadata = await getFileContent('navsphere/content/resource-metadata.json') as ResourceMetadata;
        metadata.metadata.push({ 
            commit: 'your_commit_hash', // Replace with actual commit hash
            hash: 'your_commit_hash',    // Replace with actual hash
            path: imageUrl 
        });

        await commitFile(
            'navsphere/content/resource-metadata.json',
            JSON.stringify(metadata, null, 2),
            'Update resource metadata',
            session.user.accessToken
        );

        return NextResponse.json({ success: true, imageUrl });
    } catch (error) {
        console.error('Failed to save resource metadata:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to save resource metadata' },
            { status: 500 }
        );
    }
}

// Function to upload image to GitHub
async function uploadImageToGitHub(binaryData: Uint8Array, token: string): Promise<string> {
    const owner = process.env.GITHUB_OWNER!;
    const repo = process.env.GITHUB_REPO!;
    const branch = process.env.GITHUB_BRANCH || 'main'
    const path = `asserts/image_${Date.now()}.png`; // Generate a unique path for the image

    // Convert Uint8Array to Base64
    const base64String = Buffer.from(binaryData).toString('base64'); // Use Buffer to convert to Base64
    const currentFileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`
    // Use fetch to upload the file to GitHub
    const response = await fetch(currentFileUrl, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({
            message: `Upload ${path}`,
            content: base64String, // Send only the Base64 string
            branch: branch, // Explicitly specify the branch
        }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to upload image to GitHub:', errorData);
        throw new Error(`Failed to upload image to GitHub: ${errorData.message || 'Unknown error'}`);
    }

    return path; // Return the URL of the uploaded image
}
