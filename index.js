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

// Guarda os painéis /vagas que estão abertos para atualizar quando alguém pega/remove vaga.
const paineisVagasAtivos = new Map();

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

// Dicionário de Traços — apenas ADM pode usar/dar essas vagas
const LISTA_TRACOS = {
    'FUTA': 'Futatsu no Hikari',
    'HINO': 'Hi no Ishi',
    'HOBI': 'Hōbi Chakura',
    'KFUS': 'Kongō Fūsa',
    'TKAI': 'Tairyoku Kaifuku',
    'SNRK': 'Saisei Noryoku',
    'STTE': 'Saikyō no Tate',
    'NDOK': 'Nanosaizu no Dokumushi',
    'SUTD': 'Suna no Tate',
    'NIKE': 'Nijū Kekkei',
    'SBKE': 'Sanbiki no Kemono',
    'SKJU': 'Shinten Kugutsu Juin',
    'SGON': 'Sonzai no Gonkasei',
    'MIOB': 'Mizu to Abura',
    'EXBS': 'Experimento Bem Sucedido'
};

// Dicionário de Juinjutsus — apenas ADM pode usar/dar essas vagas
const LISTA_JUINJUTSUS = {
    'ICHI': { nome: '𝗜𝗰𝗵𝗶 𝗻𝗼 𝗝𝘂𝗶𝗻', info: '' },
    'NINO': { nome: '𝗡𝗶 𝗻𝗼 𝗝𝘂𝗶𝗻', info: '' },
    'SANJ': { nome: '𝗦𝗮𝗻 𝗻𝗼 𝗝𝘂𝗶𝗻', info: '' },
    'YONJ': { nome: '𝗬𝗼𝗻 𝗻𝗼 𝗝𝘂𝗶𝗻', info: '' },
    'CHIJ': { nome: '𝗖𝗵𝗶 𝗻𝗼 𝗝𝘂𝗶𝗻', info: "𓏺 +𝟯𝟱 𝖼𝗁𝖺𝗄𝗋𝖺 𝗉𝗈𝗂𝗇𝗍'𝗌." },
    'TENJ': { nome: '𝗧𝗲𝗻 𝗻𝗼 𝗝𝘂𝗶𝗻', info: "𓏺 +𝟯𝟱 𝖼𝗁𝖺𝗄𝗋𝖺 𝗉𝗈𝗂𝗇𝗍'𝗌." }
};

