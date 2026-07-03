require('dotenv').config();
const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    StringSelectMenuBuilder, 
    StringSelectMenuOptionBuilder,
    PermissionFlagsBits
} = require('discord.js');
const fs = require('fs');

// --- CÓDIGO PARA MANTER O BOT ATIVO NO RENDER ---
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot está online e ativo!');
});

app.listen(port, () => {
    console.log(`Servidor de ping rodando na porta ${port}`);
});
// ------------------------------------------------

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// ==========================================
// CONFIGURAÇÕES GERAIS
// ==========================================
const CANAL_PRETENSAO_ID = '1515842705958113340'; 

// Dicionário de Artes Exóticas
const LISTA_ARTES = {
    'KUSA': 'Kusagakureryū', 'SAIR': 'Sairento Kiringu', 'IAID': 'Iaidō',
    'KONG': 'Kongoken', 'WHIR': 'Whirlwind', 'ENGE': 'Engeki',
    'AKRO': 'Akurobatto', 'HARI': 'Hari Jizō', 'GAMU': 'Gamu Fūsen',
    'JISH': 'Jishaku Ninpō', 'KONO': 'Konoharyū', 'KUMO': 'Kumoryū',
    'YORO': 'Yoroigui', 'SAGA': 'Saganken', 'MUON': 'Muon no Ken',
    'KAKU': 'Kakuran Taijutsu', 'HANA': 'Hana Ninpō', 'RAKA': 'Rakanken'
};

// Dicionário de Armas Exóticas
const LISTA_ARMAS = {
    'SENSU': { nome: 'Kyōdai Sensu · Ilimitado', info: '· Restrição em **Sunagakure**.\n· Alcançar grau **2** in **Ninjutsu**.\n· Obtenção de variação **equilibrado** ou **arma única** in **Bukijutsu**.\n↳ **maestria fūton** contorna essa necessidade.' },
    'SHOKEN': { nome: 'Fujaku Hishō Shōken · NPC', info: '· Grau **2** em **Ninjutsu** (**maestria fūton** contorna).' },
    'HINOKEN': { nome: 'Hinōken · NPC', info: '· Grau **2** em **Ninjutsu** (**maestria katon** contorna).\n▬ Limita-se ao feixe apresentado · **gasto 06 cp**.' },
    'GUNBAI': { nome: 'Gunbai Uchiha · Taichō Uchiha', info: '· Grau **2** em **Ninjutsu**.\n↳ **sem fūton**: uso baseado em **obito** | **com fūton**: baseado em **madara**.' },
    'OGAMA': { nome: 'Sanjin no Ōgama · Vaga Exclusiva', info: '· Var. **equilibrado** ou **arma única** em **Bukijutsu**.\n· Restrito a **Jashinista**.' },
    'GARIAN': { nome: 'Gariantō · NPC', info: '· Alcançar grau **2** em **Ninjutsu**.' },
    'CHAKTO': { nome: 'Chakura Tō', info: '𓏺 **soco Inglês** · **garras** · **kunai** · **adaga** · **tantō**.\n· Grau **2** em **Ninjutsu** (**não obrigatório** · melhora o fluxo).\n▬ Necessário comprar.' },
    'YOROI': { nome: 'Chakura no Yoroi · NPC', info: '· Requisitos in-on.' },
    'RAIJIN': { nome: 'Raijin no Ken · Vaga Exclusiva', info: '· Grau **2** in **Ninjutsu** (**maestria raiton** contorna).' },
    'ZANBATO': { nome: 'Zanbatō · Vaga Exclusiva', info: '· Sem requisitos iniciais.' },
    'KOKUTO': { nome: 'Kokutō · NPC', info: '· Sem requisitos iniciais.' },
    'SOSHUG': { nome: 'Sōshuga · Vaga Exclusiva', info: '· Sem requisitos iniciais.' },
    'KYOMEI': { nome: 'Kyōmei Supīkā · Vaga Exclusiva', info: '· Obtenção do **Kyōmensei**.' },
    'MATEKI': { nome: 'Mateki · Vaga Exclusiva', info: '· Desenvolvimento com **Shirohebi**.' },
    'KUSATS': { nome: 'Kusanagi no Tsurugi · Vaga Exclusiva', info: '· Desenvolvimento com **Hakuja** e **Shirohebi**.' },
    'KUSANA': { nome: 'Kusanagi · Vaga Exclusiva', info: '· Desenvolvimento com **Shirohebi**.' },
    'KUROSA': { nome: 'Kurosawa · Vaga Exclusiva', info: '· Sair vitorioso sobre o general da **nação do ferro**.' },
    'KUBIKI': { nome: 'Kubikiribōchō · NPC', info: '· Sem requisitos iniciais.' },
    'SAMEHA': { nome: 'Samehada · NPC', info: '· Absorção de **30 cp**/rodada (**hōbi chakura**) | **15 cp** (**sem**).\n↳ Absorção **50 cp**/rodada de alvos.\n▬ **transformação de tubarão** tem o dobro da absorção.' },
    'NUIBARI': { nome: 'Nuibari · NPC', info: '· Sem requisitos iniciais.' },
    'KABUTO': { nome: 'Kabutowari · NPC', info: '· Sem requisitos iniciais.' },
    'SHIBUKI': { nome: 'Shibuki · NPC', info: '· Sem requisitos iniciais.' },
    'KIBA': { nome: 'Kiba · NPC', info: '· Grau **2** em **Ninjutsu** (**maestria raiton** contorna).' },
    'HIRAME': { nome: 'Hiramekararei · NPC', info: '· Grau **2** em **Ninjutsu**.\n↳ **lâmina cega**, moldada através do chakra.' },
    'BASHO': { nome: 'Bashōsen · NPC', info: '▬ Gasta **50 cp** todas as técnicas.' },
    'BENI': { nome: 'Benihisago · NPC', info: '▬ Gasta **50 cp** todas as técnicas.' },
    'BOHAKU': { nome: 'Bohaku no Jōhei · NPC', info: '▬ Gasta **50 cp** todas as técnicas.' },
    'KOKIN': { nome: 'Kōkinjō · NPC', info: '▬ Gasta **50 cp** todas as técnicas.' },
    'SHICHI': { nome: 'Shichiseiken · NPC', info: '▬ Gasta **50 cp** todas as técnicas.' }
};

