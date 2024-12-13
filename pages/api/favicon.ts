import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server';

export const runtime = 'edge'

export default async function handler(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain');

    if (!domain) {
        return NextResponse.json({ error: '缺少有效的 domain 参数' }, { status: 400 });
    }

    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}`;

    try {
        const response = await fetch(faviconUrl);
        if (!response.ok) {
            return NextResponse.json({ error: '无法访问该网站或未找到 Favicon' }, { status: response.status });
        }
        const arrayBuffer = await response.arrayBuffer();
        const res = NextResponse.next();
        res.headers.set('Content-Type', 'image/x-icon');
        return new NextResponse(Buffer.from(arrayBuffer), { headers: res.headers });
    } catch (error) {
        console.error('Error fetching favicon:', error);
        return NextResponse.json({ error: '发生错误，请重试。' }, { status: 500 });
    }
} 