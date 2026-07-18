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
// RUTA 1: SERVICII FORMATEATE PENTRU LISTA NATIVĂ VOICEFLOW
// ========================================================
app.get('/servicii', async (req, res) => {
    console.log('📡 Voiceflow solicită catalogul de servicii...');
    try {
        const token = await getSimplybookToken();
        const response = await axios.post(apiUrl, {
            jsonrpc: '2.0', method: 'getServiceList', params: [], id: 2
        }, { headers: { 'X-Company-Login': company, 'X-Token': token } });

        const rawServices = response.data.result;
        
        if (!rawServices || Object.keys(rawServices).length === 0) {
            return res.json([
                "Consultație Generală - 150 RON (30 min)",
                "Terapie / Tratament - 250 RON (60 min)"
            ]);
        }

        const serviciiFormatate = Object.keys(rawServices).map(id => {
            const name = rawServices[id].name || "Serviciu";
            const price = rawServices[id].price || "0";
            const duration = rawServices[id].duration || "30";
            return `${name} - ${price} RON (${duration} min)`;
        });

        res.json(serviciiFormatate);
    } catch (error) {
        res.json([
            "Consultație Generală - 150 RON (30 min)",
            "Tratament Medical - 250 RON (60 min)"
        ]);
    }
});

// ========================================================
// RUTA 2: FURNIZORI / ANGAJAȚI DEDICAȚI
// ========================================================
app.get('/angajati', async (req, res) => {
    console.log('📡 Voiceflow solicită lista de angajați...');
    try {
        const token = await getSimplybookToken();
        const response = await axios.post(apiUrl, {
            jsonrpc: '2.0', method: 'getProviderList', params: [], id: 3
        }, { headers: { 'X-Company-Login': company, 'X-Token': token } });

        const rawProviders = response.data.result;
        if (!rawProviders || Object.keys(rawProviders).length === 0) {
            return res.json(["Doctor Popa (Principal)"]);
        }

        const angajatiFormatati = Object.keys(rawProviders).map(id => {
            return rawProviders[id].name || "Angajat";
        });

        res.json(angajatiFormatati);
    } catch (error) {
        res.json(["Doctor Popa (Fallback)"]);
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
            jsonrpc: '2.0', method: 'getStartTimeMatrix', params: [date, date, providerId || "2"], id: 4
        }, { headers: { 'X-Company-Login': company, 'X-Token': token } });

        const oreLibere = response.data.result[date] || [];
        
        if (oreLibere.length === 0) {
            return res.json(["09:00", "11:00", "14:00", "16:00"]);
        }
        
        res.json(oreLibere);
    } catch (error) {
        res.json(["09:00", "11:00", "14:00", "16:00"]);
    }
});

// ========================================================
// RUTA 4: REZERVAREA FINALĂ COMPLETĂ
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
            params: [serviceId || "2", providerId || "2", date, time, clientData, null],
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
    console.log(`🚀 Sistemul complet SaaS rulează pe portul ${port}`);
});
