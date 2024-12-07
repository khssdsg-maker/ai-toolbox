import { NextApiRequest, NextApiResponse } from 'next'
import { auth } from '@/lib/auth'
import { getSiteConfig, updateSiteConfig } from '@/services/siteConfigService'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      const config = await getSiteConfig()
      return res.status(200).json(config)
    }

    if (req.method === 'PUT') {
      const success = await updateSiteConfig(req.body)
      return res.status(200).json({ success })
    }

    return res.status(405).json({ message: 'Method not allowed' })
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' })
  }
}