// Dicionário de Habilidades Exóticas
const LISTA_HABILIDADES = {
    'SOSU': 'Doton: Soseijutsu', 'TOBO': 'Toboe no Onpa', 'SEPU': 'Fūton: Senpuken',
    'KEIM': 'Keima Henka', 'CKYU': 'Chakura Kyūinjutsu', 'RKIR': 'Raikiri',
    'MKAN': 'Mū no Kanchi', 'CHIK': 'Chijō Kanchi', 'SHNI': 'Shabondama Ninjutsu',
    'THOJ': 'Tengai Hōjin', 'ZNMS': 'Zanmai no Shinka', 'SAJI': 'Sajin',
    'KMSN': 'Kyōmeisen', 'SUIR': 'Suiton: Iryō-Ninjutsu', 'TENR': 'Katon: Tenrō',
    'CHID': 'Chidori', 'DOMU': 'Doton: Dōmu', 'CJGI': 'Chōjū Giga',
    'NANK': 'Nan no Kaizō', 'SHID': 'Raiton: Shiden', 'RASE': 'Rasengan',
    'KKAM': 'Kuroi Kaminari', 'BJUT': 'Bunretsu no Jutsu', 'RYOR': 'Raiton no Yoroi',
    'HIRA': 'Hiraishin', 'GOGY': 'Gōgyō Kaiin, Gōgyō Fūin', 'CKAJ': 'Chōkajūgan, Chōkeijūgan'
};

// Dicionário de Bijus
const LISTA_BIJUS = {
    'SHUK': 'Ichibi No Shukaku', 'MATA': 'Nibi No Matabi', 'ISOB': 'Sanbi No Isobu',
    'GOKU': 'Yonbi No Son Goku', 'KOKU': 'Gobi No Kokuo', 'SAIK': 'Rokubi No Saiken',
    'CHOM': 'Nanabi No Chomei', 'GYUK': 'Hachibi No Gyuki', 'KURA': 'Kyubi No Kurama'
};

// Dicionário de Kekkei Genkai
const LISTA_KEKKEI = {
    'BAKU': { nome: 'Bakuton', max: 3 }, 'KOTO': { nome: 'Kōton', max: 3 }, 'JITO': { nome: 'Jiton', max: 3 },
    'SHAK': { nome: 'Shakuton', max: 3 }, 'SHIK': { nome: 'Shikkotsumyaku', max: Infinity }, 'TAIT': { nome: 'Taiton', max: 3 },
    'MEIT': { nome: 'Meiton', max: 3 }, 'SHOT': { nome: 'Shōton', max: 3 }, 'JINT': { nome: 'Jinton', max: 3 },
    'SAKI': { nome: 'Sakin', max: 1 }, 'SATE': { nome: 'Satetsu', max: 2 }, 'MOKU': { nome: 'Mokuton', max: 1 },
    'HYOT': { nome: 'Hyōton', max: Infinity }, 'RANT': { nome: 'Ranton', max: 3 }, 'SOMA': { nome: 'Sōma no Kō', max: 2 },
    'YOTO': { nome: 'Yōton', max: 9 }, 'FUTT': { nome: 'Futton', max: 3 }, 'JINK': { nome: 'Jinton (Kamizuru/Sem Clã)', max: 2 }
};

// Dicionário de Prodígios
const LISTA_PRODIGIOS = {
    'PKON': 'Prodígios de Konohagakure', 'PSUN': 'Prodígios de Sunagakure', 'PIWA': 'Prodígios de Iwagakure',
    'PKIR': 'Prodígios de Kirigakure', 'PKUM': 'Prodígios de Kumogakure', 'PVAR': 'Prodígios de Países Variadas',
    'PGEN': 'Prodígio da geração'
};

// Dicionário de Habilidades Únicas
const LISTA_UNICAS = {
    'DUIT': 'Doton: 𝖴𝗂𝗍𝖾𝗇𝗉𝖾𝗇', 'CHARI': '𝖢𝗁𝖺𝗄𝗎𝗋𝖺 𝗇𝗈 𝖧𝖺𝗋𝗂', 'YBAI': '𝖸𝖺𝗇𝗀: 𝖡𝖺𝗂𝗄𝖺',
    'KSEI': '𝖪𝗈𝗆𝗈𝗋𝗂 𝖲𝖾𝗂𝖼𝗁𝗎̄', 'SSOS': '𝖲𝖾𝗇𝗇𝗈 𝖲𝗈̄𝗌𝖺', 'MAKU': '𝖬𝖾𝗂𝗌𝖺𝗂a𝗄𝗎𝗋𝖾',
    'SSHO': '𝖲𝗎𝗂𝗍𝗈𝗇: 𝖲𝗎𝗂𝗍𝖾𝗇 𝖧𝗈̄𝖿𝗎𝗍𝗌𝗎', 'KEMU': '𝖪𝖾𝗆𝗎𝗋𝗂', 'SSHI': '𝖲𝗁𝗎𝗇𝗌𝗁𝗂𝗇 𝗇𝗈 𝖲𝗁𝗂𝗌𝗎𝗂',
    'KNEN': '𝖪𝗎𝗆𝗈 𝖭𝖾𝗇𝗄𝗂𝗇', 'ZANK': '𝖹𝖺𝗇𝗄𝗎̄𝗁𝖺', 'MMEI': '𝖬𝗎jin 𝖬𝖾𝗂𝗌𝖺𝗂',
    'SHIKON': '𝖲𝗁𝗂𝗄𝗈𝗇', 'KIRIN': '𝖪𝗂𝗋𝗂𝗇', 'SMAI': '𝖲𝗁𝗂𝗄𝗂gami No Mai',
    'KSIN': '𝖪𝖺gura Shingan', 'ATOR': '𝖠𝗋𝖺𝗍𝖺𝗄𝖾𝗍𝗈̄𝗌𝗁𝗂', 'NSUI': '𝖭𝖾𝗇𝗌𝗎𝗂𝗄𝖺𝗂'
};

