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
                <h2>🤖 Asistent AI Programări</h2>
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
    console.log(`\n🚨 [SERVER] Cerere nouă primită pentru: ${name}`);
    
    const company = 'maranatest';
    const apiKey = '0bf6ea3730306fa9266fc5e7e08f6fb1adff99c64986d04c2c2890c122cb5b1a';
    
    const loginUrl = 'https://simplybook.me';
    const apiUrl = 'https://simplybook.me';

    try {
        const loginResponse = await axios.post(loginUrl, {
            jsonrpc: '2.0', method: 'getToken', params: [company, apiKey], id: 1
        });
        const token = loginResponse.data.result;

        const clientData = { name, email, phone: '0722123456' };

        const response = await axios.post(apiUrl, {
            jsonrpc: '2.0',
            method: 'book',
            params: ["2", "2", date, time + ':00', clientData, null],
            id: 2
        }, {
            headers: {
                'X-Company-Login': company,
                'X-Token': token,
                'Content-Type': 'application/json'
            }
        });

        if (response.data.error) {
            res.send(`<h1>❌ Rezervarea nu a putut fi salvată:</h1><div style="background:#ffebee;color:#c62828;padding:15px;border-radius:6px;font-family:monospace;font-weight:bold;">${response.data.error.message}</div><a href="/">Înapoi</a>`);
        } else {
            // EXTRAGEM CODUL SALVATOR CURAT DIN INTERIORUL BANCHETULUI DE DATE
            const codRezervare = response.data.result.bookings[0].code;
            
            res.send(`
                <body style="font-family: Arial; text-align: center; padding: 50px; background: #e8f5e9;">
                    <div style="background: white; padding: 40px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 15px rgba(0,0,0,0.1); max-width: 450px;">
                        <h1 style="color: #2e7d32; font-size: 32px; margin-bottom: 10px;">🎉 Programare Reușită!</h1>
                        <h2 style="color: #388e3c; margin-top: 0; font-size: 20px;">Rezervarea a fost salvată oficial în calendar.</h2>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 18px; color: #333; text-align: left; margin-left: 20px;">
                            👤 <b>Client:</b> ${name}<br>
                            📅 <b>Data:</b> ${date}<br>
                            🕒 <b>Ora:</b> ${time}<br>
                            🔑 <b>Cod Confirmare:</b> <span style="background: #e8f5e9; padding: 2px 8px; border-radius: 4px; font-family: monospace; font-weight: bold; color: #2e7d32;">${codRezervare}</span>
                        </p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="color: #666; font-size: 14px;">Un email de confirmare a fost trimis către sistemul administrativ. 🚀</p>
                        <br>
                        <a href="/" style="background: #2e7d32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Fă o nouă programare</a>
                    </div>
                </body>
            `);
        }

    } catch (error) {
        res.send(`<h1>❌ Eroare server:</h1><p>${error.message}</p><a href="/">Înapoi</a>`);
    }
});

const portActual = process.env.PORT || port;
app.listen(portActual, () => { console.log(\`🚀 Server pregătit.\`); });
