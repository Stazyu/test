const test = 'test'

console.log(test.split())

case 'togif':
case 'tomedia':
case 'toimage':
    if(!isQuotedSticker) return bot.reply(from, 'reply sticker!', msg)
    const rann = getRandom('.webp')
    const enc = quoted
    const mtdt = await conn.downloadAndSaveMediaMessage(enc, `./temp/togif`)
    const bff = fs.readFileSync('./temp/togif.webp')
    const buff = Buffer.from(mtdt.split(',')[0], 'base64')
    console.log(buff)
    console.log(isQuotedSticker, msg.quoted.message.stickerMessage.isAnimated)
    if (isQuotedSticker && msg.quoted.message.stickerMessage.isAnimated) {
        axios(`https://serv-api.zeks.xyz/sticker/togif`, { method: "post", headers: { "content-type": 'application/json' }, data: {base64: buff.toString('base64')}}).then(bf => {
            // Client.sendFileFromBase64(from, bf.data.result, 'to.gif', 'nih', message)
            console.log(bf.data.result)
            conn.sendMessage(from, bf.data.result, MessageType.video, { mimetype : 'video/gif', quoted : msg})
            fs.unlinkSync(`./temp/togif`)
        })
    } 