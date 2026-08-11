import { NextRequest, NextResponse } from 'next/server'
import dns from 'dns'
import { promisify } from 'util'

const resolve4 = promisify(dns.resolve4)
const resolve6 = promisify(dns.resolve6)
const resolveMx = promisify(dns.resolveMx)
const resolveTxt = promisify(dns.resolveTxt)
const resolveCname = promisify(dns.resolveCname)
const resolveNs = promisify(dns.resolveNs)

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get('domain')
  const type = request.nextUrl.searchParams.get('type') || 'A'

  if (!domain) {
    return NextResponse.json({ error: '请输入域名' }, { status: 400 })
  }

  try {
    let records: unknown[] = []

    switch (type.toUpperCase()) {
      case 'A':
        records = await resolve4(domain)
        break
      case 'AAAA':
        records = await resolve6(domain)
        break
      case 'MX':
        records = await resolveMx(domain)
        break
      case 'TXT':
        const txtRecords = await resolveTxt(domain)
        records = txtRecords.map(r => r.join(''))
        break
      case 'CNAME':
        records = await resolveCname(domain)
        break
      case 'NS':
        records = await resolveNs(domain)
        break
      default:
        records = await resolve4(domain)
    }

    return NextResponse.json({ domain, type: type.toUpperCase(), records })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '查询失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
