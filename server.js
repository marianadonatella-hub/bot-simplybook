const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const company = 'maranatest';
const apiKey = '0bf6ea3730306fa9266fc5e7e08f6fb1adff99c64986d04c2c2890c122cb5b1a';
const loginUrl = 'https://simplybook.me';
const apiUrl = 'https://simplybook.me';

async function getSimplybookToken() {
    const loginResponse = await axios.post(loginUrl, {
        jsonrpc: '2.0', method: 'getToken', params: [company, apiKey], id: 1
    });
    return loginResponse.data.result;
}

// ========================================================
// RUTA 1: SERVICII + DURATĂ + PREȚ (EXTRASE COMPLET DINAMIC)
// ========================================================
app.get('/servicii', async (req, res) => {
    console.log('📡 Voiceflow solicită catalogul de servicii...');
    try {
        const token = await getSimplybookToken();
        const response = await axios.post(apiUrl, {
            jsonrpc: '2.0', method: 'getServiceList', params: [], id: 2
        }, { headers: { 'X-Company-Login': company, 'X-Token': token } });

        const serviciiCurate = Object.keys(response.data.result).map(id => ({
            id: id,
            name: response.data.result[id].name,
            price: response.data.result[id].price,
            duration: response.data.result[id].duration // Durata în minute extrasă live!
        }));

        res.json({ success: true, services: serviciiCurate });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========================================================
// RUTA 2: FURNIZORI / ANGAJAȚI DEDICAȚI (EXTRASE DINAMIC)
// ========================================================
app.get('/angajati', async (req, res) => {
    console.log('📡 Voiceflow solicită lista de angajați...');
    try {
        const token = await getSimplybookToken();
        const response = await axios.post(apiUrl, {
            jsonrpc: '2.0', method: 'getProviderList', params: [], id: 3
        }, { headers: { 'X-Company-Login': company, 'X-Token': token } });

        const angajatiCurati = Object.keys(response.data.result).map(id => ({
            id: id,
            name: response.data.result[id].name
        }));

        res.json({ success: true, providers: angajatiCurati });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========================================================
// RUTA 3: ORE LIBERE ÎN FUNCȚIE DE ANGAJAT ȘI DATĂ
// ========================================================
app.post('/ore-libere', async (req, res) => {
    const { providerId, date } = req.body; 
    console.log(`📡 Solicitare ore pentru furnizor ID: ${providerId} pe data: ${date}`);
    try {
        const token = await getSimplybookToken();
        const response = await axios.post(apiUrl, {
            jsonrpc: '2.0',
            method: 'getStartTimeMatrix',
            params: [date, date, providerId], // Verificăm exact angajatul ales din Voiceflow!
            id: 4
        }, { headers: { 'X-Company-Login': company, 'X-Token': token } });

        const oreLibere = response.data.result[date] || [];
        res.json({ success: true, available_times: oreLibere });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========================================================
// RUTA 4: REZERVAREA FINALĂ COMPLETĂ (SaaS COMPLET)
// ========================================================
app.post('/rezerva', async (req, res) => {
    const { name, email, phone, date, time, serviceId, providerId } = req.body;
    console.log(`📡 Executare programare în sistem pentru: ${name}`);
    try {
        const token = await getSimplybookToken();
        const clientData = { name, email, phone: phone || '0722123456' };

        const response = await axios.post(apiUrl, {
            jsonrpc: '2.0',
            method: 'book',
            params: [serviceId, providerId, date, time, clientData, null],
            id: 5
        }, { headers: { 'X-Company-Login': company, 'X-Token': token } });

        if (response.data.error) {
            res.json({ success: false, error: response.data.error.message });
        } else {
            res.json({ success: true, booking_code: response.data.result.bookings.code });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`🚀 Hub-ul SaaS rulează live pe portul ${port}`);
});
