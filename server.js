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
                <h2>🤖 Asistent AI Programări (Fus Orar Securizat)</h2>
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
    console.log(`\n🚨 [SERVER] Am primit cerere! Nume: ${name}, Dată: ${date}, Oră: ${time}`);
    
    const company = 'maranatest';
    const apiKey = '0bf6ea3730306fa9266fc5e7e08f6fb1adff99c64986d04c2c2890c122cb5b1a';
    const urlV2 = `https://simplybook.it`;

    // TRUCUL SUPREM: Lipim Data, Ora și adăugăm manual fusul orar al României (+03:00) pentru vară
    // Formatul final va fi de tipul: "2026-07-20T11:00:00+03:00"
    const dataOraSecurizata = `${date}T${time}:00+03:00`;
    console.log(`🕒 Trimit timp formatat ISO universal: ${dataOraSecurizata}`);

    const dateRezervarev2 = {
        client: { name, email, phone: '0722123456' },
        bookings: [{
            start_datetime: dataOraSecurizata, // Folosim noul parametru standard V2 pentru timp controlat
            provider_id: 1,
            service_id: 1
        }]
    };

    try {
        console.log(`⏳ Trimit programarea prin API V2...`);
        const response = await axios.post(urlV2, dateRezervarev2, {
            headers: {
                'X-Company-Login': company,
                'X-Token': apiKey,
                'Content-Type': 'application/json'
            }
        });

        console.log(`✅ Răspuns primit:`, JSON.stringify(response.data));

        res.send(`
            <body style="font-family: Arial; text-align: center; padding: 50px; background: #e8f5e9;">
                <div style="background: white; padding: 40px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    <h1 style="color: #2e7d32; font-size: 36px; margin-bottom: 10px;">🎉 VICTORIE!!!</h1>
                    <h2 style="color: #388e3c; margin-top: 0;">Programarea a fost salvată în calendar!</h2>
                    <p style="font-size: 18px; color: #444;">ID Rezervare returnat: <b>${JSON.stringify(response.data)}</b></p>
                    <p style="color: #666;">Deschide acum <b>Calendarul SimplyBook</b> online și verifică! 🚀</p>
                    <br>
                    <a href="/" style="background: #2e7d32; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">Fă o nouă programare</a>
                </div>
            </body>
        `);

    } catch (error) {
        console.log(`❌ Eroare la trimitere:`, error.response ? JSON.stringify(error.response.data) : error.message);
        
        let mesajEroare = error.message;
        if (error.response && error.response.data && error.response.data.message) {
            mesajEroare = error.response.data.message;
        }

        res.send(`
            <h1>❌ SimplyBook a respins rezervarea:</h1>
            <div style="background:#ffebee;color:#c62828;padding:15px;border-radius:6px;font-family:monospace;font-weight:bold;">
                ${mesajEroare}
            </div>
            <p>💡 Sfat: Verifică dacă ora aleasă este în interiorul orarului 09:00 - 18:00.</p>
            <a href="/">Înapoi</a>
        `);
    }
});

app.listen(port, () => {
    console.log(`🚀 Serverul REST V2 rulează la adresa: http://localhost:${port}`);
});