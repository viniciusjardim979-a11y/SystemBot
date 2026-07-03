require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
    new SlashCommandBuilder()
        .setName('tools')
        .setDescription('🛠️ [Staff] Exibe o painel de ferramentas da administração.'),
        
    new SlashCommandBuilder()
        .setName('setarpretensao')
        .setDescription('🔒 [Staff] Fecha o canal de pretensão e agenda a abertura automática.')
        .addStringOption(option => option.setName('dia').setDescription('Dia da abertura (Ex: 15/07)').setRequired(true))
        .addStringOption(option => option.setName('horario').setDescription('Horário da abertura (Ex: 18:00)').setRequired(true)),
        
    new SlashCommandBuilder()
        .setName('vagas')
        .setDescription('📜 Exibe o painel paginado de vagas do RP.'),
        
    new SlashCommandBuilder()
        .setName('minhasvagas')
        .setDescription('📂 Veja e gerencie as suas vagas atuais no RP.'),
        
    new SlashCommandBuilder()
        .setName('setvaga')
        .setDescription('✅ [Staff] Atribui manualmente uma vaga a um jogador.')
        .addUserOption(option => option.setName('membro').setDescription('Selecione o jogador').setRequired(true))
        .addStringOption(option => option.setName('codigo').setDescription('Código da vaga (Ex: KUSA, SAMEHA)').setRequired(true)),
        
    new SlashCommandBuilder()
        .setName('delvaga')
        .setDescription('🗑️ [Staff] Remove forçadamente a vaga de um jogador.')
        .addUserOption(option => option.setName('membro').setDescription('Selecione o jogador').setRequired(true))
        .addStringOption(option => option.setName('codigo').setDescription('Código da vaga (Ex: KUSA, SAMEHA)').setRequired(true)),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('🔄 Atualizando os comandos de barra (/) no Discord...');

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log('✅ Comandos de barra registrados globalmente com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao registrar comandos:', error);
    }
})();