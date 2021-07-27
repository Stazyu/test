const {
    Mimetype,
    MessageType
} = require('@adiwajshing/baileys')
const fetch = require('node-fetch')
const { default: Axios } = require('axios')
const fs = require('fs')
const FormData = require('form-data')
const fromBuffer = require('file-type')
const request = require('request')

const { conn } = require('../connection/connect')
const wa = conn

/**
 * Sending sticker
 * @param jid of the chat
 * @param data Buffer or path to file
 * @param options baileys Message Options
 */
const sticker = function(jid, data, options={}) {
    if (typeof data === 'string') {
        wa.sendMessage(jid, fs.readFileSync(data), MessageType.sticker, options)
    } else {
        wa.sendMessage(jid, data, MessageType.sticker, options)
    }
}

/**
 * Serialize
 * @param chat message
 * @returns message
 */
const serialize = function(chat) {
    m = JSON.parse(JSON.stringify(chat)).messages[0]
    const content = m.message

    try {
        const tipe = Object.keys(content)[0]
        m.type = tipe
    } catch {
        m.type = null
    }

    if (m.type === 'ephemeralMessage') {
        m.message = m.message.ephemeralMessage.message

        try {
            const tipe = Object.keys(m.message)[0]
            m.type = tipe
        } catch {
            m.type = null
        }

        m.isEphemeral = true
    } else {
        m.isEphemeral = false
    }

    m.isGroup = m.key.remoteJid.endsWith('@g.us')
    m.from = m.key.remoteJid

    try {
        const quote = m.message.extendedTextMessage.contextInfo
        if (quote.quotedMessage["ephemeralMessage"]) {
            m.quoted = { stanzaId: quote.stanzaId, participant: quote.participant, message: quote.quotedMessage.ephemeralMessage.message }
        } else {
            m.quoted = { stanzaId: quote.stanzaId, participant: quote.participant, message: quote.quotedMessage }
        }
    } catch {
        m.quoted = null
    }

    try {
        const mention = m.message[m.type].contextInfo.mentionedJid
        m.mentionedJid = mention
    } catch {
        m.mentionedJid = null
    }

    if(m.isGroup) {
        m.sender = m.participant
    } else {
        m.sender = m.key.remoteJid
    }

    if (m.key.fromMe) {
        m.sender = wa.user.jid
    }

    const txt = (m.type === 'conversation' && m.message.conversation) ? m.message.conversation 
    : (m.type == 'imageMessage') && m.message[m.type].caption ? m.message[m.type].caption 
    : (m.type == 'videoMessage') && m.message[m.type].caption ? m.message[m.type].caption 
    : (m.type == 'extendedTextMessage') && m.message[m.type].text ? m.message[m.type].text : ''
    m.body = txt

    return m
}


const sendText = ( from, teks, msg ) => {
    wa.sendMessage(from, teks, MessageType.text, { quoted: msg })
}

const reply = ( from, teks, msg ) => {
    wa.sendMessage(from, teks, MessageType.text, { quoted: msg })
}

/** 
* Sending sticker
* @param jid of the chat
* @param data Buffer or path to file
* @param options baileys Message Options
*/

const sendSticker = (from, data, msg) => {
    if (typeof data === 'string') {
        wa.sendMessage(from, fs.readFileSync(data), MessageType.sticker, { quoted: msg })
    } else {
        wa.sendMessage(from, data, MessageType.sticker, { quoted: msg })
    }
    //wa.sendMessage(from, filename, MessageType.sticker, { quoted: msg } )
}

function sendImage (jid, data, options={}) {
    if (typeof data === 'string') {
        wa.sendMessage(jid, fs.readFileSync(data), MessageType.image, options)
    } else {
        wa.sendMessage(jid, data, MessageType.image, options)
    }
}

const uptotele = async (media) => new Promise(async (resolve, reject) => {
	try {
		let { ext } = await fromBuffer(media)
		console.log('Uploading image to server telegra.ph')
		let form = new FormData()
		form.append('file', media, 'tmp.' + ext)
		await fetch('https://telegra.ph/upload', {
			method: 'POST',
			body: form
		})
		.then(res => res.json())
		.then(res => {
			if (res.error) return reject(res.error)
			resolve('https://telegra.ph' + res[0].src)
			console.log('ok sukses')
		})
		.catch(err => reject(err))
	} catch (e) {
		return console.log(e)
	}
})

const sendMediaURL = async (to, url, text="", mids=[], msg) =>{
    if(mids.length > 0){
        text = normalizeMention(to, text, mids)
    }
    const fn = Date.now() / 10000;
    const filename = fn.toString()
    let mime = ""
    var download = function (uri, filename, callback) {
        request.head(uri, function (err, res, body) {
            mime = res.headers['content-type']
            request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
        });
    };
    download(url, filename, async function () {
        console.log('done');
        let media = fs.readFileSync(filename)
        let type = mime.split("/")[0]+"Message"
        if(mime === "image/gif"){
            type = MessageType.video
            mime = Mimetype.gif
        }
        if(mime.split("/")[0] === "audio"){
            mime = Mimetype.mp4Audio
        }
        conn.sendMessage(to, media, type, { quoted: msg, mimetype: mime, caption: text,contextInfo: {"mentionedJid": mids}})
        
        fs.unlinkSync(filename)
    });
}   

module.exports = { sendText, serialize, reply, sendSticker, sticker, sendImage, uptotele, sendMediaURL }