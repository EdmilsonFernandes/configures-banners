import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Smartphone } from 'lucide-react'

const AppPreview = ({ uploadedImages, imageMetadata, gridButtons, wlName }) => {
  // Processar imagens por categoria
  const getImagesByCategory = (category) => {
    if (!uploadedImages[category]) return []

    return uploadedImages[category].map(file => {
      const metadataKey = `${category}_${file.filename}`
      const metadata = imageMetadata[metadataKey] || {}

      return {
        name: file.filename,
        image: file.url,
        ...(metadata.urlType && metadata.url ? {
          [metadata.urlType === 'internal' ? 'internalUrl' : 'externalUrl']: metadata.url
        } : {})
      }
    })
  }

  const slides = getImagesByCategory('banners_principais/topo')
  const banners = getImagesByCategory('banners_principais/horizontal')
  const smallImages = getImagesByCategory('mini_banners')
  const normalImages = getImagesByCategory('normal_banners')
  const miniExtraButtons = getImagesByCategory('extra_mini_buttons')

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Pré-visualização do App
        </CardTitle>
        {wlName && (
          <Badge variant="outline" className="w-fit">
            {wlName}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="bg-black rounded-lg p-4 max-w-sm mx-auto" style={{ aspectRatio: '9/19.5' }}>
          {/* Header do App */}
          <div className="flex justify-between items-center text-white text-xs mb-4">
            <span>18:33</span>
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
            <span>69%</span>
          </div>

          {/* User Info */}
          <div className="flex justify-between items-center text-white mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-xs">👤</span>
              </div>
              <div>
                <div className="text-sm">Hello, User</div>
                <div className="text-xs opacity-70">******</div>
              </div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full px-3 py-1">
              <span className="text-xs">Profiles</span>
            </div>
          </div>

          {/* Slides (Banner Principal Topo) */}
          {slides.length > 0 && (
            <div className="mb-4">
              <div className="relative h-24 bg-gradient-to-r rounded-lg overflow-hidden">
                {slides[0].image ? (
                  <img
                    src={slides[0].image}
                    alt={slides[0].name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'block'
                    }}
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-r flex items-center justify-center text-white text-xs">
                  {slides[0].image ? '' : 'Banner Principal'}
                </div>
              </div>
            </div>
          )}

          {/* Mini Extra Buttons (4 botões circulares) */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {Array.from({ length: 4 }).map((_, index) => {
              const button = miniExtraButtons[index]
              return (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mb-1 mx-auto">
                    {button?.image ? (
                      <img
                        src={button.image}
                        alt={button.name}
                        className="w-8 h-8 object-cover rounded-full"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'block'
                        }}
                      />
                    ) : null}
                    <span className="text-green-400 text-xs" style={{ display: button?.image ? 'none' : 'block' }}>
                      {index === 0 ? '💰' : index === 1 ? '🎵' : index === 2 ? '🔒' : '👑'}
                    </span>
                  </div>
                  <span className="text-white text-xs">
                    {button?.name?.split('_')[2] || ['Benefits', 'Play', 'Experiences', 'Galeria'][index]}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Small Images Grid (2x2) */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {Array.from({ length: 4 }).map((_, index) => {
              const image = smallImages[index]
              return (
                <div key={index} className="aspect-square bg-gray-700 rounded-lg overflow-hidden">
                  {image?.image ? (
                    <img
                      src={image.image}
                      alt={image.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'block'
                      }}
                    />
                  ) : null}
                  <div
                    className="w-full h-full flex items-center justify-center text-white text-xs bg-gray-700"
                    style={{ display: image?.image ? 'none' : 'flex' }}
                  >
                    Small {index + 1}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Horizontal Banners */}
          {banners.length > 0 && (
            <div className="space-y-2 mb-4">
              {banners.slice(0, 2).map((banner, index) => (
                <div key={index} className="h-16 bg-gray-700 rounded-lg overflow-hidden">
                  {banner.image ? (
                    <img
                      src={banner.image}
                      alt={banner.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'block'
                      }}
                    />
                  ) : null}
                  <div
                    className="w-full h-full flex items-center justify-center text-white text-xs bg-gray-700"
                    style={{ display: banner.image ? 'none' : 'flex' }}
                  >
                    Banner Horizontal {index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Grid Buttons */}
          {gridButtons.length > 0 && (
            <div className="mb-4">
              <div className="text-white text-xs mb-2">Grid Buttons:</div>
              <div className="grid grid-cols-2 gap-1">
                {gridButtons.slice(0, 4).map((button, index) => (
                  <div key={index} className="bg-gray-700 rounded p-2 text-center">
                    <div className="text-white text-xs truncate">{button.name}</div>
                    <div className="text-gray-400 text-xs">Size: {button.size}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Navigation */}
          <div className="flex justify-around items-center pt-2 border-t border-gray-700">
            {['🏠', '💰', '💳', '☀️', '🛍️'].map((icon, index) => (
              <div key={index} className="text-center">
                <div className="text-green-400 text-lg">{icon}</div>
                <span className="text-white text-xs">
                  {['Home', 'Benefits', 'Wallet', 'Interactions', 'Shopping'][index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Estatísticas */}
        <div className="mt-4 space-y-2">
          <div className="text-sm font-medium">Estatísticas:</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Slides: {slides.length}</div>
            <div>Banners: {banners.length}</div>
            <div>Small Images: {smallImages.length}</div>
            <div>Mini Buttons: {miniExtraButtons.length}</div>
            <div>Grid Buttons: {gridButtons.length}</div>
            <div>Normal Images: {normalImages.length}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AppPreview
