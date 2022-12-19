# Sobre o CustomBot

Este é um exemplo de Bot para [discord.js](https://discord.js.org/#/) usando Typescript + Typegoose e Mongoose.

> Features include:

-   Criação de comandos e Eventos
-   Level
-   Marketplace
-   Cooldown para comandos
-   Cooldown para ganho de EXP
-   Criação de comandos com permissões por Role ou Canal de Texto

## Começando 🎉

1. Clone o repositório
2. Abra o [.env](.env.example) e adicione os campos requeridos.

```
TOKEN= # Token do Bot

GUILD_ID= # guildId (id do Servidor do Discord)

CLIENT_ID= # Id do Bot
```

3. Configure a Database [database.config](src/config/database.config.ts).

```
uri = # Ex: mongodb://localhost:27017"
```

4. Renomeie o [.env.example](.env.example) para `.env`
5. Instalando dependências

```sh-session
npm install
```

6. Iniciando o Bot

```sh-session
npm run start:dev
```

## Comandos 🤖

| Nome                                                     | Descrição                | Exemplo                                   |
| -------------------------------------------------------- | ------------------------ | ----------------------------------------- |
| [/marketplace](src/commands/User/marketplace.command.ts) | Cria um Menu Marketplace | [image](examples/marketplace_command.jpg) |

> Note: Você pode adicionar mais comandos criando em [src/commands](src/commands).

> Caso tenha alguma dúvida você pode acessar o guia do discord.js em [guia](https://discordjs.guide) e também pode acessar a documentação em [docs](https://discord.js.org) para mais informações.

## Problemas 💭

Se você tiver qualquer problema, por favor, não hesite em abrir um **[issue](https://github.com/marcelotsoares/custom-discordjs-bot/issues/new/choose)**.

## Contribuindo 🙌

Contribuições são bem-vindas! Por favor, não hesite em abrir um **[pull request](https://github.com/marcelotsoares/custom-discordjs-bot/pulls)**.
