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

// Dicionários
const LISTA_ARTES = {
    'KUSA': 'Kusagakureryū', 'SAIR': 'Sairento Kiringu', 'IAID': 'Iaidō',
    'KONG': 'Kongoken', 'WHIR': 'Whirlwind', 'ENGE': 'Engeki',
    'AKRO': 'Akurobatto', 'HARI': 'Hari Jizō', 'GAMU': 'Gamu Fūsen',
    'JISH': 'Jishaku Ninpō', 'KONO': 'Konoharyū', 'KUMO': 'Kumoryū',
    'YORO': 'Yoroigui', 'SAGA': 'Saganken', 'MUON': 'Muon no Ken',
    'KAKU': 'Kakuran Taijutsu', 'HANA': 'Hana Ninpō', 'RAKA': 'Rakanken'
};

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

const LISTA_BIJUS = {
    'SHUK': 'Ichibi No Shukaku', 'MATA': 'Nibi No Matabi', 'ISOB': 'Sanbi No Isobu',
    'GOKU': 'Yonbi No Son Goku', 'KOKU': 'Gobi No Kokuo', 'SAIK': 'Rokubi No Saiken',
    'CHOM': 'Nanabi No Chomei', 'GYUK': 'Hachibi No Gyuki', 'KURA': 'Kyubi No Kurama'
};

const LISTA_KEKKEI = {
    'BAKU': { nome: 'Bakuton', max: 3 }, 'KOTO': { nome: 'Kōton', max: 3 }, 'JITO': { nome: 'Jiton', max: 3 },
    'SHAK': { nome: 'Shakuton', max: 3 }, 'SHIK': { nome: 'Shikkotsumyaku', max: Infinity }, 'TAIT': { nome: 'Taiton', max: 3 },
    'MEIT': { nome: 'Meiton', max: 3 }, 'SHOT': { nome: 'Shōton', max: 3 }, 'JINT': { nome: 'Jinton', max: 3 },
    'SAKI': { nome: 'Sakin', max: 1 }, 'SATE': { nome: 'Satetsu', max: 2 }, 'MOKU': { nome: 'Mokuton', max: 1 },
    'HYOT': { nome: 'Hyōton', max: Infinity }, 'RANT': { nome: 'Ranton', max: 3 }, 'SOMA': { nome: 'Sōma no Kō', max: 2 },
    'YOTO': { nome: 'Yōton', max: 9 }, 'FUTT': { nome: 'Futton', max: 3 }, 'JINK': { nome: 'Jinton (Kamizuru/Sem Clã)', max: 2 }
};

const LISTA_PRODIGIOS = {
    'PKON': 'Prodígios de Konohagakure', 'PSUN': 'Prodígios de Sunagakure', 'PIWA': 'Prodígios de Iwagakure',
    'PKIR': 'Prodígios de Kirigakure', 'PKUM': 'Prodígios de Kumogakure', 'PVAR': 'Prodígios de Países Variadas',
    'PGEN': 'Prodígio da geração'
};

const LISTA_UNICAS = {
    'DUIT': 'Doton: 𝖴𝗂𝗍𝖾𝗇𝗉𝖾𝗇', 'CHARI': '𝖢𝗁𝖺𝗄𝗎𝗋𝖺 𝗇𝗈 𝖧𝖺𝗋𝗂', 'YBAI': '𝖸𝖺𝗇𝗀: 𝖡𝖺𝗂𝗄𝖺',
    'KSEI': '𝖪𝗈𝗆𝗈𝗋𝗂 𝖲𝖾𝗂𝖼𝗁𝗎̄', 'SSOS': '𝖲𝖾𝗇𝗇𝗈 𝖲𝗈̄𝗌𝖺', 'MAKU': '𝖬𝖾𝗂𝗌𝖺𝗂a𝗄𝗎𝗋𝖾',
    'SSHO': '𝖲𝗎𝗂𝗍𝗈𝗇: 𝖲𝗎𝗂𝗍𝖾𝗇 𝖧𝗈̄𝖿𝗎𝗍𝗌𝗎', 'KEMU': '𝖪𝖾𝗆𝗎𝗋𝗂', 'SSHI': '𝖲𝗁𝗎𝗇𝗌𝗁𝗂𝗇 𝗇𝗈 𝖲𝗁𝗂𝗌𝗎𝗂',
    'KNEN': '𝖪𝗎𝗆𝗈 𝖭𝖾𝗇𝗄𝗂𝗇', 'ZANK': '𝖹𝖺𝗇𝗄𝗎̄𝗁𝖺', 'MMEI': '𝖬𝗎jin 𝖬𝖾𝗂𝗌𝖺𝗂',
    'SHIKON': '𝖲𝗁𝗂𝗄𝗈𝗇', 'KIRIN': '𝖪𝗂𝗋𝗂𝗇', 'SMAI': '𝖲𝗁𝗂𝗄𝗂gami No Mai',
    'KSIN': '𝖪𝖺gura Shingan', 'ATOR': '𝖠𝗋𝖺𝗍𝖺𝗄𝖾𝗍𝗈̄𝗌𝗁𝗂', 'NSUI': '𝖭𝖾𝗇𝗌𝗎𝗂𝗄𝖺𝗂'
};

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
// FUNÇÕES AUXILIARES
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
    console.log(`O bot ${clientReady.user.tag} está online!`);
});