// Dicionário de Kinjutsus
const LISTA_KINJUTSUS = {
    'KIBN': { nome: 'Kibaku Nendo', info: '· Classificada por **destruição em massa**.\n· Obtenção **com exigência**.\n· Furto do pergaminho no **gabinete do tsuchi**.', max: 1 },
    'TAJU': { nome: 'Tajū Kage Bunshin', info: '· Classificada por **auto-destrutiva**.\n· Obtenção **com exigência**.\n· Furto do pergaminho no **gabinete do hokage**.', max: 1 },
    'JION': { nome: 'Jiongu', info: '· Classificada por **anti-natural**.\n· Obtenção **com exigência**.\n· Furto do pergaminho em **takigakure**.', max: 1 },
    'EDOT': { nome: 'Edo Tensei', info: '· Classificada por **anti-natural**.\n· Obtenção **com exigência**.\n· Talismã de **orochimaru** somente com **shirohebi**.\n· Furto do pergaminho no **gabinete do hokage**.', max: 2 },
    'HITO': { nome: 'Hitokugutsu no Gyō', info: '· Classificada por **anti-natural**.\n· Obtenção **com exigência**.\n· Furto do pergaminho no **gabinete do kazekage**.', max: 1 },
    'BYAK': { nome: 'Byakugō no In', info: '· Classificada por **anti-natural**.\n· Obtenção **sem exigência**.\n· Vaga primária será o **criador** da técnica.\n· Vaga secundária obtida a partir do **criador**.', max: 2 },
    'AKUT': { nome: 'Akuta', info: '· Classificada por **anti-natural**.\n· Obtenção **sem exigência**.', max: 1 },
    'KISH': { nome: 'Kishō Tensei', info: '· Classificada por **anti-natural**.\n· Obtenção **sem exigência**.', max: 1 },
    'SHIK': { nome: 'Shiki Fūjin', info: '· Classificada por **anti-natural**.\n· Obtenção **sem exigência**.\n· Requer conhecimento sobre **fuinjutsu uzumaki**.', max: 1 },
    'RSHU': { nome: 'Rasenshuriken', info: '· Classificada por **auto-destrutiva**.\n· Obtenção **sem exigência**.\n· Requer **rasengan**.', max: 1 },
    'IZAG': { nome: 'Izanagi', info: '· Classificada por **anti-natural**.\n· Obtenção **com exigência**.\n· Requer **sharingan**.\n· Bloqueada até **segunda ordem**.', max: 2 },
    'IZAM': { nome: 'Izanami', info: '· Classificada por **auto-destrutiva**.\n· Obtenção **com exigência**.\n· Requer **sharingan**.\n· Bloqueada até **segunda ordem**.', max: 2 }
};

// ==========================================
// FUNÇÃO AUXILIAR DE NOME
// ==========================================
function getNomeVaga(codigo) {
    if (LISTA_ARTES[codigo]) return LISTA_ARTES[codigo];
    if (LISTA_ARMAS[codigo]) return LISTA_ARMAS[codigo].nome.split('·')[0].trim();
    if (LISTA_HABILIDADES[codigo]) return LISTA_HABILIDADES[codigo];
    if (LISTA_BIJUS[codigo]) return LISTA_BIJUS[codigo];
    if (LISTA_KEKKEI[codigo]) return LISTA_KEKKEI[codigo].nome;
    if (LISTA_PRODIGIOS[codigo]) return LISTA_PRODIGIOS[codigo];
    if (LISTA_UNICAS[codigo]) return LISTA_UNICAS[codigo];
    if (LISTA_KINJUTSUS[codigo]) return LISTA_KINJUTSUS[codigo].nome.toLowerCase();
    return codigo;
}

// ==========================================
// SISTEMA DE BANCO DE DADOS LOCAL (JSON)
// ==========================================
const ARQUIVO_DB = './banco_dados.json';
if (!fs.existsSync(ARQUIVO_DB)) {
    fs.writeFileSync(ARQUIVO_DB, JSON.stringify({ usuarios: {}, vagas: {}, agendaPretensao: {} }, null, 4));
}

function lerDB() { return JSON.parse(fs.readFileSync(ARQUIVO_DB, 'utf-8')); }
function salvarDB(dados) { fs.writeFileSync(ARQUIVO_DB, JSON.stringify(dados, null, 4)); }

function puxarSlots(codigo, nomeVaga) {
    const db = lerDB(); const ocupantes = db.vagas[codigo] || [];
    const nomesPadrao = ['um', 'dois', 'três']; let slots = [];
    for (let i = 0; i < 3; i++) slots.push(ocupantes[i] ? `<@${ocupantes[i]}>` : nomesPadrao[i]);
    return `٬ ${nomeVaga}.\n𓏺 ${slots.join(', ')}.`;
}

