# ORadar v0.2 — roteiro de publicação na Google Play

## 1. Publique esta atualização no Render

- Preserve seu repositório existente no GitHub. Substitua/adicione **todos os arquivos desta pasta na raiz do repositório** e faça commit.
- Espere o Render atualizar. Não é necessário configurar um segundo servidor.
- Verifique `https://SEU-SERVICO.onrender.com/manifest.webmanifest`, `/icons/icon-512.png` e `/service-worker.js`.
- Confira no navegador (Chrome DevTools > Application > Manifest) se o PWA aparece e se os ícones são reconhecidos.
- Faça o teste de instalação no Chrome Android via menu > Adicionar à tela inicial / Instalar aplicativo.

## 2. Gere o app Android

1. Acesse https://www.pwabuilder.com/ e cole o URL HTTPS público do Render.
2. Execute a análise de PWA e corrija possíveis avisos.
3. Clique em **Package for stores > Android > Google Play**.
4. Escolha como nome **ORadar**, versão **1.0.0**, versionCode **1** e um package ID definitivo, por exemplo `br.com.oradar.app` (exemplo; confirme disponibilidade).
5. Baixe o ZIP e **guarde em local seguro o keystore e suas senhas**. Não faça commit do keystore em repositório público.
6. Teste o `.apk` no Android e envie o `.aab` ao Play Console (https://play.google.com/console/).
7. Confira que o projeto gerado usa targetSdk **36 ou superior** (Android 16), exigido pelo Google Play em 2026.

## 3. Registre o vínculo entre site e app — Digital Asset Links

- Quando o pacote existir, vá a Play Console > Integridade do app / App integrity > Assinatura do app / App signing.
- Copie o SHA-256 do certificado **App signing key** mostrado pelo Google Play (não confunda com upload key).
- Crie na raiz do repositório `/.well-known/assetlinks.json` com este conteúdo, substituindo package ID e fingerprint EXATOS:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "br.com.oradar.app",
      "sha256_cert_fingerprints": ["AA:BB:CC:...:PREENCHA_COM_O_FINGERPRINT_REAL"]
    }
  }
]
```

- Faça commit para o Render publicar.
- Verifique que o URL `https://SEU-SERVICO.onrender.com/.well-known/assetlinks.json` responde com JSON válido, sem redirecionamento e sem autenticação.
- Reinstale/teste o aplicativo para confirmar que abre sem barra de endereços.

## 4. Complete a loja e requisitos

- Crie a conta de desenvolvedor no Google Play Console (taxa única US$ 25).
- Preencha descrição, capturas reais do celular, ícone, imagem promocional, categoria e e-mail de suporte.
- Tenha **política de privacidade pública no site e acessível dentro do app**, e responda o formulário de Segurança dos dados conforme a implementação real (localização, análises, publicidade, terceiros etc.).
- Declare se exibe anúncios; complete classificação de conteúdo e público-alvo.
- Em contas **pessoais novas**, são necessários pelo menos **12 testadores em teste fechado continuamente por 14 dias**, e o Google precisa liberar o acesso à produção antes da publicação.
- Teste no celular com internet boa, internet ruim, sem internet, mudança de localização e falha de APIs.

## 5. Pontos específicos do ORadar antes de monetizar

- Open-Meteo: o plano gratuito não é licenciado para uso comercial. Reveja a licença ou contrate plano adequado antes de anúncios/venda.
- Alertas de eventos naturais: faça distinção entre risco, histórico, previsão e registro; cite fontes e indique que não substitui Defesa Civil/serviços oficiais.
- A PWA preserva **apenas a interface em cache**. As informações do clima e alertas dependem de internet e não são armazenadas offline para evitar apresentar dados desatualizados.
- Serviço gratuito do Render pode levar tempo para responder após ocioso: teste e considere plano que evite suspensão antes de escalar.
- Sua identidade de marca ORadar ainda deve ser consultada/registrada.

## Nota

Este ZIP está preparado para você fazer deploy e **gerar o pacote Android**, mas **não contém `.aab` assinado** (para assinar é necessária sua chave privada). Também **não contém `assetlinks.json` real**, porque depende de seu nome de pacote e do SHA-256 emitido pela Play Store. A publicação ainda depende da análise do Google.