// ==========================================
// COMANDOS DE BARRA E INTERAÇÕES
// ==========================================
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    // ... (Mantém as outras lógicas de comandos igual ao original) ...

    if (interaction.commandName === 'vagas') {
        let paginaAtual = 1;
        const textoPagina6_Tracos = `*Atenção: Os traços abaixo são uma exceção. Sua obtenção é feita através de sorteio e não estarão disponíveis para a pretensão comum.*\n\n٬ Futatsu no Hikari.\n𓏺 **vaga exclusiva.**\n\n٬ Hi no Ishi.\n𓏺 **vaga exclusiva.**\n\n٬ Hōbi Chakura.\n𓏺 **vaga exclusiva.**\n\n٬ Kongō Fūsa.\n𓏺 **vaga exclusiva.**\n\n٬ Tairyoku Kaifuku.\n𓏺 **vaga exclusiva.**\n\n٬ Saisei Noryoku.\n𓏺 **vaga exclusiva.**\n\n٬ Saikyō no Tate.\n𓏺 **vaga exclusiva.**\n\n٬ Nanosaizu no Dokumushi.\n𓏺 **vaga exclusiva.**\n\n٬ Suna no Tate.\n𓏺 **vaga exclusiva.**\n\n٬ Nijū Kekkei.\n𓏺 **vaga exclusiva.**\n\n٬ Sanbiki no Kemono.\n𓏺 **vaga exclusiva.**\n\n٬ Shinten Kugutsu Juin.\n𓏺 **vaga exclusiva.**\n\n٬ Sonzai no Gonkasei.\n𓏺 **vaga exclusiva.**\n\n٬ Mizu to Abura.\n𓏺 **vaga exclusiva.**\n\n٬ Experimento Bem Sucedido.\n𓏺 **vaga exclusiva.**`;

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
                embed.setTitle('📜 Listagem — 【 HABILIDADES ÚNICAS 】').setDescription(Object.keys(LISTA_UNICAS).map(cod => `• \`[ CÓDIGO: ${cod} ]\`\n${puxarSlotsEspeciais(cod, LISTA_UNICAS[cod], cod === 'SSOS' ? 3 : 1)}`).join('\n\n'));
            }
            else if (pagina === 6) {
                embed.setTitle('📜 Listagem — 【 TRAÇOS 】').setDescription(textoPagina6_Tracos);
            }
            else if (pagina === 7) {
                embed.setTitle('📜 Listagem — 【 PRODÍGIOS 】').setDescription(Object.keys(LISTA_PRODIGIOS).map(cod => `• \`[ CÓDIGO: ${cod} ]\`\n${puxarSlotsEspeciais(cod, LISTA_PRODIGIOS[cod], cod === 'PGEN' ? 1 : 5)}`).join('\n\n'));
            }
            else if (pagina === 8) {
                embed.setTitle('📜 Listagem — 【 BIJUS 】').setDescription(Object.keys(LISTA_BIJUS).map(cod => puxarSlotsBiju(cod)).join('\n\n'));
            }
            else if (pagina === 9) {
                embed.setTitle('📜 Listagem — 【 KEKKEI GENKAI 】').setDescription(
                    Object.keys(LISTA_KEKKEI).map(cod => `• \`[ CÓDIGO: ${cod} ]\`\n${puxarSlotsEspeciais(cod, LISTA_KEKKEI[cod].nome, LISTA_KEKKEI[cod].max === Infinity ? 5 : LISTA_KEKKEI[cod].max)}`).join('\n\n')
                );
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