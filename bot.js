require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { CohereClient } = require('cohere-ai');

const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY
});
const gruposPermitidos = ["120363392368357106@g.us", "120363274018771088@g.us", "51922243179@c.us"]; // IDs de los grupos

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Bot conectado a WhatsApp');
});

client.on('message', async message => {
    console.log(`Mensaje recibido: ${message.body}`);

    if (!gruposPermitidos.includes(message.from)) {
        return; // Ignorar mensajes fuera de los grupos permitidos
    }

    const contenidoMensaje = message.body.trim();
    if (contenidoMensaje.length === 0) {
        console.log("Mensaje vacío recibido, no se enviará a Cohere.");
        return;
    }

    let respuesta = "Te odio chatgpt";
    try {
        const response = await cohere.chat({
            model: 'command',
            message: contenidoMensaje,
            max_tokens: 30,
        });

       
        respuesta = response.text;
        
    } catch (error) {
        console.error("Error con Cohere:", error);
    }

    client.sendMessage(message.from, respuesta);
    console.log(`Respuesta enviada: ${respuesta}`);
});


client.initialize();
