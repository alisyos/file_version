/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse']
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // PDF 파싱을 위한 서버 사이드 설정
      config.externals = config.externals || []
      config.externals.push({
        'canvas': 'canvas',
        'pdfjs-dist': 'pdfjs-dist'
      })
    }
    
    // PDF 파일 처리를 위한 설정
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      stream: false,
      crypto: false,
      buffer: false
    }
    
    return config
  },
  // Vercel 배포를 위한 설정
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: '10mb',
  },
  // 정적 파일 최적화
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },
}

module.exports = nextConfig 