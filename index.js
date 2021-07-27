const {
    WAConnection,
    MessageType,
    Presence,
    Mimetype,
    GroupSettingChange
} = require('@adiwajshing/baileys')
const { color, bgcolor } = require('./lib/Color')
const { text } = require('./lib/text')
const fs = require('fs')
const moment = require('moment-timezone')
const { exec } = require('child_process')
const Exec = require('await-exec')
// const { serialize } = require('./lib/functions')
const bot = require('./lib/functions')
const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios');


const { conn, connect } = require('./connection/connect')
const Exif = require('./lib/exif')
const exif = new Exif()
const { stickerimg, stickergif, stickertoimg, stickergiftomp4 } = require('./lib/sticker')
const dbverify = JSON.parse(fs.readFileSync('./lib/database/user/verify.json'))
const welcome = JSON.parse(fs.readFileSync('./lib/database/group/welcome.json'))
const simimi = JSON.parse(fs.readFileSync('./lib/database/group/simi.json'))
const setting = JSON.parse(fs.readFileSync('./setting.json'))
const { webp2mp4File } = require('./lib/webp2mp4')
const { blue } = require('chalk')
const { ownerNumber, Zeksapi } = setting
const prefix = '!'

connect()

function kyun(seconds) {
    function pad(s) {
        return (s < 10 ? '0' : '') + s;
    }
    var hours = Math.floor(seconds / (60*60));
    var minutes = Math.floor(seconds % (60*60) / 60);
    var seconds = Math.floor(seconds % 60);

    return `${pad(hours)} Jam ${pad(minutes)} Menit ${pad(seconds)} Detik`
};

// function printLog(isCmd, sender, groupName, isGroup, command, args, isMedia, isSticker) {
//     const time = moment.tz('Asia/Jakarta').format('DD/MM/YY HH:mm:ss')
//     if (!isGroup && isCmd && !isMedia) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mEXEC\x1b[1;37m]', time, color(command), 'from', color(sender.split('@')[0]), 'args :', color(args.length))
// 	if (!isGroup && !isCmd && !isMedia && !isSticker) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;31mPRIVATE\x1b[1;37m]', time, color('message'), 'from', color(sender.split('@')[0]), 'args :', color(args.length))
// 	if (isCmd && isGroup && !isMedia) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mEXEC\x1b[1;37m]', time, color(command), 'from', color(sender.split('@')[0]), 'in', color(groupName), 'args :', color(args.length))
// 	if (!isCmd && isGroup && !isMedia) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;31mPRIVATE\x1b[1;37m]', time, color('Message'), 'from', color(sender.split('@')[0]), 'in', color(groupName), 'args :', color(args.length))
    
//     if (!isCmd && !isGroup && isSticker) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;31mPRIVATE\x1b[1;37m]', time, color('Sticker'), 'from', color(sender.split('@')[0]), 'in', 'args :', color(args.length))
//     if (!isCmd && isGroup && isSticker) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;31mGROUP\x1b[1;37m]', time, color('Sticker'), 'from', color(sender.split('@')[0]), 'in', 'args :', color(args.length))
// }

const mess = {
    wait: 'Sedang di proses..',
    error: {
        stick: '❌ Gagal, terjadi kesalahan saat mengkonversi gambar ke sticker ❌',
        Iv: '❌ Link tidak valid ❌'
    }
}

const getRandom = (ext) => {
    return `${Date.now()}${ext}`
}

getBuffer = async (url, options) => {
	try {
		options ? options : {}
		const res = await axios({
			method: "get",
			url,
			headers: {
				'DNT': 1,
				'Upgrade-Insecure-Request': 1
			},
			...options,
			responseType: 'arraybuffer'
		})
		return res.data
	} catch (e) {
		console.log(`Error : ${e}`)
	}
}

