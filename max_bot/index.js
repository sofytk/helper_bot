import { Bot, Keyboard } from '@maxhub/max-bot-api';
import dotenv from 'dotenv';
import { hostIP } from "./ip.js";

dotenv.config();

const bot = new Bot(process.env.BOT_TOKEN);



const frontendUrl = `http://${hostIP}:3000`;



console.log('Host IP:', hostIP);
console.log('Frontend URL:', frontendUrl);

bot.api.setMyCommands([
  { name: 'start', description: 'Запустить приложение GrowGood' },
  { name: 'help', description: 'Информация о приложении' },
]);

const keyboard = Keyboard.inlineKeyboard([
  [Keyboard.button.link('Растить Добро', frontendUrl)],
]);

bot.command('start', (ctx) => {
const sender = ctx.message?.sender;
  const userName = sender?.first_name || 'Помощник';

  return ctx.reply(
    `Привет, ${userName}! Добро пожаловать в Вырасти Добро — приложение, где ты выполняешь добрые дела и выращиваешь своё виртуальное дерево. А деревья как известно приносят плоды. В нашем случае они могут быть различные: от скидок от наших портнёров до реальных денег для благотворительных фондов`,
    {attachments: [keyboard]}
  );
});


bot.command('help', (ctx) => {
  return ctx.reply(
    'Как пользоваться GrowGood:\n' +
    '1. Открой приложение\n' +
    '2. Выбери миссию на карте или в списке\n' +
    '3. Выполни её → получи капли воды → играй и выращивай дерево\n' +
    '4. В профиле смотрите свои достижения!'
  );
});


bot.start();
console.log('Бот запущен');
