# slideshare-pdfy api

API para criação de arquivos PDFs a partir de uma lista de URLs de imagens.

## Rotas (/api)

| Método | Rota         |Parâmetros            | Resposta            |
|--------|--------------|----------------------|---------------------|
|GET     |/pdfFromImage |images_url: string - Lista de URLs das imagens separadas por vírgula (*obrigatório). Ex.: https://i.imgur.com/3SdyOpv.png,https://i.imgur.com/Xoz1gsM.png | Buffer (Arquivo PDF)|