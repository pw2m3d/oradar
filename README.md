# ORadar — MVP 0.1

**Aplicativo web responsivo para estudo e testes, sem monetização nesta versão.** O ORadar transforma dados de meteorologia, terremotos, eventos naturais da NASA, atividade solar, aproximações de asteroides e cotação das moedas em um painel simples, organizado em quatro abas: Minha cidade, Meu estado/província, Meu país e Meu planeta.

## Como iniciar no Windows, macOS ou Linux

Requer **Node.js 22+**. Não é preciso instalar dependências nem executar `npm install`.

1. Extraia o ZIP para uma pasta, por exemplo `C:\ORadar`.
2. Abra o terminal nessa pasta.
3. Execute `node server.mjs`.
4. Abra `http://localhost:4173` no navegador.
5. Para encerrar, pressione `Ctrl + C` no terminal.

No Windows você pode clicar duas vezes em **iniciar-windows.bat** após instalar o Node.js. No Linux/macOS, execute `./iniciar-linux.sh` (ou `bash iniciar-linux.sh`).

> **Importante:** não abra `index.html` diretamente pelo caminho `file://`. O aplicativo utiliza um pequeno servidor Node.js para consultar e armazenar em cache as fontes externas. A internet precisa estar disponível para buscar os dados reais.

## Recursos operacionais

- Buscar cidade em qualquer país; seleção persistida no navegador.
- Posição atual mediante autorização do navegador; não é solicitada automaticamente.
- Meteorologia atual e previsão de sete dias.
- Estado/província usando a cidade de referência; sem fingir uma cobertura meteorológica de todo o estado.
- País: moeda definida pelo código do país, comparação com as principais moedas, tempo na cidade de referência e tremores num raio de 1.500 km (não são fronteiras nacionais).
- Planeta: eventos naturais observados pela NASA nos últimos 30 dias (como vulcões, incêndios e grandes tempestades), terremotos (24h/7d/30d), histórico/estimativa/previsão geomagnética (índice Kp), registros de aproximações de asteroides em 30 dias passados, 30 dias futuros ou último ano, dentro de 20 distâncias lunares.
- Erros de API e fonte indisponível claramente mostrados (sem dados simulados apresentados como reais).

## Fontes dos dados

- **Open-Meteo** (previsão e busca de cidades): https://open-meteo.com/ — gratuita para desenvolvimento e uso não comercial; **não monetizar esta versão sem contrato apropriado**. Créditos devidos à Open-Meteo e prestadores meteorológicos subjacentes.
- **USGS** (terremotos): https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php
- **NOAA/SWPC** (índice geomagnético Kp): https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json
- **NASA EONET** (catálogo de eventos naturais): https://eonet.gsfc.nasa.gov/docs/v3
- **NASA/JPL SSD** (aproximações calculadas de asteroides): https://ssd-api.jpl.nasa.gov/doc/cad.html
- **Frankfurter v2** (cotações de referência): https://frankfurter.dev/ — não são taxas de negociação nem câmbio em tempo real.
- **BigDataCloud** (geocodificação reversa, apenas ao clicar Localizar-me e aceitar): https://www.bigdatacloud.com/docs/article/why-is-reverse-geocoding-api-free

## Como interpretar sem alarmismo

- **Índice Kp:** valores de 0 a 4, abaixo do limiar de tempestade geomagnética; de 5 a 9, categorias crescentes de G1 a G5. Não é uma escala de risco à saúde humana.
- **Asteroides:** “X vezes a distância da Lua” é uma unidade de distância. Uma aproximação registrada **não é uma previsão de colisão**. O tamanho pode não ser conhecido, e a ausência de informação não significa segurança garantida.
- **Terremotos:** não há previsão científica confiável de hora/data de grandes terremotos. O painel exibe observações históricas, não alertas antecipados.
- **Alertas meteorológicos:** estimativas de temperatura, vento e chuva não substituem avisos oficiais da Defesa Civil.

## Próximos passos antes de vender/publicar em lojas

1. Licença comercial para os dados meteorológicos, backend hospedado com HTTPS e cache persistente.
2. Fronteiras dos países e estados para filtrar ocorrências com precisão geográfica, mais fontes oficiais nacionais de alerta.
3. Login opcional, multi-idiomas, notificações push e preferências regionais.
4. Acessibilidade, política de privacidade, consentimento de geolocalização, observabilidade e testes em aparelhos físicos.
5. Empacotamento com **Capacitor** para Android/iOS e conformidade com políticas das lojas.

## Arquivos

- `index.html` — interface e estrutura.
- `styles.css` — estilos responsivos.
- `app.js` — navegação, integração com o servidor e interpretação dos dados.
- `server.mjs` — servidor estático e proxy/cache para as APIs públicas.
- `favicon.svg` — símbolo do farol.
- `manifest.webmanifest` — metadados para instalação web em ambientes compatíveis.

Não há pagamentos, anúncios, notificações push ou previsões de eventos catastróficos nesta versão. ORadar não é um serviço de emergência.
