import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { S_WHATSAPP_NET, downloadContentFromMessage } from '@whiskeysockets/baileys';
import Jimp from 'jimp';

export default {
    name: 'fullpp',
    aliases: ['setpp', 'setprofile'],
    run: async (context) => {
        await ownerMiddleware(context, async () => {
            const { client, m, msgToxic, generateProfilePicture } = context;
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

            try {
                if (!msgToxic) {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    return m.reply(`╭─❏ 「 SETPP 」\n│ Reply to an image, genius.\n│ Can't read your mind.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
                }

                if (!msgToxic.imageMessage) {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    return m.reply(`╭─❏ 「 SETPP 」\n│ That ain't an image.\n│ Reply to an actual image.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
                }

                let buf = null;

                try {
                    const stream = await downloadContentFromMessage(msgToxic.imageMessage, 'image');
                    const chunks = [];
                    for await (const chunk of stream) chunks.push(chunk);
                    buf = Buffer.concat(chunks);
                } catch {}

                if (!buf || buf.length === 0) {
                    try {
                        buf = await client.downloadMediaMessage(m.quoted || msgToxic);
                    } catch {}
                }

                if (!buf || buf.length === 0) {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    return m.reply(`╭─❏ 「 SETPP 」\n│ Couldn't download the image. Try again.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
                }

                const jimage = await Jimp.read(buf);
                const minDim = Math.min(jimage.bitmap.width, jimage.bitmap.height);
                const resized = jimage
                    .crop(
                        Math.floor((jimage.bitmap.width - minDim) / 2),
                        Math.floor((jimage.bitmap.height - minDim) / 2),
                        minDim,
                        minDim
                    )
                    .resize(640, 640)
                    .quality(90);
                const ppBuf = await resized.getBufferAsync(Jimp.MIME_JPEG);

                const { img } = await generateProfilePicture(ppBuf);

                await client.query({
                    tag: 'iq',
                    attrs: { to: S_WHATSAPP_NET, type: 'set', xmlns: 'w:profile:picture' },
                    content: [{ tag: 'picture', attrs: { type: 'image' }, content: img }]
                });

                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                m.reply(`╭─❏ 「 SETPP 」\n│ Profile picture updated.\n│ Finally looking less ugly.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);

            } catch (error) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                m.reply(`╭─❏ 「 SETPP ERROR 」\n│ Couldn't update the profile pic.\n│ ${error.message || error}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }
        });
    }
};
