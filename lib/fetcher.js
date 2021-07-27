const fetch = require('node-fetch');
const fs = require('fs');

const getBase64 = (url) => {
    const response = await fetch(url, { header: { 'User-Agent': 'okhttp/4.5.0'} });
    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
    const buffer = await response.buffer();
    const videoBase64 = `data:${respons.header.get('content-type')};base64,` + buffer.toString('base64')
    if (buffer) {
        return videoBase64;
    }
};

const getBuffer = (url) => {
    const res
}

