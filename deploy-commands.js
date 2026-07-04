require('dotenv').config();
const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const commands = [
    new SlashCommandBuilder()
        .setName('tools')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('🛠️ [Staff] Exibe o painel de ferramentas da administração.'),
        
    new SlashCommandBuilder()
        .setName('setarpretensao')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('🔒 [Staff] Fecha o canal de pretensão e agenda a abertura automática.')
        .addStringOption(option => option.setName('dia').setDescription('Dia da abertura (Ex: 15/07)').setRequired(true))
        .addStringOption(option => option.setName('horario').setDescription('Horário da abertura (Ex: 18:00)').setRequired(true)),
        
    new SlashCommandBuilder()
        .setName('vagas')
        .setDescription('📜 Exibe o painel de vagas do RPG.'),
        
    new SlashCommandBuilder()
        .setName('minhasvagas')
        .setDescription('📂 Veja e gerencie as suas vagas ocupadas.'),
        
    new SlashCommandBuilder()
        .setName('setvaga')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('✅ [Staff] Atribui manualmente uma vaga a um jogador.')
        .addUserOption(option => option.setName('membro').setDescription('Selecione o jogador').setRequired(true))
        .addStringOption(option => option.setName('codigo').setDescription('Código da vaga (Ex: KUSA, SAMEHA)').setRequired(true)),
        
    new SlashCommandBuilder()
        .setName('delvaga')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('🗑️ [Staff] Remove forçadamente a vaga de um jogador.')
        .addUserOption(option => option.setName('membro').setDescription('Selecione o jogador').setRequired(true))
        .addStringOption(option => option.setName('codigo').setDescription('Código da vaga (Ex: KUSA, SAMEHA)').setRequired(true)),

    new SlashCommandBuilder()
        .setName('bloquearvaga')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('🔴 [Staff] Bloqueia uma vaga para pretensão comum.')
        .addStringOption(option => option.setName('codigo').setDescription('Código da vaga que será bloqueada').setRequired(true)),

    new SlashCommandBuilder()
        .setName('desbloquearvaga')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('✅ [Staff] Desbloqueia uma vaga bloqueada.')
        .addStringOption(option => option.setName('codigo').setDescription('Código da vaga que será desbloqueada').setRequired(true)),

    new SlashCommandBuilder()
        .setName('limparvagas')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('🧹 [Staff] Libera todas as vagas registradas no banco.'),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN || process.env.TOKEN);

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
