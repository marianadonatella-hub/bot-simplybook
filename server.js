const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
    const company = 'maranatest';
    const apiKey = 'api_user_key_NRKmlvmoLPtCfyJLVib6Csz33VNYFng8VejjeoE4JfI';
    
    const loginUrl = 'https://simplybook.me';
    const apiUrl = 'https://simplybook.me';

    try {
        const loginResponse = await axios.post(loginUrl, {
            jsonrpc: '2.0', method: 'getToken', params: [company, apiKey], id: 1
        });
        const token = loginResponse.data.result;

        // Interogăm listele oficiale pentru a afla ID-urile reale din sistem
        const provResp = await axios.post(apiUrl, {
            jsonrpc: '2.0', method: 'getProviderList', params: [], id: 2
        }, { headers: { 'X-Company-Login': company, 'X-Token': token } });

        const servResp = await axios.post(apiUrl, {
            jsonrpc: '2.0', method: 'getServiceList', params: [], id: 3
        }, { headers: { 'X-Company-Login': company, 'X-Token': token } });

        res.send(`
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"><title>Scanare Cloud</title></head>
            <body style="font-family: Arial; padding: 40px; background: #f0f2f5;">
                <div style="background: white; padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #1a73e8;">🛰️ Scanner Active Data (Cloud Mode)</h2>
                    <h3>👥 Furnizori (Providers) detectați:</h3>
                    <pre style="background: #eee; padding: 10px; border-radius: 4px;">${JSON.stringify(provResp.data.result, null, 2)}</pre>
                    <h3>📦 Servicii (Services) detectate:</h3>
                    <pre style="background: #eee; padding: 10px; border-radius: 4px;">${JSON.stringify(servResp.data.result, null, 2)}</pre>
                    <p>💡 Sfat: Dacă listele apar goale [], înseamnă că serviciile sau furnizorii trebuie activați ca publici în cont.</p>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        res.send(`<h1>❌ Eroare scanare:</h1><p>${error.message}</p>`);
    }
});

const portActual = process.env.PORT || port;
app.listen(portActual, () => { console.log('🚀 Scanner pornit.'); });
