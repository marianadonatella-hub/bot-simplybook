const axios = require('axios');

async function citesteOreLibere() {
    console.log('🤖 Interghez orarul public SimplyBook pentru validarea ID-urilor...');
    
    const company = 'maranatest';
    const apiKey = '0bf6ea3730306fa9266fc5e7e08f6fb1adff99c64986d04c2c2890c122cb5b1a';
    const endpointUrl = 'https://simplybook.me';

    try {
        // Solicităm matricea de timp pentru lunea viitoare, 20 iulie 2026 (zi de lucru sigură)
        const response = await axios.post(endpointUrl, {
            jsonrpc: '2.0',
            method: 'getStartTimeMatrix',
            params: [
                '2026-07-20', // Data (Format: YYYY-MM-DD)
                '1',          // ID furnizor testat
                '1'           // ID serviciu testat
            ],
            id: 1
        }, {
            headers: { 'X-Company-Login': company, 'X-Token': apiKey }
        });

        console.log('██████████████████████████████████████████████████');
        console.log('📦 RĂSPUNS INTEGRAL SERVER:');
        console.log(JSON.stringify(response.data, null, 2));
        console.log('██████████████████████████████████████████████████');

    } catch (error) {
        console.error('❌ Eroare la conectare:', error.message);
    }
}

citesteOreLibere();