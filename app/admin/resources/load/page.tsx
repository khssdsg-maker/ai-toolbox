'use client'

import React, { useState } from 'react';
export const runtime = 'edge'

const FaviconDownloader: React.FC = () => {
    const [url, setUrl] = useState('');
    const [faviconUrl, setFaviconUrl] = useState('');
    const [showError, setShowError] = useState('');

    const fetchFavicon = async () => {
        const apiUrl = `/api/favicon?domain=${url}`;
        setShowError('');

        try {
            console.log(`Fetching favicon from: ${apiUrl}`);
            const response = await fetch(apiUrl);
            console.log(`Response status: ${response.status}`);
            if (!response.ok) {
                throw new Error('无法访问该网站或未找到 Favicon');
            }
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            setFaviconUrl(blobUrl);
        } catch (error: unknown) {
            console.error('Error fetching favicon:', error);
            if (error instanceof Error) {
                setShowError(error.message);
            } else {
                setShowError('发生错误，请重试。');
            }
        }
    };

    const fetchFaviconFromHtml = async () => {
        const apiUrl = `/api/favicon-from-html?domain=${url}`;
        setShowError('');

        try {
            console.log(`Fetching favicon from HTML: ${apiUrl}`);
            const response = await fetch(apiUrl);
            console.log(`Response status: ${response.status}`);
            if (!response.ok) {
                throw new Error('无法访问该网站或未找到 Favicon');
            }
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            setFaviconUrl(blobUrl);
        } catch (error: unknown) {
            console.error('Error fetching favicon from HTML:', error);
            if (error instanceof Error) {
                setShowError(error.message);
            } else {
                setShowError('发生错误，请重试。');
            }
        }
    };

    const downloadFavicon = () => {
        if (!faviconUrl) {
            setShowError('请先获取 Favicon。');
            return;
        }
        const link = document.createElement('a');
        link.href = faviconUrl;
        link.download = 'favicon.ico';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full p-6 bg-gray-50">
            <h1 className="text-2xl font-bold mb-4">Favicon 下载器</h1>
            <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="输入页面链接"
                className="border border-gray-300 rounded-md p-2 mb-4 w-full max-w-md"
            />
            <button 
                onClick={fetchFavicon} 
                className="bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600 transition mb-2"
            >
                获取 Favicon
            </button>
            <button 
                onClick={fetchFaviconFromHtml} 
                className="bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600 transition mb-2"
            >
                通过解析 HTML 获取 Favicon
            </button>
            {faviconUrl && (
                <div className="mt-4 text-center">
                    <img src={faviconUrl} alt="Favicon" className="w-16 h-16 mb-2" />
                    <p className="text-gray-500">Favicon 已获取，您可以下载它。</p>
                    <button 
                        onClick={downloadFavicon} 
                        className="bg-green-500 text-white rounded-md p-2 hover:bg-green-600 transition"
                    >
                        下载 Favicon
                    </button>
                </div>
            )}
            {showError && (
                <div className="mt-4 text-center text-red-500">
                    <p>{showError}</p>
                </div>
            )}
        </div>
    );
};

export default FaviconDownloader;