function puxarSlotsEspeciais(codigo, nomeVaga, maxSlots = 5) {
    const db = lerDB(); const ocupantes = db.vagas[codigo] || [];
    const nomesPadrao = ['Um', 'dois', 'três', 'quatro', 'cinco']; let slots = [];
    for (let i = 0; i < maxSlots; i++) slots.push(ocupantes[i] ? `<@${ocupantes[i]}>` : (nomesPadrao[i] || 'vaga'));
    return `٬ ${nomeVaga}.\n𓏺 ${slots.join(', ')}.`;
}

function puxarSlotsArma(codigo) {
    const arma = LISTA_ARMAS[codigo]; const db = lerDB(); const ocupantes = db.vagas[codigo] || [];
    return `٬ ${arma.nome}  \`[ CÓDIGO: ${codigo} ]\`\n${arma.info}\n𓏺 Vaga: ${ocupantes[0] ? `<@${ocupantes[0]}>` : 'disponível'}.`;
}

function puxarSlotsBiju(codigo) {
    const biju = LISTA_BIJUS[codigo]; const db = lerDB(); const ocupantes = db.vagas[codigo] || [];
    return `٬ ${biju}  \`[ CÓDIGO: ${codigo} ]\`\n𓏺 Hospedeiro: ${ocupantes[0] ? `<@${ocupantes[0]}>` : 'disponível'}.`;
}

function puxarSlotsKinjutsu(codigo) {
    const kin = LISTA_KINJUTSUS[codigo]; const db = lerDB(); const ocupantes = db.vagas[codigo] || [];
    let slots = [];
    for (let i = 0; i < kin.max; i++) slots.push(ocupantes[i] ? `<@${ocupantes[i]}>` : 'vago');
    return `• \`[ CÓDIGO: ${codigo} ]\`\n٬ ${kin.nome.toLowerCase()} · ${slots.join(' & ')}.\n${kin.info}`;
}

client.once('ready', (clientReady) => {
    console.log(` O bot ${clientReady.user.tag} está online com comandos de barra!`);

    setInterval(async () => {
        const db = lerDB();
        if (db.agendaPretensao && db.agendaPretensao.ativa) {
            const agora = Date.now();
            if (agora >= db.agendaPretensao.timestamp) {
                db.agendaPretensao.ativa = false;
                salvarDB(db);

                try {
                    const canal = await client.channels.fetch(CANAL_PRETENSAO_ID);
                    if (canal) {
                        await canal.permissionOverwrites.edit(canal.guild.roles.everyone, {
                            SendMessages: true
                        });
                        
                        await canal.send('📢 **Canal de pretensão aberto!** Não esqueça de olhar o código da vaga que você almeja.');
                        console.log(' [Agendador] Canal de pretensão aberto automaticamente com sucesso!');
                    }
                } catch (error) {
                    console.error('❌ Erro no agendador ao tentar abrir o canal:', error);
                }
            }
        }
    }, 30000);
});

// ==========================================
// SISTEMA DE PRETENSÃO (TEXTO CONVENCIONAL)
// ==========================================
client.on('messageCreate', async (message) => {
    if (message.author.bot || message.channel.id !== CANAL_PRETENSAO_ID) return;

    const codigo = message.content.trim().toUpperCase();
    const db = lerDB();
    const isArte = !!LISTA_ARTES[codigo]; 
    const isArma = !!LISTA_ARMAS[codigo];
    const isHabilidade = !!LISTA_HABILIDADES[codigo];
    const isBiju = !!LISTA_BIJUS[codigo];
    const isKekkei = !!LISTA_KEKKEI[codigo];
    const isProdigio = !!LISTA_PRODIGIOS[codigo];
    const isUnica = !!LISTA_UNICAS[codigo];
    const isKinjutsu = !!LISTA_KINJUTSUS[codigo];

    if (isArte || isArma || isHabilidade || isBiju || isKekkei || isProdigio || isUnica || isKinjutsu) {
        const nomeExibicao = getNomeVaga(codigo);
        
        if (!db.vagas[codigo]) db.vagas[codigo] = [];
        if (!db.usuarios[message.author.id]) db.usuarios[message.author.id] = [];

        if (db.vagas[codigo].includes(message.author.id)) {
            message.delete().catch(() => {});
            return message.channel.send(`⚠️ <@${message.author.id}>, você já possui a vaga **${nomeExibicao}**!`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 4000));
        }

        let limiteSlots = 3;
        if (isArma || isBiju || codigo === 'PGEN' || (isUnica && codigo !== 'SSOS')) limiteSlots = 1;
        else if (isKekkei) limiteSlots = LISTA_KEKKEI[codigo].max;
        else if (isProdigio && codigo !== 'PGEN') limiteSlots = 5;
        else if (isKinjutsu) limiteSlots = LISTA_KINJUTSUS[codigo].max;

        if (db.vagas[codigo].length >= limiteSlots) {
            message.delete().catch(() => {});
            return message.channel.send(`❌ <@${message.author.id}>, desculpe, os slots para **${nomeExibicao}** já estão cheios!`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 4000));
        }

        if (isArte) {
            const minhasVagas = db.usuarios[message.author.id];
            const qtdExoticas = minhasVagas.filter(v => LISTA_ARTES[v]).length;
            const possuiTraco = minhasVagas.some(v => !LISTA_ARTES[v] && !LISTA_ARMAS[v] && !LISTA_HABILIDADES[v] && !LISTA_BIJUS[v] && !LISTA_KEKKEI[v] && !LISTA_PRODIGIOS[v] && !LISTA_UNICAS[v] && !LISTA_KINJUTSUS[v]);
            if ((possuiTraco && qtdExoticas >= 2) || (!possuiTraco && qtdExoticas >= 3)) {
                message.delete().catch(() => {});
                return message.channel.send(`🚫 <@${message.author.id}>, limite atingido pelas regras de exóticas do RP.`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
            }
        }

        db.vagas[codigo].push(message.author.id);
        db.usuarios[message.author.id].push(codigo);
        salvarDB(db);

        message.reply(`✅ Sucesso! Você garantiu seu slot em **${nomeExibicao}**.`)
            .then(msg => setTimeout(() => msg.delete().catch(() => {}), 8000));
    } else {
        message.delete().catch(() => {});
        message.channel.send(`❌ <@${message.author.id}>, código inválido.`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 4000));
    }
});

