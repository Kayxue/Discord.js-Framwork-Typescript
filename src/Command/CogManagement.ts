import Discord, { Message } from "discord.js";
import Commands from "../core/commands";

class CogManagement extends Commands {

}

export default (bot: Discord.Client) => {
    let commands = new CogManagement(bot, "cogmanagement");
    commands.command(async (message: Message, ...args: string[]) => {
        try {
            commands.bot.ReloadCog();
            await message.channel.send("成功！");
        } catch (e) {
            console.log(e);
        }
    }, { name: "reload" });
    commands.listener((msg: Message) => {
        console.log("OK")
    }, { event: "message" })
    bot.AddCog(commands);
}