// Dicionário de Características
const LISTA_CARACTERISTICAS = {
    'VELO': {
        nome: '𝗩𝗲𝗹𝗼𝗰𝗶𝗱𝗮𝗱𝗲 𝗘𝘅𝗼𝗿𝗯𝗶𝘁𝗮𝗻𝘁𝗲',
        info: `característica responsável por transformar o 𝘀𝗵𝗶𝗻𝗼𝗯𝗶 em uma exceção ao abordar o parâmetro.

٬ Requer 𝘁𝗮𝗶𝗷𝘂𝘁𝘀𝘂 nível 𝟬𝟱. Indisponível para quem possui clã.`
    },
    'FORC': {
        nome: '𝗙𝗼𝗿𝗰̧𝗮 𝗘𝘅𝗼𝗿𝗯𝗶𝘁𝗮𝗻𝘁𝗲',
        info: `característica responsável por transformar o 𝘀𝗵𝗶𝗻𝗼𝗯𝗶 em uma exceção ao abordar o parâmetro.

٬ Requer 𝘁𝗮𝗶𝗷𝘂𝘁𝘀𝘂 nível 𝟬𝟱. Indisponível para quem possui clã.`
    },
    'RESI': {
        nome: '𝗥𝗲𝘀𝗶𝘀𝘁𝗲̂𝗻𝗰𝗶𝗮 𝗘𝘅𝗼𝗿𝗯𝗶𝘁𝗮𝗻𝘁𝗲',
        info: `característica responsável por transformar o 𝘀𝗵𝗶𝗻𝗼𝗯𝗶 em uma exceção ao abordar o parâmetro.

٬ Requer 𝘁𝗮𝗶𝗷𝘂𝘁𝘀𝘂 nível 𝟬𝟱. Indisponível para quem possui clã.`
    },
    'REAC': {
        nome: '𝗥𝗲𝗮𝗰̧𝗮̃𝗼 𝗘𝘅𝘁𝗿𝗮𝘃𝗮𝗴𝗮𝗻𝘁𝗲',
        info: `característica inspirada em 𝗠𝗶𝗻𝗮𝘁𝗼. Usá-lo como base para suas ações.`
    },
    'TASP': {
        nome: '𝗧𝗮𝗻𝘀𝗮𝗸𝘂𝗷𝘂𝘁𝘀𝘂 𝗽𝗮𝘀𝘀𝗶𝘃𝗼',
        info: `permite usar 𝘁𝗮𝗻𝘀𝗮𝗸𝘂𝗷𝘂𝘁𝘀𝘂 na ausência de 𝘀𝗲𝗹𝗼 𝗺𝗮𝗻𝘂𝗮𝗹.

٬ Requer 𝘁𝗮𝗻𝘀𝗮𝗸𝘂𝗷𝘂𝘁𝘀𝘂 nível 𝟬𝟱.`
    },
    'DUMA': {
        nome: '𝗗𝘂𝗽𝗹𝗮 𝗠𝗮𝗲𝘀𝘁𝗿𝗶𝗮',
        info: `característica que viabiliza a obtenção de uma 𝗺𝗮𝗲𝘀𝘁𝗿𝗶𝗮 secundária.`
    },
    'CCHA': {
        nome: '𝗖𝗼𝗻𝘁𝗿𝗼𝗹𝗲 𝗱𝗲 𝗖𝗵𝗮𝗸𝗿𝗮',
        info: `inspirada em 𝗜𝘁𝗮𝗰𝗵𝗶, reduz o gasto de 𝗰𝗵𝗮𝗸𝗿𝗮 para realizar técnicas.

٬ 𝗖𝗵𝗮𝗸𝗿𝗮 𝗚𝗮𝘀𝘁𝗼: 𝗗: 𝟢𝟣, 𝗖: 𝟢𝟤, 𝗕: 𝟢𝟥, 𝗔: 𝟢𝟧, 𝗦: 𝟣𝟢.
٬ Requer 𝗻𝗶𝗻𝗷𝘂𝘁𝘀𝘂 nível 𝟬𝟱.`
    },
    'QELE': {
        nome: '𝗤𝘂𝗮𝗿𝘁𝗼 𝗘𝗹𝗲𝗺𝗲𝗻𝘁𝗼',
        info: `característica que viabiliza um 𝗲𝗹𝗲𝗺𝗲𝗻𝘁𝗼 adicional para o personagem.`
    },
    'CHMO': {
        nome: '𝗖𝗵𝗮𝗸𝗿𝗮 𝗠𝗼𝗻𝘀𝘁𝗿𝘂𝗼𝘀𝗼',
        info: `inspirada em 𝗠𝗮𝗱𝗮𝗿𝗮, amplia o potencial e alcance das técnicas do usuário.`
    },
    'REDE': {
        nome: '𝗥𝗲𝘀𝗲𝗿𝘃𝗮 𝗗𝗲𝘀𝗰𝗼𝗺𝘂𝗻𝗮𝗹',
        info: `expande consideravelmente as reservas de 𝗰𝗵𝗮𝗸𝗿𝗮 do usuário.

٬ +𝟳𝟱 𝖼𝗁𝖺𝗄𝗋𝖺 𝗉𝗈𝗂𝗇𝗍'𝗌.`
    }
};

