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
                <h2>🤖 Asistent AI Programări (Testul de Aur)</h2>
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
    console.log(`\n🚨 [SERVER] Cerere primită! Nume: ${name}`);
    
    const company = 'maranatest';
    // Utilizăm cheia ta publică originală din Custom Features, aprobată pentru rezervări!
    const apiKey = '0bf6ea3730306fa9266fc5e7e08f6fb1adff99c64986d04c2c2890c122cb5b1a';
    
    const loginUrl = 'https://user-api.simplybook.me/login';
    const apiUrl = 'https://user-api.simplybook.me';

    try {
        console.log('⏳ Solicit token de acces prin cheia publică oficială...');
        const loginResponse = await axios.post(loginUrl, {
            jsonrpc: '2.0', method: 'getToken', params: [company, apiKey], id: 1
        });
        
        const token = loginResponse.data.result;
        console.log('✅ Token primit de la SimplyBook.');

        const clientData = {
            name: name,
            email: email,
            phone: '0722123456'
        };

        console.log(`⏳ Trimit rezervarea finală în format masiv standard...`);
        const response = await axios.post(apiUrl, {
            jsonrpc: '2.0',
            method: 'book',
            // Tritem parametrii EXACT ca masiv simplu ordonat conform ghidului SimplyBook!
            params: [
                "1",                // 1. eventId (Consultație)
                "1",                // 2. unitId (Doctor Popa)
                date,               // 3. date (YYYY-MM-DD)
                time + ':00',       // 4. time (HH:MM:SS)
                clientData,         // 5. clientData (obiect)
                null                // 6. additionalFields (marcat ca null conform standardului JSON-RPC public)
            ],
            id: 2
        }, {
            headers: {
                'X-Company-Login': company,
                'X-Token': token,
                'Content-Type': 'application/json'
            }
        });

        console.log(`📦 Răspuns brut server:`, JSON.stringify(response.data));

        if (response.data.error) {
            res.send(`<h1>❌ SimplyBook a respins datele:</h1><div style="background:#ffebee;color:#c62828;padding:15px;border-radius:6px;font-family:monospace;font-weight:bold;">Eroare: ${response.data.error.message}</div><a href="/">Înapoi</a>`);
        } else {
            res.send(`
                <body style="font-family: Arial; text-align: center; padding: 50px; background: #e8f5e9;">
                    <div style="background: white; padding: 40px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        <h1 style="color: #2e7d32; font-size: 36px; margin-bottom: 10px;">🎉 VICTORIE!!!</h1>
                        <h2 style="color: #388e3c; margin-top: 0;">Programarea a fost salvată cu succes!</h2>
                        <p style="font-size: 18px; color: #444;">ID Rezervare în sistem: <b>${JSON.stringify(response.data.result)}</b></p>
                        <p style="color: #666;">Deschide acum <b>Calendarul SimplyBook</b> online! Numele tău este acolo! 🚀</p>
                        <br>
                        <a href="/" style="background: #2e7d32; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">Fă o nouă programare</a>
                    </div>
                </body>
            `);
        }

    } catch (error) {
        console.log(`❌ Eroare rețea:`, error.message);
        res.send(`<h1>❌ Eroare server:</h1><p>${error.message}</p><a href="/">Înapoi</a>`);
    }
});

const portActual = process.env.PORT || port;
app.listen(portActual, () => {
    console.log(`🚀 Serverul funcționează perfect.`);
});
