import { Message, Client, GuildMember } from "discord.js";
import fs from "fs"
import CommandError from "./core/commanderror";
import { prefix, owner_id, blacklist, token } from "./Config";
import Commands from "./core/commands";

declare module "discord.js" {
    interface Client {
        CommandsError(msg: Message, error: any): void;
        AddCog(cmd: Commands): void
        ReloadCog(): void;
        CogDict: object;
        owner: string;
    }
}

export default class BotClient extends Client {
    public CommandsError(msg: Message, error: any) {
        console.log(error);
    }

    public start() {
        this.login(this.token);
    }

    private prefix = prefix;
    public owner = owner_id;
    public CogDict = {};
    public event;
    private commands = {};
    private commandse = {};
    private categoryReload = false;
    private tasks = []

    public AddCog(obj: Commands) {
        this.CogDict[obj.name] = obj.cogreturn();
        this.commandse[obj.name] = obj.commandsreturn();
        let groups = obj.groupreturn();
        Object.assign(this.commands, groups);
        if (!this.categoryReload) {
            let events = obj.eventretuen();
            for (let file of events) {
                try {
                    let w = function (fun) {
                        return function (...a) {
                            try {
                                fun(...a)
                            } catch (error) {
                                console.log(error)
                            }
                        }
                    }
                    this.on(file.event, w(file.run))
                } catch (error) {
                    console.log(`file:${file.event}\nError:\n\n${error}`)
                }
            }
            this.tasks.push(obj.tasks);
        }
    }

    public cmds = () => {
        let commandfiles = fs.readdirSync("./Command")
        for (let file of commandfiles) {
            let q = require(`./Command/${file}`).default;
            try {
                q(this);
            } catch (e) {
                console.log(`${file}Error:${e}`)
            }
        }
    }

    public commandcpy = () => {
        for (let command of Object.values(this.commandse)) {
            Object.assign(this.commands, command)
        }
    }

    public ReloadCog() {
        this.CogDict = {};
        this.commands = {};
        this.commandse = {};
        let commandfiles = fs.readdirSync("./Command")
        for (let file of commandfiles) {
            delete require.cache[require.resolve(`./Command/${file}`)];
            console.log("刪除成功！");
        }
        this.cmds();
        this.commandcpy();
    }

    public constructor() {
        super({ disableMentions: "everyone" });
        this.token = token;
        this.cmds()
        this.commandcpy()
        this.on('ready', async () => {
            console.log(`Logged in as ${this.user.tag}!`);
            let memberlist = [];
            let guildlist = this.guilds.cache.array();
            for (let guild of guildlist) {
                for (let member of (await guild.members.fetch()).array()) {
                    let memberToAdd = memberlist.find((m: GuildMember) => m.user.id === member.user.id)
                    if (!memberToAdd) {   //check whether member which is going to be add is in the list
                        memberlist.push(member);
                    }
                }
            }
            console.log(memberlist.length);
            this.categoryReload = true;
            for (let i of this.tasks) {
                i.run()
            }
        });
        this.on('message', msg => { //on_message
            if (msg.content.startsWith(prefix) && !msg.author.bot && !blacklist.includes(Number(msg.author.id))) {
                if (Object.keys(this.commands).includes(msg.content.replace(prefix, "").split(" ")[0].toLowerCase())) {
                    try {
                        let ag = msg.content.split(/ +/g)
                        ag.shift()
                        this.commands[msg.content.replace(prefix, "").split(" ")[0].toLowerCase()](msg, ...ag)
                    } catch (error) {
                        this.CommandsError(msg, error)
                    }
                } else {
                    try {
                        throw new CommandError(`Not command is ${msg.content.replace(prefix, "").split(" ")[0].toLowerCase()}`, "Commands.Errors.Not_command")
                    } catch (e) {
                        try {
                            this.CommandsError(msg, e)
                        } catch (e) {
                            console.log(e)
                        }
                    }
                }
            }
        });
    }
}