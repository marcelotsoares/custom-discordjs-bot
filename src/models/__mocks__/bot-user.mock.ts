import { BotUser } from "../../models/bot-user"

interface IBotUserMock extends BotUser {
    save: jest.Mock
}

const mockBotUser: IBotUserMock = {
    discordId: '670340844708167690',
    discordName: 'Marcelo',
    xp: 0,
    level: 1,
    coins: 1,
    inventory: [{
        itemId: "ticket_2",
        qtd: 5
    }],
    save: jest.fn().mockImplementation(() => {
        return true
    })
}

const mockBotUserModel = {
    findOne: jest.fn(),
    create: jest.fn()
}

export {
    mockBotUser,
    mockBotUserModel
}