// Serial Number Generator
function GenerateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
// Generates a random alphanumberic character
function GenerateRandomChar() {
    var chars = "1234567890ABCDEFGIJKLMNOPQRSTUVWXYZ";
    var randomNumber = GenerateRandomNumber(0, chars.length - 1);
    return chars[randomNumber];
}
// Generates a Serial Number, based on a certain mask
function GenerateSerialNumber(mask) {
    var serialNumber = "";
    if (mask != null) {
        for (var i = 0; i < mask.length; i++) {
            var maskChar = mask[i];
            serialNumber += maskChar == "0" ? GenerateRandomChar() : maskChar;
        }
    }
    return serialNumber;
}

conn.on('chat-update', async (msg) => {
    try {
        if (!msg.hasNewMessage) return;
        msg = bot.serialize(msg);
        if (!msg.message) return;
        if (msg.key && msg.key.remoteJid === 'status@broadcast') return;
        if (msg.key.fromMe) return;
        const { from, sender, isGroup, quoted, type } = msg
        // const from = msg.key.remoteJid
        // const type = Object.keys(msg.message)[0]
        // const isGroup = from.endsWith('@.us')
        const senderr = msg.key.remoteJid
        let { body } = msg
        body = (type === 'conversation' && body.startsWith(prefix)) ? body : (((type === 'imageMessage' || type === 'videoMessage') && body) && body.startsWith(prefix)) ? body : ((type === 'extendedTextMessage') && body.startsWith(prefix)) ? body : ''
        const { text, extendedText, contact, location, liveLocation, image, video, sticker, document, audio, product } = MessageType
        const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
        const arg = body.substring(body.indexOf(' ') + 1)
        const args = body.trim().split(/ +/).slice(1)
        const isCmd = body.startsWith(prefix)
        const argx = command.toLowerCase()
        const time = moment.tz('Asia/Jakarta').format('DD/MM/YY HH:mm:ss')
        const SN = GenerateSerialNumber("000000000000000000000000")
        const pname = conn.contacts[sender]
        const pushname = pname.notify

        const verify = dbverify.includes(sender)
        await conn.chatRead(senderr, "read")
        
        //global.prefix

        const groupMetadata = isGroup ? await conn.groupMetadata(from) : ''
        const groupName = isGroup ? groupMetadata.subject : ''

        const content = JSON.stringify(quoted)
        const isMedia = (type === 'imageMessage' || type === 'videoMessage')
        const isimage = type === 'imageMessage'
        const isVideo = type === 'videoMessage'
        const isSticker = type === 'stickerMessage'
        const isQuotedImage = type === 'extendedTextMessage' && content.includes('imageMessage')
		const isQuotedVideo = type === 'extendedTextMessage' && content.includes('videoMessage')
		const isQuotedSticker = type === 'extendedTextMessage' && content.includes('stickerMessage')

        // if (isGroup) {
        //     console.log(msg)
        // }

        // Log Command in Group & Privat
        if (isCmd && isGroup && !isMedia && !isSticker) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mEXEC\x1b[1;37m]', time, color(command), 'from', color(sender.split('@')[0]), 'in', color(groupName), 'args :', color(args.length))
        if (!isGroup && isCmd && !isMedia && !isSticker) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mEXEC\x1b[1;37m]', time, color(command), 'from', color(sender.split('@')[0]), 'args :', color(args.length))

        // Log Message in Group & Private
        if (!isGroup && !isCmd && !isMedia && !isSticker) console.log('\x1b[1;31m~\x1b[1;37m>', color('[PRIVATE]', 'blue'), time, color(msg.body), 'from', color(sender.split('@')[0]), 'args :', color(args.length))
        if (!isCmd && isGroup && !isMedia && !isSticker) console.log('\x1b[1;31m~\x1b[1;37m>', color('[GROUP]', 'blue'), time, color(msg.body), 'from', color(sender.split('@')[0]), 'in', color(groupName), 'args :', color(args.length))

        // Log Sticker in Group & Private
        if (!isCmd && !isGroup && isSticker) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;31mPRIVATE\x1b[1;37m]', time, color('Sticker'), 'from', color(sender.split('@')[0]), 'in', 'args :', color(args.length))
        if (!isCmd && isGroup && isSticker) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;31mGROUP\x1b[1;37m]', time, color('Sticker'), 'from', color(sender.split('@')[0]), 'in', 'args :', color(args.length))

        // Log Image in Group & Private
        if (!isCmd && !isGroup && isimage) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;31mPRIVATE\x1b[1;37m]', time, color('Sticker'), 'from', color(sender.split('@')[0]), 'in', 'args :', color(args.length))
        if (!isCmd && isGroup && isimage) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;31mGROUP\x1b[1;37m]', time, color('Sticker'), 'from', color(sender.split('@')[0]), 'in', 'args :', color(args.length))

    // ------------------------------------------------------------------------------------ //

        // Image to Sticker (otomatis)
        if (isMedia && msg.message.imageMessage || isQuotedImage) {
            if (!verify) return bot.reply(from, 'Anda belum melakukan verifikasi, untuk verifikasi ketik !verify', msg)
            stickerimg(isQuotedImage, msg, bot, conn, sender, from)
        } 

        // Video/Gif to Sticker Bergerak (Otomatis)
        if ((isVideo && msg.message.videoMessage.fileLength < 10000000 && !msg.message.imageMessage)) {
            if (!verify) return bot.reply(from, 'Anda belum melakukan verifikasi, untuk verifikasi ketik !verify', msg)
            stickergif(isQuotedVideo, msg, bot, conn, sender, from)
        }

        // Sticker to Image (Otomatis)
        if ((!isMedia && isSticker && msg.message.stickerMessage.isAnimated === false)) {
            if (!verify) return bot.reply(from, 'Anda belum melakukan verifikasi, untuk verifikasi ketik !verify', msg)
            stickertoimg(isQuotedSticker, msg, bot, conn, from)
        }

        // Sticker Bergerak to Video (Otomatis)
        if ((!isMedia && isSticker && msg.message.stickerMessage.isAnimated === true)) {
            if (!verify) return bot.reply(from, 'Anda belum melakukan verifikasi, untuk verifikasi ketik !verify', msg)
            stickergiftomp4(isQuotedSticker, msg, bot, conn, from)
        }
        
        // printLog(isCmd, sender, groupSubject, isGroup, command, args, isMedia, isSticker)

        switch (command) {
            case 'verify':
                const nonye = sender
                const pporang = await conn.getProfilePicture(sender)
                if (pporang === undefined) {
                    var pepe = 'https://steamuserimages-a.akamaihd.net/ugc/954087817129084207/5B7E46EE484181A676C02DFCAD48ECB1C74BC423/?imw=512&&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false'
                } else {
                    var pepe = pporang
                }
                console.log(color(pushname, 'blue'))
                // console.log(pporang, nonye)
                
                var ceknya = nonye
                var obj = dbverify.some((val) => {
                    return val.id === ceknya
                })
                if (obj === true){
                    return bot.reply(from, 'Kamu sudah melakukan verifikasi', msg) // BAKAL RESPON JIKA NO UDAH ADA
                } else {
                    // const mentah = await staz.checkNumberStatus(nonye) // PENDAFTARAN
                    const verif = (`┌─「 *VERIFY-SUCCES* 」
│
├ *NAMA : ${pushname}*
├ *SERIAL : ${SN}*
├ *NOMOR : [@${nonye.replace(/[@s.whatsapp.net]/g, '')}]*
├ *API : wa.me/${nonye.replace('@s.whatsapp.net', '')}*
├ *WAKTU : ${moment().format('DD/MM/YY HH:mm:ss')}*
├ *BATAS PEMAKAIAN : Unlimited/Day*
│
├ Untuk menggunakan bot kirim ${prefix}menu
│ Total User yang sudah verifikasi ${verify.length}
│
└─「 *STAZ BOT😎* 」`)
                    // const hasil = mentah.canReceiveMessage ? msg : false
                    // if (!hasil) return staz.reply(from, 'Nomor WhatsApp tidak valid [ Tidak terdaftar di WhatsApp ]', id) 
                    const registersss = ({
                        id: nonye,
                        urlpp: pepe
                    })
                    dbverify.push(registersss)
                    fs.writeFileSync('./lib/database/user/verify.json', JSON.stringify(verify)) // DATABASE
                    // staz.sendFileFromUrl(from, pepe, 'ppnya.jpg', hasil)
                    bot.sendMediaURL(from, pepe, verif, msg)
                }
                break
            case 'help':
                await conn.chatRead(sender)
                bot.sendText(from, 'test dulu', msg)
                console.log(msg.key.remoteJid)
                break;
            case 'exif':
                // if (!itsMe) return
                // if (args.length < 1) return amsg.reply(from, `Penggunaan ${prefix}exif nama|author`, msg)
                // if (!arg.split('|')) return amsg.reply(from, `Penggunaan ${prefix}exif nama|author`, msg)
                exif.create(arg.split('|')[0], arg.split('|')[1])
                bot.reply(from, 'sukses', msg)
                conn.sendMessage()
                break
            case 'sticker':
            case 'stiker':
            case 's':
                if (isMedia && !msg.message.videoMessage || isQuotedImage) {
                    const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(msg).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : msg
                    const media = await conn.downloadAndSaveMediaMessage(encmedia, `./sticker/${sender}`)
                    await ffmpeg(`${media}`)
                            .input(media)
                            .on('start', function (cmd) {
                                console.log(`Started : ${cmd}`)
                            })
                            .on('error', function (err) {
                                console.log(`Error : ${err}`)
                                fs.unlinkSync(media)
                                bot.reply(from, 'error', msg)
                            })
                            .on('end', function () {
                                console.log('Finish')
                                exec(`webpmux -set exif ./sticker/data.exif ./sticker/${sender}.webp -o ./sticker/${sender}.webp`, async (error) => {
                                    if (error) return bot.reply(from, mess.error.api, msg)
                                    bot.sendSticker(from, fs.readFileSync(`./sticker/${sender}.webp`), msg)
                                    fs.unlinkSync(media)	
                                    fs.unlinkSync(`./sticker/${sender}.webp`)	
                                })
                            })
                            .addOutputOptions([`-vcodec`,`libwebp`,`-vf`,`scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`])
                            .toFormat('webp')
                            .save(`./sticker/${sender}.webp`)
                } else if ((isMedia && msg.message.videoMessage.fileLength < 10000000 || isQuotedVideo && msg.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage.fileLength < 10000000)) {
					const encmedia = isQuotedVideo ? JSON.parse(JSON.stringify(msg).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : msg
					const media = await conn.downloadAndSaveMediaMessage(encmedia, `./sticker/${sender}`)
					bot.reply(from, mess.wait, msg)
                    await ffmpeg(`${media}`)
                        .inputFormat(media.split('.')[4])
                        .on('start', function (cmd) {
                            console.log(`Started : ${cmd}`)
                        })
                        .on('error', function (err) {
                            console.log(`Error : ${err}`)
                            fs.unlinkSync(media)
                            tipe = media.endsWith('.mp4') ? 'video' : 'gif'
                            //amsg.reply(from, mess.error.api, msg)
                        })
                        .on('end', function () {
                            console.log('Finish')
                            exec(`webpmux -set exif ./sticker/data.exif ./sticker/${sender}.webp -o ./sticker/${sender}.webp`, async (error) => {
                                if (error) return bot.reply(from, mess.error.stick, msg)
                                bot.sendSticker(from, fs.readFileSync(`./sticker/${sender}.webp`), msg)
                                fs.unlinkSync(media)
                                fs.unlinkSync(`./sticker/${sender}.webp`)
                            })
                        })
                        .addOutputOptions([`-vcodec`,`libwebp`,`-vf`,`scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`])
                        .toFormat('webp')
                        .save(`./sticker/${sender}.webp`)
				} else {
                    bot.reply(from, `Kirim gambar/video dengan caption ${prefix}sticker atau tag gambar/video yang sudah dikirim\nNote : Durasi video maximal 10 detik`, msg)
                }
                break
            case 'sgif': 
                if ((isMedia && msg.message.videoMessage.seconds < 11 || isQuotedVideo && msg.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage.seconds < 11) && args.length == 0) {
                    const encmedia = isQuotedVideo ? JSON.parse(JSON.stringify(msg).replace('quotedM','m')).message.extendedTextMessage.contextInfo : msg
                    const media = await conn.downloadAndSaveMediaMessage(encmedia)
                    ran = getRandom('.webp')
                    bot.reply(from, mess.wait, msg)
                    await ffmpeg(`./${media}`)
                        .inputFormat(media.split('.')[1])
                        .on('start', function (cmd) {
                            console.log(`Started : ${cmd}`)
                        })
                        .on('error', function (err) {
                            console.log(`Error : ${err}`)
                            fs.unlinkSync(media)
                            tipe = media.endsWith('.mp4') ? 'video' : 'gif'
                            bot.reply(from, `❌ Gagal, pada saat mengkonversi ${tipe} ke stiker`, msg)
                        })
                        .on('end', function () {
                            console.log('Finish')
                            exec(`webpmux -set exif ${addMetadata('BOT', 'Staz')} ${ran} -o ${ran}`, async (error) => {
                                console.log(error)
                                if (error) return bot.reply(from, mess.error.stick, msg)
                                conn.sendMessage(from, fs.readFileSync(ran), sticker, {quoted: msg})
                                fs.unlinkSync(media)
                                fs.unlinkSync(ran)
                            })
                            /*client.sendMessage(from, fs.readFileSync(ran), sticker, {quoted: msg})
                            fs.unlinkSync(media)
                            fs.unlinkSync(ran)*/
                        })
                        .addOutputOptions([`-vcodec`,`libwebp`,`-vf`,`scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`])
                        .toFormat('webp')
                        .save(ran)
                }
                break
            case 'toimg':
                if (isQuotedSticker && msg.quoted.message.stickerMessage.isAnimated === false) {
                    const ran = getRandom('.webp')
                    const ran1 = getRandom('.png')
                    const encmed = quoted
                    const media = await conn.downloadAndSaveMediaMessage(encmed, `./temp/${ran}`)
                    exec(`ffmpeg -i ${media} ./temp/${ran1}`, function(err) {
                        fs.unlinkSync(media)
                        if (err) return wa.reply(from, 'Ada yang eror', msg)
                        bot.sendImage(from, `./temp/${ran1}`, { quoted: msg, caption: 'Done.' })
                        fs.unlinkSync(`./temp/${ran1}`)
                    })
                } else {
                    wa.reply(from, 'Silahkan reply stickernya.\nHanya dapat decrypt non-animated sticker.', msg)
                }
                break
            case 'tomp4':
                if ((isMedia && !msg.message.videoMessage || isQuotedSticker) && args.length == 0) {
                    const ger = isQuotedSticker ? JSON.parse(JSON.stringify(msg).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : msg
                    const owgi = await conn.downloadAndSaveMediaMessage(ger, './temp/')
                    webp2mp4File(owgi).then(res=>{
                        bot.sendMediaURL(from, res.result, 'Done', msg)
                    })
                    fs.unlinkSync(owgi)
                } else {
                    bot.reply(from, 'reply stiker', msg)
                }
                break
        
            default:
                // await conn.chatRead(msg.key.remoteJid)
                // await conn.chatRead(msg.key.remoteJid)
        }
        // await conn.chatRead(msg, "read")

    } catch (error) {
        console.log(color('[ERROR]', 'red'), err)
    }
})
