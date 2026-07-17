const axios = require('axios');
require('dotenv').config();

class SimplyBookClient {
    constructor() {
        this.company = process.env.SIMPLYBOOK_COMPANY;
        this.apiKey = process.env.SIMPLYBOOK_API_KEY;
        this.token = null;
        this.baseUrl = 'https://simplybook.it';
    }

    // Pasul 1: Obținerea tokenului de securitate obligatoriu
    async getToken() {
        if (this.token) return this.token;

        if (!this.company || !this.apiKey) {
            throw new Error('❌ Lipsesc credențialele! Completează SIMPLYBOOK_COMPANY și SIMPLYBOOK_API_KEY în fișierul .env');
        }

        try {
            const response = await axios.post(`${this.baseUrl}/login`, {
                jsonrpc: '2.0',
                method: 'getToken',
                params: [this.company, this.apiKey],
                id: 1
            });

            if (response.data.error) {
                throw new Error(`API Error: ${JSON.stringify(response.data.error)}`);
            }

            this.token = response.data.result;
            return this.token;
        } catch (error) {
            console.error('❌ Eroare la autentificare SimplyBook:', error.message);
            throw error;
        }
    }

    // Ruta de Căutare: Obține intervalele orare disponibile pentru o anumită dată (Format: YYYY-MM-DD)
    async getAvailableSlots(date, providerId = null, serviceId = null) {
        const token = await this.getToken();
        try {
            const response = await axios.post(`${this.baseUrl}/`, {
                jsonrpc: '2.0',
                method: 'getStartTimeMatrix',
                params: [date, date, providerId, serviceId, 1],
                id: 2
            }, {
                headers: {
                    'X-Company-Login': this.company,
                    'X-Token': token
                }
            });

            if (response.data.error) throw new Error(JSON.stringify(response.data.error));
            
            // Returnează o listă simplă cu orele libere (ex: ["09:00", "10:30"])
            const matrix = response.data.result || {};
            return matrix[date] || [];
        } catch (error) {
            console.error('❌ Eroare la obținerea orelor libere:', error.message);
            throw error;
        }
    }

    // Ruta de Rezervare: Creează programarea finală cu datele clientului
    async createBooking(bookingDetails) {
        const token = await this.getToken();
        try {
            // Structura exactă cerită de protocolul JSON-RPC SimplyBook
            const response = await axios.post(`${this.baseUrl}/`, {
                jsonrpc: '2.0',
                method: 'book',
                params: [bookingDetails],
                id: 3
            }, {
                headers: {
                    'X-Company-Login': this.company,
                    'X-Token': token
                }
            });

            if (response.data.error) throw new Error(JSON.stringify(response.data.error));
            return response.data.result; // Returnează detaliile programării confirmate
        } catch (error) {
            console.error('❌ Eroare la finalizarea programării:', error.message);
            throw error;
        }
    }
}

module.exports = SimplyBookClient;