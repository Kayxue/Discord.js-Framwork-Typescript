import Commands from "../core/commands";
import Discord, { Client, Message } from "discord.js";
import youtubedl from "ytdl-core";
import fs from "fs";
class w extends Commands {

}

export default function setup(bot: Client) {
    //實例化w列別(bot必要傳入參數)classname非必要傳入(該cog名稱)
    let commands = new w(bot, "classname")
    //function名稱就是指令名稱
    //指令寫法
    let w2 = commands.command(async function w(msg: Message, ...text: string[]) {
        await msg.channel.send(text.join(" "))
    }, { aliases: ["ee", "ww"] })
    w2.error((msg, error) => {
        console.log(error)
        msg.channel.send(error)
    })
    //commands.bot等於bot or client
    commands.command(function e(msg: Message) {
        console.log(commands.bot.CogDict)
    }, { aliases: null, help: "完整說明", brief: "簡短說明" })
    // event用法
    commands.listener(function message(msg: Message) {
        console.log(`on_message:${msg.author.tag}:${msg.content}`)
    })
    commands.listener((msg: Message) => {
        console.log("OK")
    }, { event: "message" })
    //group用法
    let e = commands.group(async function wq(msg: Message) {
        console.log(msg.content)
    }, { aliases: ["ep", "qq"] })

    e.error(async function (msg: Message, error) {
        msg.channel.send(error.toString())
    })

    let r = e.command(async function rr(msg: Message, x: string) {
        commands.is_owner(msg)
        commands.bot
        await msg.channel.send("e.r")
    }, { aliases: ["ep", "qq"] })

    r.error((msg, error) => {
        msg.channel.send(error.toString())
    })
    e.command(function ww(message: Message) {
        message.member.voice.channel.join().then(voicechannel => {
            let w = voicechannel.play(youtubedl("https://www.youtube.com/watch?v=jIpiLvkDIK8", { quality: 'highestaudio' }), { volume: 0.5 })
            w.pause()
            voicechannel.play(youtubedl("https://www.youtube.com/watch?v=7i2knHE7ofQ", { quality: 'highestaudio' }), { volume: 0.5 })
        })
    })
    commands.command(function ant(message: Message, ...text: string[]) {
        let w = text.join(" ")
        let sendtext = w.split('').map(x => {
            if (x !== ' ') {
                return "҉" + x + "҉"
            } else {
                return x
            }
        })
        message.channel.send(sendtext.join(" "))
    })
    bot.AddCog(commands)
}