const {Telegraf} = require('telegraf')
const {message} = require('telegraf/filters')
const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
dotenv.config()

const token = process.env.CHANNEL_TOKEN
const PUBLIC_PATH = process.env.PUBLIC_PATH

const bot = new Telegraf(token)

const audioList = fs.readdirSync(path.join(__dirname, PUBLIC_PATH, "genres/all"))
console.log(audioList)

bot.start((ctx) =>
    ctx.reply(
        `Приветствую, ${ctx.from.first_name ? "User" : "хороший человек"}! Набери /help и увидишь, что я могу.`
    )
);

const helpMessage = 'Добро пожаловать в музыкальный бот.\n' +
    'Все команды \n' +
    '/all - показать все треки \n' +
    '/next - показать следующий трек \n' +
    '/back - показать предыдущий трек\n' +
    '/random - показать случайный трек \n' +
    '/save - сохранить трек \n' +
    '/saved - показать сохраненные треки \n' +
    '/list - показать текстовый список всех треков \n' +
    '/savedList - показать текстовый список добавленных треков \n' +
    '/clear - очистить список добавленных треков \n' +
    'Попробуйте сортировку по жанрам: /pop, /hiphop, /classic'

bot.help((ctx) => ctx.reply(helpMessage));

let currentTrack = 0;

bot.command("next", async (ctx) => {
    if (currentTrack === audioList.length-1) {
        currentTrack = 0;
    } else {
        currentTrack++;
    }
    const track = audioList[currentTrack]
    ctx.reply(`Загружаем следующий трек...`)
    ctx.reply(`${currentTrack + 1}# трек из ${audioList.length}`)
    await ctx.replyWithAudio({source: path.join(__dirname,PUBLIC_PATH, "genres/all", track)})
})

bot.command("back", async (ctx) => {
    if (currentTrack === 0) {
        currentTrack = audioList.length - 1 ;
    } else {
        currentTrack = currentTrack - 1;
    }

    const track = audioList[currentTrack]
    ctx.reply(`Загружаем предыдущий трек...`)
    ctx.reply(`${currentTrack + 1}# трек из ${audioList.length}`)
    await ctx.replyWithAudio({source: path.join(__dirname,PUBLIC_PATH, "genres/all", track)})
})

bot.command("random", async (ctx) => {
    const pseudoRandom = Date.now()
    const lastElement = +pseudoRandom.toString().slice(-1)
    ctx.reply(`Трек номер: ${lastElement}`)
    if (lastElement > audioList.length ) {
        currentTrack = 0
        return await ctx.replyWithAudio({source: path.join(__dirname,PUBLIC_PATH, "genres/all", audioList[0])})
    } else {
        currentTrack = !lastElement ? lastElement - 1 : 0
        return await ctx.replyWithAudio({source: path.join(__dirname,PUBLIC_PATH, "genres/all", audioList[lastElement - 1]) })
    }
})

bot.command("list", (ctx) => {
    ctx.reply('Список доступных треков:')
    ctx.reply(audioList.reduce((accumulator, currentValue) => {
            return accumulator + "\n" + currentValue
        }
    ), '')
})

bot.command("all", (ctx) => {
    ctx.reply('Все доступные треки! \n')
    ctx.reply(`Доступно ${audioList.length} медиафайл(ов)`)
    if (audioList.length > 20) {
        return ctx.reply("Список очень большой попробуйте команду /next")
    }
    ctx.reply('Ожидайте, треки загружаются...')
    return  audioList.forEach(item => ctx.replyWithAudio({source: path.join(__dirname,PUBLIC_PATH, "genres/all", item)}))
})

bot.command('save', (ctx) => {
    fs.copyFile(path.join(__dirname,PUBLIC_PATH, "genres/all", audioList[currentTrack]), path.join(__dirname,PUBLIC_PATH, "saved", audioList[currentTrack]), err => {
        if (err) {
            console.log(err)
        }
    })
    ctx.reply(audioList[currentTrack] + ' добавлен в сохраненные')
})

bot.command('pop', ctx => {
    const genreList = fs.readdirSync(path.join(__dirname, PUBLIC_PATH, "genres/pop"))
    ctx.reply("Треки в жанре pop: " + genreList.length)
    genreList.forEach(item => ctx.replyWithAudio({source: path.join(__dirname, PUBLIC_PATH, "genres/pop",item)}))
})

bot.command('hiphop', ctx => {
    const genreList = fs.readdirSync(path.join(__dirname, PUBLIC_PATH, "genres/hip-hop"))
    ctx.reply("Треки в жанре hiphop: " + genreList.length)
    genreList.forEach(item => ctx.replyWithAudio({source: path.join(__dirname, PUBLIC_PATH, "genres/hip-hop",item)}))
})

bot.command('classic', ctx => {
    const genreList = fs.readdirSync(path.join(__dirname, PUBLIC_PATH, "genres/classic"))
    ctx.reply("Треки в жанре classic: " + genreList.length)
    genreList.forEach(item => ctx.replyWithAudio({source: path.join(__dirname, PUBLIC_PATH, "genres/classic",item)}))
})


bot.command('saved', (ctx) => {
    const savedList = fs.readdirSync(path.join(__dirname,PUBLIC_PATH, "saved"))
    ctx.reply(`Вы сохранили: ${savedList.length} трек(ов)`)
    if (savedList.length > 20) {
        return ctx.reply('Слишком много файлов, попробуйте /savedList')
    }
    savedList.forEach(item => ctx.replyWithAudio({source: path.join(__dirname,PUBLIC_PATH, "saved", item)}))
})

bot.command('savedList', (ctx) => {
    const savedList = fs.readdirSync(path.join(__dirname,PUBLIC_PATH, "saved"))
    ctx.reply(`Вы сохранили ${savedList.length} трек(ов):`)
    savedList.forEach(item => ctx.reply(item))
})

bot.command('clear', (ctx) => {
    const savedList = fs.readdirSync(path.join(__dirname,PUBLIC_PATH, "saved"))
    const count = savedList.length
    savedList.forEach(item => {
        fs.unlink(path.join(__dirname,PUBLIC_PATH, "saved", item), err => {
            console.log(err)
        })
    })
    ctx.reply('Удалено ' + count + ' треков. Список очищен!')
})

bot.on(message("text"), ctx => ctx.reply("Попробуйте одну из команд. Напишите /help!"));

bot.launch().then(() => console.log('Alright')).catch(e => console.log(e))