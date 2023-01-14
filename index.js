const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const token = process.env.token;
const PORT = process.env.PORT;
const webAppUrl = 'https://cerulean-biscuit-7abee4.netlify.app';

const bot = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json());
app.use(cors());


bot.on('message', async (msg) => {
const chatId = msg.chat.id;
const text = msg.text;

if (text === '/start') {
    await bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму', {
        reply_markup: {
            keyboard: [
                [{text: 'Заполнить форму', web_app: {url: webAppUrl + '/form'}}]
            ]
        }
    });
    await bot.sendMessage(chatId, 'Переходи в наш интернет магазин по кнопке ниже', {
        reply_markup: {
            inline_keyboard: [
                [{text: 'Сделать заказ', web_app: {url: webAppUrl}}]
            ]
        }
    });
}
if (msg?.web_app_data?.data) {
    try {
        const data = JSON.parse(msg?.web_app_data?.data)

        await bot.sendMessage(chatId, 'Спасибо за обратную связь!')
        await bot.sendMessage(chatId, 'Ваша страна: ' + data?.country)
        await bot.sendMessage(chatId, 'Ваш город: ' + data?.city)

        setTimeout(async () => {
            await bot.sendMessage(chatId, 'Всю информацию Вы получите в этом чате')
        }, 3000)
    } catch(e) {
        console.log(e)
    }
}
});

app.post('/web-data', async (req, res) => {
    const {queryId, products, totalPrice} = req.body;
    try {
        bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: {
                message_text: 'Поздравляю! Вы приобрели товар на сумму ' + totalPrice
            }
        })
        return res.status(200).json({})
    } catch(e) {
        bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Не удалось приобрести товар',
            input_message_content: {
                message_text: 'Не удалось приобрести товар'
            }
        })
        return res.status(500).json({})
    }
})

app.listen(PORT, () => console.log(`Server started on PORT: ${PORT}`))