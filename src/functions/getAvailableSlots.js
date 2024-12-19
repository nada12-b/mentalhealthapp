const { app } = require('@azure/functions');
const mysql = require('mysql2');
const util = require('util');
const fs = require('fs');
const caCert = fs.readFileSync('../../certs/DigiCertGlobalRootCA.crt.pem');


app.http('getAvailableSlots', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const therapistId = request.query.get('therapist_id');
        const date = request.query.get('date');

        if (!therapistId || !date) {
            return {
                status: 400,
                body: "Please provide therapist_id and date"
            };
        }

        const connection = mysql.createConnection({
            host: 'cloudprojectranyauir.mysql.database.azure.com',
            port: 3306,
            user: 'ranya',
            password: 'soufret1159//?',
            database: 'cloudsql',
            ssl: {
                ca: caCert
            }
        });

        const query = util.promisify(connection.query).bind(connection);

        try {
            // Before connecting:
            context.log("Attempting DB connection...");

            connection.connect((err) => {
                if (err) {
                    context.log("DB connection error:", err);
                } else {
                    context.log("DB connected successfully");
                }
            });

            context.log("Running query...");

            const sql = `
              SELECT availability_id, therapist_id, available_date, start_time, end_time
              FROM Availability
              WHERE therapist_id = ? AND available_date = ?
            `;

            const results = await query(sql, [therapistId, date]);
            context.log("Query executed, results:", results);

            return {
                status: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(results)
            };

        } catch (err) {
            context.log('Error: ', err);
            return {
                status: 500,
                body: "Internal Server Error"
            };
        } finally {
            connection.end();
        }
    }
});