const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="ro">
        <head>
            <meta charset="UTF-8">
            <title>Asistent AI - Programări Automate</title>
            <style>
                body { font-family: Arial, sans-serif; background: #f0f2f5; padding: 40px; display: flex; justify-content: center; }
                .card { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
                h2 { color: #1a73e8; text-align: center; }
                label { font-weight: bold; display: block; margin: 10px 0 5px; }
                input { width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box; }
                button { width: 100%; background: #1a73e8; color: white; border: none; padding: 12px; border-radius: 6px; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 10px; }
            </style>
        </head>
        <body>
            <div class="card">
                <h2>🤖 Asistent AI Programări (Parametri Oficiali)</h2>
                <form action="/rezerva" method="POST">
                    <label>Nume Client:</label>
                    <input type="text" name="name" required>
                    
                    <label>Email:</label>
                    <input type="email" name="email" required>
                    
                    <label>Dată:</label>
                    <input type="date" name="date" required>
                    
                    <label>Oră:</label>
                    <input type="time" name="time" required>
                    
                    <button type="submit">Trimite Programarea</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

app.post('/rezerva', async (req, res) => {
    const { name, email, date, time } = req.body;
    console.log(`\n🚨 [SERVER] Cerere recepționată! Nume: ${name}, Dată: ${date}, Oră: ${time}`);
    
    const company = 'maranatest';
    const apiKey = 'api_user_key_NRKmlvmoLPtCfyJLVib6Csz33VNYFng8VejjeoE4JfI';
    
    const loginUrl = 'https://simplybook.me';
    const apiUrl = 'https://simplybook.me';

    try {
        console.log('⏳ Solicit token de acces public...');
        const loginResponse = await axios.post(loginUrl, {
            jsonrpc: '2.0', method: 'getToken', params: [company, apiKey], id: 1
        });
        
        const token = loginResponse.data.result;
        console.log('✅ Token validat cu succes!');

        // Aliniem structura cuvinte cu cuvinte după dictarea suportului tehnic SimplyBook!
        const dateRezervareOficiale = {
            eventId: '1',               // ID-ul serviciului (Consultație)
            unitId: '1',                // ID-ul furnizorului (Doctor Popa)
            date: date,                 // Data culeasă (YYYY-MM-DD)
            time: time + ':00',         // Ora formatată (HH:MM:SS)
            clientData: {
                name: name,
                email: email,
                phone: '0722123456'
            }
        };

        console.log(`⏳ Trimit comanda 'book' cu noii parametri aliniați...`);
        const response = await axios.post(apiUrl, {
            jsonrpc: '2.0',
            method: 'book',
            params: [
                dateRezervareOficiale.eventId,
                dateRezervareOficiale.unitId,
                dateRezervareOficiale.date,
                dateRezervareOficiale.time,
                dateRezervareOficiale.clientData
            ],
            id: 2
        }, {
            headers: {
                'X-Company-Login': company,
                'X-Token': token,
                'Content-Type': 'application/json'
            }
        });

        console.log(`📦 Răspuns brut:`, JSON.stringify(response.data));

        if (response.data.error) {
            res.send(`<h1>❌ SimplyBook a respins programarea:</h1><div style="background:#ffebee;color:#c62828;padding:15px;border-radius:6px;font-family:monospace;font-weight:bold;">${response.data.error.message}</div><a href="/">Înapoi</a>`);
        } else {
            res.send(`
                <body style="font-family: Arial; text-align: center; padding: 50px; background: #e8f5e9;">
                    <div style="background: white; padding: 40px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        <h1 style="color: #2e7d32; font-size: 36px; margin-bottom: 10px;">🎉 VICTORIE!!!</h1>
                        <h2 style="color: #388e3c; margin-top: 0;">Programarea a fost înregistrată!</h2>
                        <p style="font-size: 18px; color: #444;">ID Rezervare returnat: <b>${JSON.stringify(response.data.result)}</b></p>
                        <p style="color: #666;">Deschide acum <b>Calendarul SimplyBook</b> online și vezi numele! 🚀</p>
                        <br>
                        <a href="/" style="background: #2e7d32; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">Fă o nouă programare</a>
                    </div>
                </body>
            `);
        }

    } catch (error) {
        console.log(`❌ Eroare la procesare:`, error.message);
        res.send(`<h1>❌ Eroare server:</h1><p>${error.message}</p><a href="/">Înapoi</a>`);
    }
});

const portActual = process.env.PORT || port;
app.listen(portActual, () => {
    console.log(`🚀 Serverul oficial rulează la adresa: http://localhost:${portActual}`);
});