// Dicionário de Invocações
const LISTA_INVOCACOES = {
    'MONT': { nome: 'Monte', max: 5, tipo: 'contrato', info: 'Gamabunta, Gamaken e Gamahiro — sem contratante. Gasto proporcional a 85 CP. Afiliação com Konohagakure.' },
    'KATS': { nome: 'Shikkotsurin', max: 5, tipo: 'contrato', info: 'Katsuyu — sem contratante. Gasto proporcional a 85 CP. Afiliação com Konohagakure.' },
    'YUCH': { nome: 'Caverna Yuchido', max: 5, tipo: 'contrato', info: 'Manda, Garaga e Aoda — sem contratante. Gasto proporcional a 85 CP.' },
    'NKEN': { nome: 'Ninken', max: 1, tipo: 'exclusiva', info: 'Cães ninja. Apenas clã Hatake; livre acesso após graduação como chūnin.' },
    'NNEK': { nome: 'Ninneko', max: 4, tipo: 'normal4', info: 'Gatos ninja. Sem restrição de clã ou aldeia; Nekomata equivale a porte médio.' },
    'ENMA': { nome: 'Enkō: Enma', max: 1, tipo: 'exclusiva', info: 'Invocação de médio porte. Apenas clã Sarutobi, taichō. Chūnin do clã invoca Enra.' },
    'NKAM': { nome: 'Ninkame', max: 1, tipo: 'exclusiva', info: 'Invocação de médio porte. Apenas especialistas em taijutsu. Afiliação com Konohagakure.' },
    'OHAM': { nome: 'Ōhamaguri', max: 1, tipo: 'exclusiva', info: 'Invocação de grande porte. Afiliação com Kirigakure. Apenas um taichō pode invocar.' },
    'KARA': { nome: 'Karasu', max: 4, tipo: 'normal4', info: 'Corvos. Sem restrição de aldeia ou clã; gasto proporcional por enxurrada ou corvo individual.' },
    'IBUS': { nome: 'Ibuse', max: 1, tipo: 'exclusiva', info: 'Salamandra de grande porte. Requer Tokubetsu; inviável para habitantes de grandes potências.' },
    'KAMA': { nome: 'Kamatari', max: 1, tipo: 'exclusiva', info: 'Invocação de médio porte. Afiliação com Sunagakure; chūnin. Livre para usuários do Kyōdai Sensu.' },
    'BAKI': { nome: 'Baku', max: 1, tipo: 'exclusiva', info: 'Invocação de grande porte. Exclusiva do clã Shimura; requer graduação Tokubetsu.' },
    'KGUM': { nome: 'Kyōdaigumo', max: 1, tipo: 'exclusiva', info: 'Aranha de grande porte. Exclusiva ao Kumo Nenkin; acesso ao graduar como chūnin.' },
    'DOKI': { nome: 'Doki', max: 1, tipo: 'exclusiva', info: 'Invocações de médio porte. Exclusivo para usuário da Mateki; acesso como chūnin.' },
    'RASH': { nome: 'Rashōmon', max: 4, tipo: 'normal4', info: 'Portões de grande porte. Requer graduação chūnin; válido para qualquer aldeia ou clã.' },
    'TAKA': { nome: 'Taka', max: 4, tipo: 'normal4', info: 'Falcões. Tamanho varia conforme função; sem restrição de aldeia ou clã.' }
};

