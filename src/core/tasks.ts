import { Client } from "discord.js";
export default class tasks {
    public bot: Client;
    public tasklist = [];

    constructor(bot: Client) {
        this.bot = bot;
        this.tasklist = [];
    }
    private sleep(s: number) {
        return new Promise((resolve) => {
            setTimeout(resolve, s);
        });
    }
    private task(fun: Function, time: number, nember: number) {
        let bot: Client = this.bot;
        let sleep = this.sleep
        async function task_loop() {
            try {
                let w = 0
                while (bot.token !== null) {
                    if (nember !== null && nember <= w) break
                    fun()
                    await sleep(time)
                    w++
                }
            } catch (e) {
                bot.CommandsError(null, e)
            }
        }
        return task_loop;
    }
    public loop(fun: Function, time: number, nember: number = null) {
        this.tasklist.push(this.task(fun, time, nember));
    }
    public run() {
        /*
        for (let i of this.tasklist) {
            i();
        }
        */
    }
}