// ==========================================
// EXECUÇÃO DOS COMANDOS DE BARRA (/)
// ==========================================
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'tools') {
        if (!interaction.memberPermissions || !interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: '❌ Você não tem permissão de Administrador para usar este comando.', ephemeral: true });
        }

        const embedTools = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle('🛠️ Painel de Comando da Staff')
            .setDescription('Gerencie as vagas do servidor utilizando os novos comandos de barra:\n\n' +
                '• `/setvaga` — Escolha o membro e o código para dar uma vaga manualmente.\n' +
                '• `/delvaga` — Escolha o membro e o código para remover de forma forçada.\n' +
                '• `/setarpretensao` — Programa e tranca o canal de pretensão até a data escolhida.');

        return interaction.reply({ embeds: [embedTools] });
    }

    if (commandName === 'setarpretensao') {
        if (!interaction.memberPermissions || !interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: '❌ Você não tem permissão de Administrador para usar este comando.', ephemeral: true });
        }

        const diaInput = interaction.options.getString('dia'); 
        const horarioInput = interaction.options.getString('horario'); 

        const partesDia = diaInput.split('/');
        const partesHorario = horarioInput.split(':');

        if (partesDia.length < 2 || partesHorario.length < 2) {
            return interaction.reply({ content: '❌ Formato inválido! Use o dia como `DD/MM` e o horário como `HH:MM`.', ephemeral: true });
        }

        const dia = partesDia[0].padStart(2, '0');
        const mes = partesDia[1].padStart(2, '0');
        const ano = partesDia[2] ? partesDia[2] : new Date().getFullYear();

        const hora = partesHorario[0].padStart(2, '0');
        const minuto = partesHorario[1].padStart(2, '0');

        const dataStringISO = `${ano}-${mes}-${dia}T${hora}:${minuto}:00-03:00`;
        const dataAlvo = new Date(dataStringISO);

        if (isNaN(dataAlvo.getTime())) {
            return interaction.reply({ content: '❌ Data ou horário fornecidos são inválidos.', ephemeral: true });
        }

        if (dataAlvo.getTime() <= Date.now()) {
            return interaction.reply({ content: '❌ A data e o horário programados precisam estar no futuro!', ephemeral: true });
        }

        await interaction.deferReply();

        try {
            const canal = await interaction.guild.channels.fetch(CANAL_PRETENSAO_ID);
            if (canal) {
                await canal.permissionOverwrites.edit(canal.guild.roles.everyone, {
                    SendMessages: false
                });
            }
        } catch (err) {
            return interaction.editReply({ content: '❌ Não consegui fechar o canal automaticamente. Verifique se o ID configurado está correto.' });
        }

        const db = lerDB();
        db.agendaPretensao = {
            ativa: true,
            timestamp: dataAlvo.getTime(),
            dataFormatada: `${diaInput} às ${horarioInput} (Horário de Brasília)`
        };
        salvarDB(db);

        return interaction.editReply({ content: `🔒 O canal de pretensão foi **fechado** com sucesso! Ele abrirá de forma automática no dia **${diaInput}** às **${horarioInput}** (Sincronizado com o Horário de Brasília).` });
    }

    if (commandName === 'setvaga') {
        if (!interaction.memberPermissions || !interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: '❌ Permissão negada.', ephemeral: true });
        }

        const miembro = interaction.options.getUser('membro');
        const codigo = interaction.options.getString('codigo').toUpperCase();

        const isArte = !!LISTA_ARTES[codigo]; const isArma = !!LISTA_ARMAS[codigo]; const isHabilidade = !!LISTA_HABILIDADES[codigo]; const isBiju = !!LISTA_BIJUS[codigo]; const isKekkei = !!LISTA_KEKKEI[codigo]; const isProdigio = !!LISTA_PRODIGIOS[codigo]; const isUnica = !!LISTA_UNICAS[codigo]; const isKinjutsu = !!LISTA_KINJUTSUS[codigo];
        if (!isArte && !isArma && !isHabilidade && !isBiju && !isKekkei && !isProdigio && !isUnica && !isKinjutsu) return interaction.reply({ content: '❌ Esse código de vaga não existe!', ephemeral: true });

        const db = lerDB();
        if (!db.vagas[codigo]) db.vagas[codigo] = [];
        if (!db.usuarios[miembro.id]) db.usuarios[miembro.id] = [];

        if (db.vagas[codigo].includes(miembro.id)) return interaction.reply({ content: `⚠️ O jogador <@${miembro.id}> já possui essa vaga.`, ephemeral: true });

        let limiteSlots = 3;
        if (isArma || isBiju || codigo === 'PGEN' || (isUnica && codigo !== 'SSOS')) limiteSlots = 1;
        else if (isKekkei) limiteSlots = LISTA_KEKKEI[codigo].max;
        else if (isProdigio && codigo !== 'PGEN') limiteSlots = 5;
        else if (isKinjutsu) limiteSlots = LISTA_KINJUTSUS[codigo].max;

        if (db.vagas[codigo].length >= limiteSlots) return interaction.reply({ content: '❌ Esta vaga está sem slots livres!', ephemeral: true });

        db.vagas[codigo].push(miembro.id); db.usuarios[miembro.id].push(codigo);
        salvarDB(db);

        const nomeExibicao = getNomeVaga(codigo);
        return interaction.reply({ content: `✅ Vaga **${nomeExibicao}** atribuída com sucesso para <@${miembro.id}>!` });
    }

    if (commandName === 'delvaga') {
        if (!interaction.memberPermissions || !interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: '❌ Permissão negada.', ephemeral: true });
        }

        const miembro = interaction.options.getUser('membro');
        const codigo = interaction.options.getString('codigo').toUpperCase();

        const db = lerDB();
        if (!db.vagas[codigo] || !db.vagas[codigo].includes(miembro.id)) {
            return interaction.reply({ content: `❌ O jogador <@${miembro.id}> não ocupa a vaga \`${codigo}\`.`, ephemeral: true });
        }

        db.vagas[codigo] = db.vagas[codigo].filter(id => id !== miembro.id);
        if (db.usuarios[miembro.id]) db.usuarios[miembro.id] = db.usuarios[miembro.id].filter(v => v !== codigo);
        salvarDB(db);

        const nomeExibicao = getNomeVaga(codigo);
        return interaction.reply({ content: `🗑️ Vaga **${nomeExibicao}** removida com sucesso de <@${miembro.id}>.` });
    }

    if (commandName === 'minhasvagas') {
        const db = lerDB();
        const minhasVagas = db.usuarios[interaction.user.id] || [];

        if (minhasVagas.length === 0) return interaction.reply({ content: '📭 Você não possui nenhuma vaga registrada.', ephemeral: true });

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle('📂 Sua Listagem no RP')
            .setDescription(minhasVagas.map(v => `• **${getNomeVaga(v)}** \`[ ${v} ]\``).join('\n\n') + '\n\n*Abidique de uma vaga usando o seletor abaixo:*');

        const seletor = new StringSelectMenuBuilder().setCustomId('abdicar_menu').setPlaceholder('Escolha uma vaga para abrir mão...');
        minhasVagas.forEach(v => {
            const labelFinal = getNomeVaga(v);
            seletor.addOptions(new StringSelectMenuOptionBuilder().setLabel(labelFinal.substring(0, 25)).setValue(v));
        });

        const row = new ActionRowBuilder().addComponents(seletor);
        const painelMinhasVagas = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

        const collector = painelMinhasVagas.createMessageComponentCollector({ filter: (i) => i.user.id === interaction.user.id, time: 60000 });
        collector.on('collect', async (i) => {
            if (i.customId === 'abdicar_menu') {
                const vagaSelecionada = i.values[0]; const dadosAtuais = lerDB();
                dadosAtuais.usuarios[interaction.user.id] = dadosAtuais.usuarios[interaction.user.id].filter(v => v !== vagaSelecionada);
                if (dadosAtuais.vagas[vagaSelecionada]) dadosAtuais.vagas[vagaSelecionada] = dadosAtuais.vagas[vagaSelecionada].filter(id => id !== interaction.user.id);
                dadosAtuais.vagas[vagaSelecionada] = dadosAtuais.vagas[vagaSelecionada].filter(id => id !== interaction.user.id);
                salvarDB(dadosAtuais);
                await i.update({ content: `✅ Você abdicou da vaga com sucesso!`, embeds: [], components: [] });
            }
        });
        return;
    }

    if (commandName === 'vagas') {
        let paginaAtual = 1;
        
        const textoPagina6_Tracos = `*Atenção: Os traços abaixo são uma exceção. Sua obtenção é feita através de sorteio e não estarão disponíveis para a pretensão comum.*\n\n٬ Futatsu no Hikari.\n𓏺 **vaga exclusiva.**\n\n٬ Hi no Ishi.\n𓏺 **vaga exclusiva.**\n\n٬ Hōbi Chakura.\n𓏺 **vaga exclusiva.**\n\n٬ Kongō Fūsa.\n𓏺 **vaga exclusiva.**\n\n٬ Tairyoku Kaifuku.\n𓏺 **vaga exclusiva.**\n\n٬ Saisei Noryoku.\n𓏺 **vaga exclusiva.**\n\n٬ Saikyō no Tate.\n𓏺 **vaga exclusiva.**\n\n٬ Nanosaizu no Dokumushi.\n𓏺 **vaga exclusiva.**\n\n٬ Suna no Tate.\n𓏺 **vaga exclusiva.**\n\n٬ Nijū Kekkei.\n𓏺 **vaga exclusiva.**\n\n٬ Sanbiki no Kemono.\n𓏺 **vaga exclusiva.**\n\n٬ Shinten Kugutsu Juin.\n𓏺 **vaga exclusiva.**\n\n٬ Sonzai no Gonkasei.\n𓏺 **vaga exclusiva.**\n\n٬ Mizu to Abura.\n𓏺 **vaga exclusiva.**\n\n٬ Experimento Bem Sucedido.\n𓏺 **vaga exclusiva.**`;

        const textoPagina9_Kekkei = `• \`[ CÓDIGO: BAKU ]\`\n٬ Bakuton.\n𓏺 um, dois, três.\n\n• \`[ CÓDIGO: KOTO ]\`\n٬ Kōton.\n𓏺 um, dois, três.\n\n• \`[ CÓDIGO: JITO ]\`\n٬ Jiton.\n𓏺 um, dois, três.\n\n• \`[ CÓDIGO: SHAK ]\`\n٬ Shakuton.\n𓏺 um, dois, três.\n\n• \`[ CÓDIGO: SHIK ]\`\n٬ Shikkotsumyaku.\n𓏺 ilimitado.\n\n• \`[ CÓDIGO: TAIT ]\`\n٬ Taiton.\n𓏺 um, dois, três.\n\n• \`[ CÓDIGO: MEIT ]\`\n٬ Meiton.\n𓏺 um, dois, três.\n\n• \`[ CÓDIGO: SHOT ]\`\n٬ Shōton.\n𓏺 um, dois, três.\n\n• \`[ CÓDIGO: JINT ]\`\n٬ Jinton.\n𓏺 um, dois, três.\n\n• \`[ CÓDIGO: SAKI ]\`\n٬ Sakin.\n𓏺 uma vaga.\n\n• \`[ CÓDIGO: SATE ]\`\n٬ Satetsu.\n𓏺 vaga, vaga.\n\n• \`[ CÓDIGO: MOKU ]\`\n٬ Mokuton.\n𓏺 uma vaga.\n\n• \`[ CÓDIGO: HYOT ]\`\n٬ Hyōton.\n𓏺 ilimitado.\n\n• \`[ CÓDIGO: RANT ]\`\n٬ Ranton.\n𓏺 um, dois, três.\n\n• \`[ CÓDIGO: SOMA ]\`\n٬ Sōma no Kō.\n𓏺 um, dois.\n\n• \`[ CÓDIGO: YOTO ]\`\n٬ Yōton.\n𓏺 um, dois, três.\n\n• \`[ CÓDIGO: FUTT ]\`\n٬ Futton.\n𓏺 um, dois, três.\n\n• \`[ CÓDIGO: JINK ]\`\n٬ Jinton.\n𓏺 uma vaga sem clã\n𓓺 uma vaga kamizuru.`;

        function construirPainel(pagina) {
            const embed = new EmbedBuilder().setColor('#2b2d31');
            const botaoVoltar = new ButtonBuilder().setCustomId('voltar').setLabel('⬅️ Anterior').setStyle(ButtonStyle.Secondary).setDisabled(pagina === 1);
            const botaoProximo = new ButtonBuilder().setCustomId('proximo').setLabel('Próxima ➡️').setStyle(ButtonStyle.Primary).setDisabled(pagina === 10);

            if (pagina === 1) {
                embed.setTitle('📜 Listagem — 【 ARTES EXÓTICAS 】').setDescription(Object.keys(LISTA_ARTES).map(cod => `• \`[ CÓDIGO: ${cod} ]\`\n` + puxarSlots(cod, LISTA_ARTES[cod])).join('\n\n'));
            }
            else if (pagina === 2) {
                embed.setTitle('📜 Listagem — 【 HABILIDADES EXÓTICAS 】').setDescription(Object.keys(LISTA_HABILIDADES).map(cod => `• \`[ CÓDIGO: ${cod} ]\`\n` + puxarSlots(cod, LISTA_HABILIDADES[cod])).join('\n\n'));
            }
            else if (pagina === 3) {
                embed.setTitle('📜 Listagem — Castelo 【 ARMAS EXÓTICAS 】').setDescription(['SENSU', 'SHOKEN', 'HINOKEN', 'GUNBAI', 'OGAMA', 'GARIAN', 'CHAKTO', 'YOROI', 'RAIJIN', 'ZANBATO', 'KOKUTO', 'SOSHUG', 'KYOMEI', 'MATEKI', 'KUSATS', 'KUSANA', 'KUROSA'].map(cod => puxarSlotsArma(cod)).join('\n\n'));
            }
            else if (pagina === 4) {
                embed.setTitle('📜 Listagem — 【 ARMAS DA NÉVOA & RIKUDOU 】').setDescription(`**𓏺𓏺 i . Espadas · Névoa ▬**\n\n${['KUBIKI', 'SAMEHA', 'NUIBARI', 'KABUTO', 'SHIBUKI', 'KIBA', 'HIRAME'].map(cod => puxarSlotsArma(cod)).join('\n\n')}\n\n**𓏺𓏺 i . Armas · Rikudou ▬**\n\n${['BASHO', 'BENI', 'BOHAKU', 'KOKIN', 'SHICHI'].map(cod => puxarSlotsArma(cod)).join('\n\n')}`);
            }
            else if (pagina === 5) {
                embed.setTitle('📜 Listagem — 【 HABILIDADES ÚNICAS 】').setDescription(
                    `• \`[ CÓDIGO: DUIT ]\`\n${puxarSlotsEspeciais('DUIT', LISTA_UNICAS['DUIT'], 1)}\n\n` +
                    `• \`[ CÓDIGO: CHARI ]\`\n${puxarSlotsEspeciais('CHARI', LISTA_UNICAS['CHARI'], 1)}\n\n` +
                    `• \`[ CÓDIGO: YBAI ]\`\n${puxarSlotsEspeciais('YBAI', LISTA_UNICAS['YBAI'], 1)}\n\n` +
                    `• \`[ CÓDIGO: KSEI ]\`\n${puxarSlotsEspeciais('KSEI', LISTA_UNICAS['KSEI'], 1)}\n\n` +
                    `• \`[ CÓDIGO: SSOS ]\`\n${puxarSlotsEspeciais('SSOS', LISTA_UNICAS['SSOS'], 3)}\n\n` +
                    `• \`[ CÓDIGO: MAKU ]\`\n${puxarSlotsEspeciais('MAKU', LISTA_UNICAS['MAKU'], 1)}\n\n` +
                    `• \`[ CÓDIGO: SSHO ]\`\n${puxarSlotsEspeciais('SSHO', LISTA_UNICAS['SSHO'], 1)}\n\n` +
                    `• \`[ CÓDIGO: KEMU ]\`\n${puxarSlotsEspeciais('KEMU', LISTA_UNICAS['KEMU'], 1)}\n\n` +
                    `• \`[ CÓDIGO: SSHI ]\`\n${puxarSlotsEspeciais('SSHI', LISTA_UNICAS['SSHI'], 1)}\n\n` +
                    `• \`[ CÓDIGO: KNEN ]\`\n${puxarSlotsEspeciais('KNEN', LISTA_UNICAS['KNEN'], 1)}\n\n` +
                    `• \`[ CÓDIGO: ZANK ]\`\n${puxarSlotsEspeciais('ZANK', LISTA_UNICAS['ZANK'], 1)}\n\n` +
                    `• \`[ CÓDIGO: MMEI ]\`\n${puxarSlotsEspeciais('MMEI', LISTA_UNICAS['MMEI'], 1)}\n\n` +
                    `• \`[ CÓDIGO: SHIKON ]\`\n${puxarSlotsEspeciais('SHIKON', LISTA_UNICAS['SHIKON'], 1)}\n\n` +
                    `• \`[ CÓDIGO: KIRIN ]\`\n${puxarSlotsEspeciais('KIRIN', LISTA_UNICAS['KIRIN'], 1)}\n\n` +
                    `• \`[ CÓDIGO: SMAI ]\`\n${puxarSlotsEspeciais('SMAI', LISTA_UNICAS['SMAI'], 1)}\n\n` +
                    `• \`[ CÓDIGO: KSIN ]\`\n${puxarSlotsEspeciais('KSIN', LISTA_UNICAS['KSIN'], 1)}\n\n` +
                    `• \`[ CÓDIGO: ATOR ]\`\n${puxarSlotsEspeciais('ATOR', LISTA_UNICAS['ATOR'], 1)}\n\n` +
                    `• \`[ CÓDIGO: NSUI ]\`\n${puxarSlotsEspeciais('NSUI', LISTA_UNICAS['NSUI'], 1)}`
                );
            }
            else if (pagina === 6) {
                embed.setTitle('📜 Listagem — 【 TRAÇOS 】').setDescription(textoPagina6_Tracos);
            }
            else if (pagina === 7) {
                embed.setTitle('📜 Listagem — 【 PRODÍGIOS 】').setDescription(
                    `• \`[ CÓDIGO: PKON ]\`\n${puxarSlotsEspeciais('PKON', 'Prodígios de Konohagakure', 5)}\n\n` +
                    `• \`[ CÓDIGO: PSUN ]\`\n${puxarSlotsEspeciais('PSUN', 'Prodígios de Sunagakure', 5)}\n\n` +
                    `• \`[ CÓDIGO: PIWA ]\`\n${puxarSlotsEspeciais('PIWA', 'Prodígios de Iwagakure', 5)}\n\n` +
                    `• \`[ CÓDIGO: PKIR ]\`\n${puxarSlotsEspeciais('PKIR', 'Prodígios de Kirigakure', 5)}\n\n` +
                    `• \`[ CÓDIGO: PKUM ]\`\n${puxarSlotsEspeciais('PKUM', 'Prodígios de Kumogakure', 5)}\n\n` +
                    `• \`[ CÓDIGO: PVAR ]\`\n${puxarSlotsEspeciais('PVAR', 'Prodígios de Ações Variadas', 5)}\n\n` +
                    `• \`[ CÓDIGO: PGEN ]\`\n${puxarSlotsEspeciais('PGEN', 'Prodígio da geração', 1)}`
                );
            }
            else if (pagina === 8) {
                embed.setTitle('📜 Listagem — 【 BIJUS 】').setDescription(Object.keys(LISTA_BIJUS).map(cod => puxarSlotsBiju(cod)).join('\n\n'));
            }
            else if (pagina === 9) {
                embed.setTitle('📜 Listagem — 【 KEKKEI GENKAI 】').setDescription(textoPagina9_Kekkei);
            }
            else if (pagina === 10) {
                embed.setTitle('📜 Listagem — 【 KINJUTSUS 】').setDescription(Object.keys(LISTA_KINJUTSUS).map(cod => puxarSlotsKinjutsu(cod)).join('\n\n'));
            }

            embed.setFooter({ text: `Página ${pagina}/10` });
            const menu = new StringSelectMenuBuilder().setCustomId('menu_vagas_nav').setPlaceholder('Saltar para categoria...')
                .addOptions(
                    { label: '1. Artes Exóticas', value: '1' },
                    { label: '2. Habilidades Exóticas', value: '2' },
                    { label: '3. Armas Exóticas', value: '3' }, 
                    { label: '4. Névoa & Rikudou', value: '4' },
                    { label: '5. Habilidades Únicas', value: '5' },
                    { label: '6. Traços', value: '6' },
                    { label: '7. Prodígios', value: '7' },
                    { label: '8. Bijus', value: '8' },
                    { label: '9. Kekkei Genkai', value: '9' },
                    { label: '10. Kinjutsus', value: '10' }
                );

            return { embeds: [embed], components: [new ActionRowBuilder().addComponents(botaoVoltar, botaoProximo), new ActionRowBuilder().addComponents(menu)] };
        }

        const painel = await interaction.reply({ ...construirPainel(paginaAtual), fetchReply: true });
        const collector = painel.createMessageComponentCollector({ filter: (i) => i.user.id === interaction.user.id, time: 180000 });

        collector.on('collect', async (i) => {
            if (i.customId === 'proximo') paginaAtual++;
            else if (i.customId === 'voltar') paginaAtual--;
            else if (i.customId === 'menu_vagas_nav') paginaAtual = parseInt(i.values[0]);
            await i.update(construirPainel(paginaAtual));
        });
        collector.on('end', () => painel.edit({ components: [] }).catch(() => {}));
    }
});

client.login(process.env.TOKEN);