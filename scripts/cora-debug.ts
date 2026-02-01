
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// ==========================================
// 1. CONFIGURAÇÃO (PREENCHA AQUI)
// ==========================================

const CLIENT_ID = 'SEU_CLIENT_ID_AQUI'; // Ex: int-123...
const AMBIENTE = 'production'; // 'production' ou 'stage'

// Caminhos para os arquivos (coloque-os na mesma pasta deste script ou use caminhos absolutos)
const PRIVATE_KEY_PATH = path.join(__dirname, 'private-key.key');
const CERTIFICATE_PATH = path.join(__dirname, 'certificate.pem'); // Ou .pem

// ==========================================
// 2. IMPLEMENTAÇÃO (NÃO ALTERE)
// ==========================================

const BASE_URL = AMBIENTE === 'production' 
  ? 'https://matls-clients.api.cora.com.br' 
  : 'https://matls-clients.api.stage.cora.com.br';

function generateJWT(clientId: string, privateKeyPem: string) {
  const now = Math.floor(Date.now() / 1000);
  
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: clientId,
    sub: clientId,
    aud: `${BASE_URL}/token`,
    exp: now + 300,
    iat: now,
    jti: crypto.randomUUID()
  };

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(Buffer.from(JSON.stringify(header)).toString('base64url') + '.' + Buffer.from(JSON.stringify(payload)).toString('base64url'));
  
  const signature = sign.sign(privateKeyPem, 'base64url');
  
  return Buffer.from(JSON.stringify(header)).toString('base64url') + '.' + 
         Buffer.from(JSON.stringify(payload)).toString('base64url') + '.' + 
         signature;
}

// Função principal auto-executável para permitir async/await
(async () => {
  try {
    console.log('🔍 Lendo credenciais...');
    
    if (!fs.existsSync(PRIVATE_KEY_PATH) || !fs.existsSync(CERTIFICATE_PATH)) {
      throw new Error(`Arquivos de chave/certificado não encontrados.\nEsperado: ${PRIVATE_KEY_PATH} e ${CERTIFICATE_PATH}`);
    }

    const outputPrivateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
    // Validação simples para ver se não é certificado
    if (outputPrivateKey.includes('BEGIN CERTIFICATE')) {
      throw new Error('O arquivo private-key.key parece conter um CERTIFICADO, não uma chave privada! Verifique seus arquivos.');
    }

    // CALCULAR FINGERPRINT
    const cleanContent = outputPrivateKey.trim().replace(/[\r\n]/g, '').replace(/-----[A-Z ]+-----/g, '');
    const hash = crypto.createHash('sha256').update(cleanContent).digest('hex');
    console.log('\n🔑 KEY FINGERPRINT (SHA256):', hash.substring(0, 16) + '...');
    console.log('compare este valor com o log do servidor para garantir que a chave é a mesma!\n');

    const jwt = generateJWT(CLIENT_ID, outputPrivateKey);

    console.log('\n✅ JWT Gerado com Sucesso!');
    console.log('---------------------------------------------------');
    console.log(jwt.substring(0, 50) + '...');
    console.log('---------------------------------------------------');

    // EXECUÇÃO DIRETA DA REQUISIÇÃO
    console.log('\n🔄 Testando conexão diretamente via script...');
    
    const https = await import('https');

    const agent = new https.Agent({
      cert: fs.readFileSync(CERTIFICATE_PATH),
      key: fs.readFileSync(PRIVATE_KEY_PATH),
      rejectUnauthorized: false
    });

    const postData = new URLSearchParams({
      grant_type: 'client_credentials',
      client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      client_assertion: jwt,
      client_id: CLIENT_ID, 
      // scope: 'invoice:read bank-statement:read' // Removendo escopo para ver se assume o padrão
    }).toString();

    const options = {
      hostname: BASE_URL.replace('https://', '').replace('/token', ''), 
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length
      },
      agent: agent
    };

    const req = https.request(options, (res) => {
      console.log(`\n📡 Status Code: ${res.statusCode}`);
      
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log('\n📄 Resposta do Servidor:');
          console.dir(json, { depth: null, colors: true });

          if (res.statusCode === 200 && json.access_token) {
              console.log('\n✅ SUCESSO! AS CREDENCIAIS ESTÃO FUNCIONANDO.');
              console.log('👉 Ação: Atualize o conteúdo de "private-key.key" no banco de dados Supabase (tabela integracoes_bancarias) no campo "private_key".');
          } else {
              console.log('\n❌ FALHA NA AUTENTICAÇÃO.');
              console.log('Verifique o Client ID e se o Certificado está ativo no painel da Cora.');
          }
        } catch (e) {
          console.log('Resposta (texto):', data);
        }
      });
    });

    req.on('error', (e) => {
      console.error('❌ Erro na requisição:', e);
    });

    req.write(postData);
    req.end();

  } catch (error) {
    console.error('\n❌ Erro:', error instanceof Error ? error.message : error);
    console.log('\nDica: Certifique-se de editar este script com o CLIENT_ID correto e ter os arquivos .key e .crt na mesma pasta.');
  }
})();