// Dicionário de Kinjutsus
// OBS: troquei Shiki Fūjin de SHIK para SHIF porque SHIK já é usado por Shikkotsumyaku em Kekkei Genkai.
const LISTA_KINJUTSUS = {
    'KIBN': { nome: 'Kibaku Nendo', info: '· Classificada por **destruição em massa**.\n· Obtenção **com exigência**.\n· Furto do pergaminho no **gabinete do tsuchi**.', max: 1 },
    'TAJU': { nome: 'Tajū Kage Bunshin', info: '· Classificada por **auto-destrutiva**.\n· Obtenção **com exigência**.\n· Furto do pergaminho no **gabinete do hokage**.', max: 1 },
    'JION': { nome: 'Jiongu', info: '· Classificada por **anti-natural**.\n· Obtenção **com exigência**.\n· Furto do pergaminho em **takigakure**.', max: 1 },
    'EDOT': { nome: 'Edo Tensei', info: '· Classificada por **anti-natural**.\n· Obtenção **com exigência**.\n· Talismã de **orochimaru** somente com **shirohebi**.\n· Furto do pergaminho no **gabinete do hokage**.', max: 2 },
    'HITO': { nome: 'Hitokugutsu no Gyō', info: '· Classificada por **anti-natural**.\n· Obtenção **com exigência**.\n· Furto do pergaminho no **gabinete do kazekage**.', max: 1 },
    'BYAK': { nome: 'Byakugō no In', info: '· Classificada por **anti-natural**.\n· Obtenção **sem exigência**.\n· Vaga primária será o **criador** da técnica.\n· Vaga secundária obtida a partir do **criador**.', max: 2 },
    'AKUT': { nome: 'Akuta', info: '· Classificada por **anti-natural**.\n· Obtenção **sem exigência**.', max: 1 },
    'KISH': { nome: 'Kishō Tensei', info: '· Classificada por **anti-natural**.\n· Obtenção **sem exigência**.', max: 1 },
    'SHIF': { nome: 'Shiki Fūjin', info: '· Classificada por **anti-natural**.\n· Obtenção **sem exigência**.\n· Requer conhecimento sobre **fuinjutsu uzumaki**.', max: 1 },
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
    if (LISTA_TRACOS[codigo]) return LISTA_TRACOS[codigo];
    if (LISTA_JUINJUTSUS[codigo]) return LISTA_JUINJUTSUS[codigo].nome;
    if (LISTA_CARACTERISTICAS[codigo]) return LISTA_CARACTERISTICAS[codigo].nome;
    if (LISTA_INVOCACOES[codigo]) return LISTA_INVOCACOES[codigo].nome;
    if (LISTA_KINJUTSUS[codigo]) return LISTA_KINJUTSUS[codigo].nome.toLowerCase();
    return codigo;
}

function identificarTipo(codigo) {
    return {
        isArte: !!LISTA_ARTES[codigo],
        isArma: !!LISTA_ARMAS[codigo],
        isHabilidade: !!LISTA_HABILIDADES[codigo],
        isBiju: !!LISTA_BIJUS[codigo],
        isKekkei: !!LISTA_KEKKEI[codigo],
        isProdigio: !!LISTA_PRODIGIOS[codigo],
        isUnica: !!LISTA_UNICAS[codigo],
        isTraco: !!LISTA_TRACOS[codigo],
        isJuinjutsu: !!LISTA_JUINJUTSUS[codigo],
        isCaracteristica: !!LISTA_CARACTERISTICAS[codigo],
        isInvocacao: !!LISTA_INVOCACOES[codigo],
        isKinjutsu: !!LISTA_KINJUTSUS[codigo]
    };
}

function codigoExiste(codigo) {
    const tipo = identificarTipo(codigo);
    return tipo.isArte || tipo.isArma || tipo.isHabilidade || tipo.isBiju || tipo.isKekkei || tipo.isProdigio || tipo.isUnica || tipo.isTraco || tipo.isJuinjutsu || tipo.isCaracteristica || tipo.isInvocacao || tipo.isKinjutsu;
}

function getLimiteSlots(codigo) {
    const tipo = identificarTipo(codigo);

    if (tipo.isArma || tipo.isBiju || tipo.isTraco || tipo.isJuinjutsu || codigo === 'PGEN' || (tipo.isUnica && codigo !== 'SSOS')) return 1;
    if (tipo.isKekkei) return LISTA_KEKKEI[codigo].max;
    if (tipo.isProdigio && codigo !== 'PGEN') return 5;
    if (tipo.isKinjutsu) return LISTA_KINJUTSUS[codigo].max;
    if (tipo.isInvocacao) return LISTA_INVOCACOES[codigo].max;
    return 3;
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
    const db = lerDB();
    const ocupantes = db.vagas[codigo] || [];
    const nomesPadrao = ['um', 'dois', 'três'];
    const slots = [];

    for (let i = 0; i < 3; i++) {
        slots.push(ocupantes[i] ? `<@${ocupantes[i]}>` : nomesPadrao[i]);
    }

    return `٬ ${nomeVaga}.\n𓏺 ${slots.join(', ')}.`;
}

