import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET() {
  try {
    const response = await fetch(
      `https://www.jisilu.cn/data/qdii/qdii_list/E?___jsl=LST___t=${Date.now()}&rp=22&page=1`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )
    
    const data = await response.json()
    
    const transformedData = data.rows.map((item: any) => ({
      code: item.cell.fund_id,
      name: item.cell.fund_nm,
      price: parseFloat(item.cell.price) || 0,
      increase_rt: item.cell.increase_rt,
      discount_rt: item.cell.discount_rt,
      volume: item.cell.volume || 0,
      amount: item.cell.amount || 0,
      index_nm: item.cell.index_nm || '-',
      mt_fee: item.cell.mt_fee || '-',
      mt_fee_tips: item.cell.mt_fee_tips || '',
      issuer_nm: item.cell.issuer_nm || '-',
      issuer_url: item.cell.urls || '#',
      navDate: item.cell.est_val_dt || '-'
    }))

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Error fetching data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
} 