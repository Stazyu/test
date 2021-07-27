const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg')
const { exec } = require('child_process');
const { conn } = require('../connection/connect');
const { from } = require('form-data');
const { webp2mp4File } = require('./webp2mp4')

const getRandom = (ext) => {
    return `${Date.now()}${ext}`
}

const stickerimg = async (isQuotedImage, msg, bot, conn, sender, from) => {
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
                    //if (error) return bot.reply(from, mess.error.api, msg)
                    bot.sendSticker(from, fs.readFileSync(`./sticker/${sender}.webp`), msg)
                    fs.unlinkSync(media)	
                    fs.unlinkSync(`./sticker/${sender}.webp`)	
                })
            })
            .addOutputOptions([`-vcodec`,`libwebp`,`-vf`,`scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`])
            .toFormat('webp')
            .save(`./sticker/${sender}.webp`)
}

const stickergif = async (isQuotedVideo, msg, bot, conn, sender, from) => {
    const encmedia = isQuotedVideo ? JSON.parse(JSON.stringify(msg).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : msg
    const media = await conn.downloadAndSaveMediaMessage(encmedia, `./sticker/${sender}`)
    // bot.reply(from, mess.wait, msg)
    bot.reply(from, 'sedang dalam proses...', msg)
        await ffmpeg(`${media}`)
            .inputFormat(media.split('.')[4])
            .on('start', function (cmd) {
                console.log(`Started : ${cmd}`)
            })
            .on('error', function (err) {
                console.log(`Error : ${err}`)
                fs.unlinkSync(media)
                tipe = media.endsWith('.mp4') ? 'video' : 'gif'
                //bot.reply(from, mess.error.api, msg)
            })
            .on('end', function () {
                console.log('Finish')
                exec(`webpmux -set exif ./sticker/data.exif ./sticker/${sender}.webp -o ./sticker/${sender}.webp`, async (error) => {
                    console.log('Sedang dalam proses')
                    if (error) return bot.reply(from, 'Maaf terjadi kesalahan', msg)
                    bot.sendSticker(from, fs.readFileSync(`./sticker/${sender}.webp`), msg)
                    fs.unlinkSync(media)
                    fs.unlinkSync(`./sticker/${sender}.webp`)
                })
            })
            .addOutputOptions([`-vcodec`,`libwebp`,`-vf`,`scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`])
            .toFormat('webp')
            .save(`./sticker/${sender}.webp`)
}

const stickertoimg = async (isQuotedSticker, msg, bot, conn, from) => {
    const ran = getRandom('.webp')
    const ran1 = getRandom('.png')
    const encmedia = isQuotedSticker ? JSON.parse(JSON.stringify(msg).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : msg
    const media = await conn.downloadAndSaveMediaMessage(encmedia, `./temp/${ran}`)
    exec(`ffmpeg -i ${media} ./temp/${ran1}`, function(err) {
        fs.unlinkSync(media)
        if (err) return wa.reply(from, 'Ada yang eror', msg)
        bot.sendImage(from, `./temp/${ran1}`, { quoted: msg, caption: 'Done.' })
        fs.unlinkSync(`./temp/${ran1}`)
    })
}

const stickergiftomp4 = async (isQuotedSticker, msg, bot, conn, from) => {
        const ger = isQuotedSticker ? JSON.parse(JSON.stringify(msg).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : msg
        const owgi = await conn.downloadAndSaveMediaMessage(ger, './temp/')
        webp2mp4File(owgi).then(res=>{
            bot.sendMediaURL(from, res.result, 'Done', msg)
        })
        fs.unlinkSync(owgi)
}


module.exports = { stickerimg, stickergif, stickertoimg, stickergiftomp4 }
