const { WAConnection } = require('@adiwajshing/baileys')
const cfonts = require('cfonts')
const fs = require('fs');
const { color, colorbg } = require('../lib/color');

const conn = new WAConnection()

const banner = cfonts.render(('TERMUX|WHATSAPP|BOT'), {
    font: 'chrome',
    color: 'candy',
    align: 'center',
    gradient: ["red","yellow"],
    lineHeight: 2
});

require('../index')
nocache('../index', module => console.log(`${module} is now updated!`))

async function connect() {
    conn.logger.level = 'warn'
    console.log(banner.string)
    conn.on('qr', () => {
        console.log(color('[','white'), color('!','red'), color(']','white'), color(' Scan the qr code above'))
    })

    fs.existsSync('./session.json') && conn.loadAuthInfo('./session.json')
    conn.on('connecting', () => {
        console.log(color('[Staz]', 'yellow'), color('Connecting...'))
    })

    conn.on ('open', () => {
        // save credentials whenever updated
        console.log(color('[Staz]', 'yellow'), color('Connected', 'green'))
        const authInfo = conn.base64EncodedAuthInfo() // get all the auth info we need to restore this session
        fs.writeFileSync('./session.json', JSON.stringify(authInfo, null, '\t')) // save this info to a file
    })

    await conn.connect({timeoutMS: 30*1000}) // connect
    //fs.writeFileSync('./session.json', JSON.stringify(conn.base64EncodedAuthInfo(), null, '\t'))
}

/**
 * Uncache if there is file change
 * @param {string} module Module name or path
 * @param {function} cb <optional> 
 */
function nocache(module, cb = () => { }) {
    console.log('Module', `'${module}'`, 'is now being watched for changes')
    fs.watchFile(require.resolve(module), async () => {
        await uncache(require.resolve(module))
        cb(module)
    })
}

/**
 * Uncache a module
 * @param {string} module Module name or path
 */
function uncache(module = '.') {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(module)]
            resolve()
        } catch (e) {
            reject(e)
        }
    })
}

module.exports = { conn, connect }