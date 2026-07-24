const express = require('express');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const CALENDAR_ID = process.env.CALENDAR_ID || 'primary'; 
const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');

const auth = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    ['https://googleapis.com']
);

const calendar = google.calendar({ version: 'v3', auth });

app.get('/servicii', (req, res) => {
    console.log('📡 Typebot solicită catalogul de servicii...');
    res.json([
        "Consultație Generală - 150 RON (30 min)",
        "Terapie / Tratament - 250 RON (60 min)"
    ]);
});

app.get('/angajati', (req, res) => {
    res.json(["Doctor Popa (Principal)"]);
});

// Suportă și POST și GET pentru a fi siguri
app.all('/ore-libere', async (req, res) => {
    const date = req.query.date || req.body.date; 
    console.log(`📡 Solicitare ore Google Calendar pentru data: ${date}`);

    const sloturiStandard = ["09:00", "11:00", "12:00", "14:00", "16:00"];

    try {
        let formattedDate = date;
        if (date && date.includes('/')) {
            const parti = date.split('/');
            formattedDate = `${parti[2]}-${parti[1]}-${parti[0]}`; // Corecție format dd/MM/yyyy -> yyyy-MM-dd
        }

        const timeMin = new Date(`${formattedDate}T00:00:00Z`).toISOString();
        const timeMax = new Date(`${formattedDate}T23:59:59Z`).toISOString();

        const response = await calendar.events.list({
            calendarId: CALENDAR_ID,
            timeMin: timeMin,
            timeMax: timeMax,
            singleEvents: true,
            orderBy: 'startTime',
        });

        const evenimenteOcupate = response.data.items || [];
        
        const oreOcupate = evenimenteOcupate.map(evt => {
            const startStr = evt.start.dateTime || evt.start.date;
            return new Date(startStr).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Bucharest' });
        });

        const oreLibereFinale = sloturiStandard.filter(ora => !oreOcupate.includes(ora));
        res.json(oreLibereFinale.length === 0 ? ["Nu mai sunt ore libere azi"] : oreLibereFinale);
    } catch (error) {
        res.json(sloturiStandard); 
    }
});

// REZERVAREA FINALĂ - MODIFICATĂ SĂ ACCEPTE LINK-UL TĂU DIRECT
app.all('/rezerva', async (req, res) => {
    let name = (req.query.name || req.body.name || "").toString().trim();
    let email = (req.query.email || req.body.email || "").toString().trim();
    let phone = (req.query.phone || req.body.phone || "").toString().trim();
    let date = (req.query.date || req.body.date || "").toString().trim();
    let time = (req.query.time || req.body.time || "").toString().trim();
    let serviceId = (req.query.serviceId || req.body.serviceId || "").toString().trim();

    console.log(`📡 Executare programare pentru: ${name} la ora ${time}`);

    try {
        let formattedDate = date;
        if (date && date.includes('/')) {
            const parti = date.split('/');
            formattedDate = `${parti[2]}-${parti[1]}-${parti[0]}`; // Corecție format dd/MM/yyyy -> yyyy-MM-dd
        }

        let durataMinute = 30;
        if (serviceId.toLowerCase().includes('terapie') || serviceId.toLowerCase().includes('tratament')) {
            durataMinute = 60;
        }

        const startDateTime = new Date(`${formattedDate}T${time}:00+03:00`); 
        const endDateTime = new Date(startDateTime.getTime() + durataMinute * 60000);

        const event = {
            summary: `Programare: ${serviceId}`, // Va scrie numele întreg al serviciului
            description: `Client: ${name}\nEmail: ${email}\nTelefon: ${phone}`,
            start: { dateTime: startDateTime.toISOString(), timeZone: 'Europe/Bucharest' },
            end: { dateTime: endDateTime.toISOString(), timeZone: 'Europe/Bucharest' },
            attendees: [{ email: email }],
            reminders: { useDefault: true }
        };

        await calendar.events.insert({
            calendarId: CALENDAR_ID,
            resource: event,
        });

        console.log(`✅ SALVAT ÎN GOOGLE CALENDAR PENTRU: ${name}`);
        res.json({ success: true, message: "Salvat cu succes!" });
    } catch (error) {
        console.error('❌ Eroare Google:', error.message);
        res.json({ success: false, error: error.message });
    }
});

const port = process.env.PORT || 10000;
app.listen(port, () => {
    console.log(`🚀 Motorul rulează pe portul ${port}`);
});