function puxarSlotsEspeciais(codigo, nomeVaga, maxSlots = 5) {
    const db = lerDB();
    const ocupantes = db.vagas[codigo] || [];
    const nomesPadrao = ['Um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
    const slots = [];

    for (let i = 0; i < maxSlots; i++) {
        slots.push(ocupantes[i] ? `<@${ocupantes[i]}>` : (nomesPadrao[i] || 'vaga'));
    }

    return `٬ ${nomeVaga}.\n𓏺 ${slots.join(', ')}.`;
}

function puxarSlotsArma(codigo) {
    const arma = LISTA_ARMAS[codigo];
    const db = lerDB();
    const ocupantes = db.vagas[codigo] || [];
    return `٬ ${arma.nome}  \`[ CÓDIGO: ${codigo} ]\`\n${arma.info}\n𓏺 Vaga: ${ocupantes[0] ? `<@${ocupantes[0]}>` : 'disponível'}.`;
}

function puxarSlotsBiju(codigo) {
    const biju = LISTA_BIJUS[codigo];
    const db = lerDB();
    const ocupantes = db.vagas[codigo] || [];
    return `٬ ${biju}  \`[ CÓDIGO: ${codigo} ]\`\n𓏺 Hospedeiro: ${ocupantes[0] ? `<@${ocupantes[0]}>` : 'disponível'}.`;
}

function puxarSlotsKinjutsu(codigo) {
    const kin = LISTA_KINJUTSUS[codigo];
    const db = lerDB();
    const ocupantes = db.vagas[codigo] || [];
    const slots = [];

    for (let i = 0; i < kin.max; i++) {
        slots.push(ocupantes[i] ? `<@${ocupantes[i]}>` : 'vago');
    }

    return `• \`[ CÓDIGO: ${codigo} ]\`\n٬ ${kin.nome.toLowerCase()} · ${slots.join(' & ')}.\n${kin.info}`;
}

function puxarSlotsKekkei(codigo) {
    const kekkei = LISTA_KEKKEI[codigo];
    const db = lerDB();
    const ocupantes = db.vagas[codigo] || [];

    const nomesPadrao = {
        BAKU: ['um', 'dois', 'três'],
        KOTO: ['um', 'dois', 'três'],
        JITO: ['um', 'dois', 'três'],
        SHAK: ['um', 'dois', 'três'],
        TAIT: ['um', 'dois', 'três'],
        MEIT: ['um', 'dois', 'três'],
        SHOT: ['um', 'dois', 'três'],
        JINT: ['um', 'dois', 'três'],
        SAKI: ['uma vaga'],
        SATE: ['vaga', 'vaga'],
        MOKU: ['uma vaga'],
        RANT: ['um', 'dois', 'três'],
        SOMA: ['um', 'dois'],
        YOTO: ['um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'],
        FUTT: ['um', 'dois', 'três'],
        JINK: ['vaga sem clã', 'vaga kamizuru']
    };

    if (kekkei.max === Infinity) {
        const lista = ocupantes.length > 0
            ? ocupantes.map(id => `<@${id}>`).join(', ')
            : 'ilimitado';

        return `• \`[ CÓDIGO: ${codigo} ]\`\n٬ ${kekkei.nome}.\n𓏺 ${lista}.`;
    }

    const slots = [];
    const padrao = nomesPadrao[codigo] || ['um', 'dois', 'três'];

    for (let i = 0; i < kekkei.max; i++) {
        slots.push(ocupantes[i] ? `<@${ocupantes[i]}>` : (padrao[i] || 'vaga'));
    }

    return `• \`[ CÓDIGO: ${codigo} ]\`\n٬ ${kekkei.nome}.\n𓏺 ${slots.join(', ')}.`;
}

function puxarSlotsCaracteristica(codigo) {
    const caracteristica = LISTA_CARACTERISTICAS[codigo];
    const db = lerDB();
    const ocupantes = db.vagas[codigo] || [];
    const nomesPadrao = ['𝗎𝗆', '𝖽𝗈𝗂𝗌', '𝗍𝗋𝖾̂𝗌'];
    const slots = [];

    for (let i = 0; i < 3; i++) {
        slots.push(ocupantes[i] ? `<@${ocupantes[i]}>` : nomesPadrao[i]);
    }

    return `𓏺 \`[ CÓDIGO: ${codigo} ]\` ${caracteristica.nome}, ${caracteristica.info}
٬ ${slots.join(', ')}.`;
}

function puxarSlotExclusivo(codigo, nomeVaga, info = '') {
    const db = lerDB();
    const ocupantes = db.vagas[codigo] || [];
    const linhaInfo = info ? `\n${info}` : '';

    return `▬ \`[ CÓDIGO: ${codigo} ]\` ${nomeVaga}.\n𓏺 ${ocupantes[0] ? `<@${ocupantes[0]}>` : '𝗏𝖺𝗀𝖺 𝖾𝗑𝖼𝗅𝗎𝗌𝗂𝗏𝖺'}.${linhaInfo}`;
}

function isCodigoApenasAdm(codigo) {
    return !!LISTA_TRACOS[codigo] || !!LISTA_JUINJUTSUS[codigo];
}

function membroEhAdmin(member) {
    return !!member?.permissions?.has(PermissionFlagsBits.Administrator);
}

function puxarSlotsInvocacao(codigo) {
    const invocacao = LISTA_INVOCACOES[codigo];
    const db = lerDB();
    const ocupantes = db.vagas[codigo] || [];

    if (invocacao.tipo === 'contrato') {
        const dono = ocupantes[0] ? `<@${ocupantes[0]}>` : 'dono de pergaminho';
        const nomes = ['um', 'dois', 'três', 'quatro'];
        const assinantes = [];

        for (let i = 1; i < 5; i++) {
            assinantes.push(ocupantes[i] ? `<@${ocupantes[i]}>` : nomes[i - 1]);
        }

        return `▬ \`[ CÓDIGO: ${codigo} ]\` ${invocacao.nome}.\n𓏺 ${invocacao.info}\n٬ Dono: ${dono}.\n٬ Assinantes: ${assinantes.join(', ')}.`;
    }

    const nomesPadrao = invocacao.max === 4
        ? ['um', 'dois', 'três', 'quatro']
        : ['vaga exclusiva'];
    const slots = [];

    for (let i = 0; i < invocacao.max; i++) {
        slots.push(ocupantes[i] ? `<@${ocupantes[i]}>` : (nomesPadrao[i] || 'vaga'));
    }

    return `▬ \`[ CÓDIGO: ${codigo} ]\` ${invocacao.nome}.\n↳ ${invocacao.info}\n٬ ${slots.join(', ')}.`;
}

function construirPainelVagas(pagina) {
    const embed = new EmbedBuilder().setColor('#2b2d31');
    const botaoVoltar = new ButtonBuilder().setCustomId('voltar').setLabel('⬅️ Anterior').setStyle(ButtonStyle.Secondary).setDisabled(pagina === 1);
    const botaoProximo = new ButtonBuilder().setCustomId('proximo').setLabel('Próxima ➡️').setStyle(ButtonStyle.Primary).setDisabled(pagina === 13);

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
        embed.setTitle('📜 Listagem — 【 HABILIDADES ÚNICAS 】').setDescription(Object.keys(LISTA_UNICAS).map(cod => {
            const maxSlots = cod === 'SSOS' ? 3 : 1;
            return `• \`[ CÓDIGO: ${cod} ]\`\n${puxarSlotsEspeciais(cod, LISTA_UNICAS[cod], maxSlots)}`;
        }).join('\n\n'));
    }
    else if (pagina === 6) {
        embed
            .setTitle('📜 Listagem — 【 TRAÇOS 】')
            .setDescription('*Inviável a obtenção destas vagas através da pretensão.*\n\n' + Object.keys(LISTA_TRACOS).map(cod => puxarSlotExclusivo(cod, LISTA_TRACOS[cod])).join('\n\n'));
    }
    else if (pagina === 7) {
        embed.setTitle('📜 Listagem — 【 PRODÍGIOS 】').setDescription(Object.keys(LISTA_PRODIGIOS).map(cod => {
            const maxSlots = cod === 'PGEN' ? 1 : 5;
            return `• \`[ CÓDIGO: ${cod} ]\`\n${puxarSlotsEspeciais(cod, LISTA_PRODIGIOS[cod], maxSlots)}`;
        }).join('\n\n'));
    }
    else if (pagina === 8) {
        embed.setTitle('📜 Listagem — 【 BIJUS 】').setDescription(Object.keys(LISTA_BIJUS).map(cod => puxarSlotsBiju(cod)).join('\n\n'));
    }
    else if (pagina === 9) {
        embed.setTitle('📜 Listagem — 【 KEKKEI GENKAI 】').setDescription(Object.keys(LISTA_KEKKEI).map(cod => puxarSlotsKekkei(cod)).join('\n\n'));
    }
    else if (pagina === 10) {
        embed.setTitle('📜 Listagem — 【 KINJUTSUS 】').setDescription(Object.keys(LISTA_KINJUTSUS).map(cod => puxarSlotsKinjutsu(cod)).join('\n\n'));
    }
    else if (pagina === 11) {
        embed
            .setTitle('📜 Listagem — 【 JUINJUTSUS 】')
            .setDescription('*Inviável a obtenção destas vagas através da pretensão.*\n\n' + Object.keys(LISTA_JUINJUTSUS).map(cod => puxarSlotExclusivo(cod, LISTA_JUINJUTSUS[cod].nome, LISTA_JUINJUTSUS[cod].info)).join('\n\n'));
    }

    else if (pagina === 12) {
        embed
            .setTitle('📜 Listagem — 【 CARACTERÍSTICAS 】')
            .setDescription(Object.keys(LISTA_CARACTERISTICAS).map(cod => puxarSlotsCaracteristica(cod)).join('\n\n'));
    }

    else if (pagina === 13) {
        embed
            .setTitle('📜 Listagem — 【 INVOCAÇÕES 】')
            .setDescription(Object.keys(LISTA_INVOCACOES).map(cod => puxarSlotsInvocacao(cod)).join('\n\n'));
    }

    embed.setFooter({ text: `Página ${pagina}/13` });

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
            { label: '10. Kinjutsus', value: '10' },
            { label: '11. Juinjutsus', value: '11' },
            { label: '12. Características', value: '12' },
            { label: '13. Invocações', value: '13' }
        );

    return {
        embeds: [embed],
        components: [
            new ActionRowBuilder().addComponents(botaoVoltar, botaoProximo),
            new ActionRowBuilder().addComponents(menu)
        ]
    };
}

