import Discord, { Client, Message } from "discord.js"
import Commands from "../core/commands";

class Info extends Commands {

}

export default (bot: Client) => {
    let commands = new Info(bot, "info");
    commands.command((message: Message) => {
        message.channel.send("Hi");
    }, { name: "hello" });
    commands.command(async (message: Message) => {
        let memberarray = (await message.guild.members.fetch({ force: false })).array();
        let online = memberarray.filter(member => member.presence.status.toString() === "online").length;
        let idle = memberarray.filter(member => member.presence.status.toString() === "idle").length;
        let dnd = memberarray.filter(member => member.presence.status.toString() === "dnd").length;
        let offline = memberarray.filter(member => member.presence.status.toString() === "offline").length;
        let bot = memberarray.filter(member => member.user.bot).length;
        let human = memberarray.filter(member => !member.user.bot).length;
        await message.channel.send(
            new Discord.MessageEmbed()
                .setColor("#0000ff")
                .setDescription(
                    "online:" + online + "\n" +
                    "idle:" + idle + "\n" +
                    "dnd:" + dnd + "\n" +
                    "offline:" + offline + "\n" +
                    "bot:" + bot + "\n" +
                    "human:" + human + "\n" +
                    "total:" + memberarray.length
                )

        )
    }, { name: "serverinfo" });
    bot.AddCog(commands);
}