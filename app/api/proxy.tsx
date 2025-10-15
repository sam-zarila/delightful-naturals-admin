// pages/api/proxy.ts (Pages Router)
import type { NextApiRequest, NextApiResponse } from 'next';

const API_BASE = process.env.API_BASE || "http://api.delightfulnaturals.co.za";

// allowed paths for security
const ALLOWED_PATHS = [
    '/customers.php',
    '/orders.php',
    '/products.php',
];

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { path, ...queryParams } = req.query;

    if (!path || typeof path !== 'string') {
        return res.status(400).json({ error: 'Path parameter is required' });
    }

    // Security: Check if path is allowed
    const isAllowed = ALLOWED_PATHS.some(allowed => path.startsWith(allowed));
    if (!isAllowed) {
        return res.status(403).json({ error: 'Path not allowed' });
    }

    // Rebuild query string from remaining params
    const queryString = new URLSearchParams(queryParams as Record<string, string>).toString();
    const fullPath = queryString ? `${path}?${queryString}` : path;
    const url = `${API_BASE}${fullPath.startsWith("/") ? fullPath : `/${fullPath}`}`;

    try {
        const response = await fetch(url, {
            method: req.method,
            headers: {
                "Content-Type": "application/json",
                // Forward any auth headers if needed
                ...(req.headers.authorization && {
                    Authorization: req.headers.authorization,
                }),
            },
            ...(req.body && { body: JSON.stringify(req.body) }),
        });

        if (!response.ok) {
            const text = await response.text();
            let payload: any = text;
            try {
                payload = JSON.parse(text || "null");
            } catch (e) {
                // ignore
            }
            return res.status(response.status).json({
                error: response.statusText || "Request failed",
                payload,
            });
        }

        // Try parse JSON, fallback to empty response
        try {
            const data = await response.json();
            return res.status(200).json(data);
        } catch (e) {
            return res.status(200).json(null);
        }
    } catch (error) {
        console.error('Proxy error:', error);
        return res.status(500).json({ error: 'Failed to fetch from API' });
    }
}