async function atualizarPaineisVagas() {
    for (const [messageId, painel] of paineisVagasAtivos.entries()) {
        try {
            const canal = await client.channels.fetch(painel.channelId);
            const mensagem = await canal.messages.fetch(messageId);
            await mensagem.edit(construirPainelVagas(painel.pagina));
        } catch (error) {
            paineisVagasAtivos.delete(messageId);
        }
    }
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
    const tipo = identificarTipo(codigo);

    if (codigoExiste(codigo)) {
        const nomeExibicao = getNomeVaga(codigo);

        if (isCodigoApenasAdm(codigo) && !membroEhAdmin(message.member)) {
            message.delete().catch(() => {});
            return message.channel.send(`🚫 <@${message.author.id}>, essa vaga é exclusiva e só pode ser atribuída por ADM.`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
        }
        
        if (!db.vagas[codigo]) db.vagas[codigo] = [];
        if (!db.usuarios[message.author.id]) db.usuarios[message.author.id] = [];

        if (db.vagas[codigo].includes(message.author.id)) {
            message.delete().catch(() => {});
            return message.channel.send(`⚠️ <@${message.author.id}>, você já possui a vaga **${nomeExibicao}**!`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 4000));
        }

        const limiteSlots = getLimiteSlots(codigo);

        if (limiteSlots !== Infinity && db.vagas[codigo].length >= limiteSlots) {
            message.delete().catch(() => {});
            return message.channel.send(`❌ <@${message.author.id}>, desculpe, os slots para **${nomeExibicao}** já estão cheios!`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 4000));
        }

        if (tipo.isArte) {
            const minhasVagas = db.usuarios[message.author.id];
            const qtdExoticas = minhasVagas.filter(v => LISTA_ARTES[v]).length;
            const possuiTraco = minhasVagas.some(v => LISTA_TRACOS[v]);
            if ((possuiTraco && qtdExoticas >= 2) || (!possuiTraco && qtdExoticas >= 3)) {
                message.delete().catch(() => {});
                return message.channel.send(`🚫 <@${message.author.id}>, limite atingido pelas regras de exóticas do RP.`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
            }
        }

        db.vagas[codigo].push(message.author.id);
        db.usuarios[message.author.id].push(codigo);
        salvarDB(db);
        await atualizarPaineisVagas();

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

        if (!codigoExiste(codigo)) {
            return interaction.reply({ content: '❌ Esse código de vaga não existe!', ephemeral: true });
        }

        const db = lerDB();
        if (!db.vagas[codigo]) db.vagas[codigo] = [];
        if (!db.usuarios[miembro.id]) db.usuarios[miembro.id] = [];

        if (db.vagas[codigo].includes(miembro.id)) {
            return interaction.reply({ content: `⚠️ O jogador <@${miembro.id}> já possui essa vaga.`, ephemeral: true });
        }

        const limiteSlots = getLimiteSlots(codigo);

        if (limiteSlots !== Infinity && db.vagas[codigo].length >= limiteSlots) {
            return interaction.reply({ content: '❌ Esta vaga está sem slots livres!', ephemeral: true });
        }

        db.vagas[codigo].push(miembro.id);
        db.usuarios[miembro.id].push(codigo);
        salvarDB(db);
        await atualizarPaineisVagas();

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
        await atualizarPaineisVagas();

        const nomeExibicao = getNomeVaga(codigo);
        return interaction.reply({ content: `🗑️ Vaga **${nomeExibicao}** removida com sucesso de <@${miembro.id}>.` });
    }

    if (commandName === 'minhasvagas') {
        const db = lerDB();
        const minhasVagas = db.usuarios[interaction.user.id] || [];

        if (minhasVagas.length === 0) {
            return interaction.reply({ content: '📭 Você não possui nenhuma vaga registrada.', ephemeral: true });
        }

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
                const vagaSelecionada = i.values[0];
                const dadosAtuais = lerDB();

                if (dadosAtuais.usuarios[interaction.user.id]) {
                    dadosAtuais.usuarios[interaction.user.id] = dadosAtuais.usuarios[interaction.user.id].filter(v => v !== vagaSelecionada);
                }

                if (dadosAtuais.vagas[vagaSelecionada]) {
                    dadosAtuais.vagas[vagaSelecionada] = dadosAtuais.vagas[vagaSelecionada].filter(id => id !== interaction.user.id);
                }

                salvarDB(dadosAtuais);
                await atualizarPaineisVagas();
                await i.update({ content: `✅ Você abdicou da vaga com sucesso!`, embeds: [], components: [] });
            }
        });
        return;
    }

    if (commandName === 'vagas') {
        let paginaAtual = 1;

        const painel = await interaction.reply({ ...construirPainelVagas(paginaAtual), fetchReply: true });
        paineisVagasAtivos.set(painel.id, {
            channelId: painel.channel.id,
            pagina: paginaAtual
        });

        const collector = painel.createMessageComponentCollector({ filter: (i) => i.user.id === interaction.user.id, time: 180000 });

        collector.on('collect', async (i) => {
            if (i.customId === 'proximo') paginaAtual++;
            else if (i.customId === 'voltar') paginaAtual--;
            else if (i.customId === 'menu_vagas_nav') paginaAtual = parseInt(i.values[0]);

            paineisVagasAtivos.set(painel.id, {
                channelId: painel.channel.id,
                pagina: paginaAtual
            });

            await i.update(construirPainelVagas(paginaAtual));
        });

        collector.on('end', () => {
            paineisVagasAtivos.delete(painel.id);
            painel.edit({ components: [] }).catch(() => {});
        });
    }
});

client.login(process.env.TOKEN);
