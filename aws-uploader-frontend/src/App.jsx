import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Upload, Settings, FileImage, CheckCircle, AlertCircle, Download } from 'lucide-react'
import AppPreview from './components/AppPreview.jsx'
import './App.css'

const API_BASE_URL = 'http://localhost:8000/api/aws'

const FOLDER_TYPES = {
  'banners_principais/topo': 'Banners Principais - Topo (Slides)',
  'banners_principais/horizontal': 'Banners Principais - Horizontal',
  'extra_mini_buttons': 'Extra Mini Buttons',
  'mini_banners': 'Mini Banners (Small Images)',
  'normal_banners': 'Normal Banners',
  'logo_images': 'Logo Images',
  'email_template': 'Email Template'
}

function App() {
  const [wlName, setWlName] = useState('')
  const [isSetupComplete, setIsSetupComplete] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('info')

  // Estados para upload de imagens
  const [uploadedImages, setUploadedImages] = useState({})
  const [imageMetadata, setImageMetadata] = useState({})

  // Estados para grid buttons
  const [gridButtons, setGridButtons] = useState([])
  const [currentGridButton, setCurrentGridButton] = useState({
    name: '',
    image: '',
    urlType: 'internal',
    url: '',
    size: 25
  })

  // Estado para JSON final
  const [finalJson, setFinalJson] = useState(null)

  const showMessage = (msg, type = 'info') => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(''), 5000)
  }

  const handleSetup = async () => {
    if (!wlName.trim()) {
      showMessage('Nome WL é obrigatório', 'error')
      return
    }

    setLoading(true)
    try {
      // Testar conexão AWS
      const testResponse = await fetch(`${API_BASE_URL}/test-aws-connection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!testResponse.ok) {
        const error = await testResponse.json()
        throw new Error(error.error || 'Erro na conexão AWS')
      }

      // Criar estrutura de pastas
        const setupResponse = await fetch(`${API_BASE_URL}/setup-folders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wl_name: wlName
          })
        })

      if (!setupResponse.ok) {
        const error = await setupResponse.json()
        throw new Error(error.error || 'Erro ao criar estrutura de pastas')
      }

        setIsSetupComplete(true)
      showMessage('Configuração concluída com sucesso!', 'success')

    } catch (error) {
      showMessage(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (folderType, files) => {
    if (!files || files.length === 0) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('wl_name', wlName)
      formData.append('folder_type', folderType)

      Array.from(files).forEach(file => {
        formData.append('files', file)
      })

      const response = await fetch(`${API_BASE_URL}/upload-images`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro no upload')
      }

      const result = await response.json()

      setUploadedImages(prev => ({
        ...prev,
        [folderType]: result.files
      }))

      showMessage(`${result.files.length} imagens enviadas com sucesso!`, 'success')

    } catch (error) {
      showMessage(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleImageMetadata = (folderType, filename, metadata) => {
    setImageMetadata(prev => ({
      ...prev,
      [`${folderType}_${filename}`]: metadata
    }))
  }

  const addGridButton = () => {
    if (!currentGridButton.name || !currentGridButton.image || !currentGridButton.url) {
      showMessage('Preencha todos os campos do grid button', 'error')
      return
    }

    const button = {
      ...currentGridButton,
      [currentGridButton.urlType === 'internal' ? 'internalUrl' : 'externalUrl']: currentGridButton.url
    }
    delete button.urlType
    delete button.url

    setGridButtons(prev => [...prev, button])
    setCurrentGridButton({
      name: '',
      image: '',
      urlType: 'internal',
      url: '',
      size: 25
    })
    showMessage('Grid button adicionado!', 'success')
  }

  const generateFinalJson = async () => {
    try {
      const slides = []
      const banners = []
      const smallImages = []
      const normalImages = []
      const miniExtraButtons = []
      const logoImages = []
      const emailTemplates = []

      // Processar imagens por categoria
      Object.entries(uploadedImages).forEach(([folderType, files]) => {
        files.forEach(file => {
          const metadataKey = `${folderType}_${file.filename}`
          const metadata = imageMetadata[metadataKey] || {}

          const imageObj = {
            name: file.filename,
            image: file.url
          }

          if (metadata.urlType && metadata.url) {
            imageObj[metadata.urlType === 'internal' ? 'internalUrl' : 'externalUrl'] = metadata.url
          } else if (folderType !== 'logo_images' && folderType !== 'email_template') {
            // If no URL is provided for non-logo/email_template images, add an empty internalUrl
            imageObj['internalUrl'] = ''
          }

          switch (folderType) {
            case 'banners_principais/topo':
              slides.push(imageObj)
              break
            case 'banners_principais/horizontal':
              banners.push(imageObj)
              break
            case 'mini_banners':
              smallImages.push(imageObj)
              break
            case 'normal_banners':
              normalImages.push(imageObj)
              break
            case 'extra_mini_buttons':
              miniExtraButtons.push(imageObj)
              break
            case 'logo_images':
              logoImages.push(imageObj)
              break
            case 'email_template':
              emailTemplates.push(imageObj)
              break
          }
        })
      })

      const jsonData = {
        slides,
        gridButtons,
        banners,
        formattedBanners: {
          smallImages,
          normalImages
        },
        miniExtraButtons
      }

      const response = await fetch(`${API_BASE_URL}/generate-json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slides,
          gridButtons,
          banners,
          smallImages,
          normalImages,
          miniExtraButtons,
          logoImages,
          emailTemplates
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao gerar JSON')
      }

      const result = await response.json()
      setFinalJson(result)
      showMessage('JSON gerado com sucesso!', 'success')

    } catch (error) {
      showMessage(error.message, 'error')
    }
  }

  const downloadJson = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!isSetupComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md mx-auto pt-20">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Configuração Inicial</CardTitle>
              <CardDescription>
                Configure sua conexão AWS e nome do White Label
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="wl-name">Nome do White Label</Label>
                <Input
                  id="wl-name"
                  placeholder="ex: meu-app"
                  value={wlName}
                  onChange={(e) => setWlName(e.target.value)}
                />
              </div>



              <Button
                onClick={handleSetup}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Configurando...' : 'Iniciar Configuração'}
              </Button>

              {message && (
                <Alert className={messageType === 'error' ? 'border-red-200 bg-red-50' : messageType === 'success' ? 'border-green-200 bg-green-50' : ''}>
                  {messageType === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AWS Image Uploader
          </h1>
          <p className="text-gray-600">
            White Label: <Badge variant="outline">{wlName}</Badge>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Painel de Upload */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="upload" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upload">Upload de Imagens</TabsTrigger>
                <TabsTrigger value="grid">Grid Buttons</TabsTrigger>
                <TabsTrigger value="generate">Gerar JSON</TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4">
                {Object.entries(FOLDER_TYPES).map(([folderType, label]) => (
                  <Card key={folderType}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileImage className="w-5 h-5" />
                        {label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleImageUpload(folderType, e.target.files)}
                        />

                        {uploadedImages[folderType] && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Imagens enviadas:</p>
                            {uploadedImages[folderType].map((file, index) => (
                              <div key={index} className="border rounded p-3 space-y-2">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span className="text-sm font-medium">{file.filename}</span>
                                </div>

                                {!['logo_images', 'email_template'].includes(folderType) && (
                                  <div className="grid grid-cols-2 gap-2">
                                    <Select
                                      value={imageMetadata[`${folderType}_${file.filename}`]?.urlType || 'internal'}
                                      onValueChange={(value) => handleImageMetadata(folderType, file.filename, {
                                        ...imageMetadata[`${folderType}_${file.filename}`],
                                        urlType: value
                                      })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="internal">URL Interna</SelectItem>
                                        <SelectItem value="external">URL Externa</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Input
                                      placeholder="URL de destino"
                                      value={imageMetadata[`${folderType}_${file.filename}`]?.url || ''}
                                      onChange={(e) => handleImageMetadata(folderType, file.filename, {
                                        ...imageMetadata[`${folderType}_${file.filename}`],
                                        url: e.target.value
                                      })}
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="grid" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Configurar Grid Buttons</CardTitle>
                    <CardDescription>
                      Adicione botões para o grid da aplicação
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Nome do Botão</Label>
                        <Input
                          placeholder="ex: start-home.buttons.streaming"
                          value={currentGridButton.name}
                          onChange={(e) => setCurrentGridButton(prev => ({...prev, name: e.target.value}))}
                        />
                      </div>
                      <div>
                        <Label>Imagem</Label>
                        <Input
                          placeholder="ex: res://home_streaming_icon"
                          value={currentGridButton.image}
                          onChange={(e) => setCurrentGridButton(prev => ({...prev, image: e.target.value}))}
                        />
                      </div>
                      <div>
                        <Label>Tipo de URL</Label>
                        <Select
                          value={currentGridButton.urlType}
                          onValueChange={(value) => setCurrentGridButton(prev => ({...prev, urlType: value}))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="internal">Interna</SelectItem>
                            <SelectItem value="external">Externa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>URL</Label>
                        <Input
                          placeholder="URL de destino"
                          value={currentGridButton.url}
                          onChange={(e) => setCurrentGridButton(prev => ({...prev, url: e.target.value}))}
                        />
                      </div>
                      <div>
                        <Label>Tamanho</Label>
                        <Input
                          type="number"
                          placeholder="25"
                          value={currentGridButton.size}
                          onChange={(e) => setCurrentGridButton(prev => ({...prev, size: parseInt(e.target.value) || 25}))}
                        />
                      </div>
                    </div>

                    <Button onClick={addGridButton} className="w-full">
                      Adicionar Grid Button
                    </Button>

                    {gridButtons.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Grid Buttons adicionados:</p>
                        {gridButtons.map((button, index) => (
                          <div key={index} className="border rounded p-2 text-sm">
                            <strong>{button.name}</strong> - Tamanho: {button.size}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="generate">
                <Card>
                  <CardHeader>
                    <CardTitle>Gerar JSON Final</CardTitle>
                    <CardDescription>
                      Compile todas as configurações em um JSON estruturado
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={generateFinalJson} className="w-full mb-4">
                      <Upload className="w-4 h-4 mr-2" />
                      Gerar JSON
                    </Button>

                    {finalJson && (
                      <div className="space-y-4">
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            onClick={() => downloadJson(finalJson.json_data, `${wlName}-config.json`)}
                            variant="outline"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download JSON Principal
                          </Button>
                          <Button
                            onClick={() => downloadJson(finalJson.logo_data, `${wlName}-logo.json`)}
                            variant="outline"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Logo Data
                          </Button>
                          <Button
                            onClick={() => downloadJson(finalJson.template_data, `${wlName}-template.json`)}
                            variant="outline"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Template Data
                          </Button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">JSON Principal:</h4>
                            <Textarea
                              value={JSON.stringify(finalJson.json_data, null, 2)}
                              readOnly
                              className="h-40 text-xs font-mono"
                            />
                          </div>

                          {Object.keys(finalJson.logo_data).length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Logo Data:</h4>
                              <Textarea
                                value={JSON.stringify(finalJson.logo_data, null, 2)}
                                readOnly
                                className="h-20 text-xs font-mono"
                              />
                            </div>
                          )}

                          {Object.keys(finalJson.template_data).length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Template Data:</h4>
                              <Textarea
                                value={JSON.stringify(finalJson.template_data, null, 2)}
                                readOnly
                                className="h-20 text-xs font-mono"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Painel de Pré-visualização */}
          <div className="lg:col-span-1">
            <AppPreview
              uploadedImages={uploadedImages}
              imageMetadata={imageMetadata}
              gridButtons={gridButtons}
              wlName={wlName}
            />
          </div>
        </div>

        {message && (
          <div className="fixed bottom-4 right-4 z-50">
            <Alert className={`${messageType === 'error' ? 'border-red-200 bg-red-50' : messageType === 'success' ? 'border-green-200 bg-green-50' : ''} shadow-lg`}>
              {messageType === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
