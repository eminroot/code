import type { Line } from './types';

// What people say in each scene, timed to the animation. Shown as speech bubbles.
const L = (t: number, who: Line['who'], en: string, local?: string, roman?: string, dur?: number): Line => ({ t, who, en, local, roman, dur });
const Y = 'you' as const, O = 'local' as const;

export const LINES: Record<string, { do?: Line[]; avoid?: Line[] }> = {
  // Japan
  'jp-greet': {
    do: [L(0.2, O, 'Nice to meet you', 'はじめまして', 'Hajimemashite'), L(2.6, Y, 'Pleased to meet you', 'よろしくお願いします', 'Yoroshiku onegaishimasu'), L(5.0, O, 'Welcome to Japan', '日本へようこそ', 'Nihon e yōkoso')],
    avoid: [L(0.2, Y, 'Hi! Nice to meet you!'), L(2.4, O, 'Ah…', 'あ…', 'A…')],
  },
  'jp-card': {
    do: [L(0.3, O, 'My name is Tanaka', '田中と申します', 'Tanaka to mōshimasu'), L(2.5, Y, 'Thank you, I receive it', '頂戴します', 'Chōdai shimasu'), L(5.2, Y, 'I look forward to working with you', 'よろしくお願いします', 'Yoroshiku onegaishimasu')],
    avoid: [L(0.3, Y, 'Here’s my card.'), L(3.6, O, 'Thank you…', 'ありがとうございます…', 'Arigatō gozaimasu…')],
  },
  'jp-point': {
    do: [L(0.4, Y, 'The station is that way', '駅はあちらです', 'Eki wa achira desu'), L(2.4, O, 'Thank you very much', 'ありがとうございます', 'Arigatō gozaimasu')],
    avoid: [L(0.4, Y, 'You! Over there!'), L(2.2, O, 'Eh?', 'えっ？', 'E?')],
  },
  'jp-beckon': {
    do: [L(0.3, Y, 'Excuse me!', 'すみません！', 'Sumimasen!'), L(2.4, O, 'Coming right away', 'はい、ただいま', 'Hai, tadaima')],
    avoid: [L(0.3, Y, 'Hey, come here!'), L(2.4, O, '…')],
  },
  'jp-train': {
    do: [L(1.2, Y, 'Texting: Running 5 min late, sorry!', undefined, undefined, 3)],
    avoid: [L(0.6, Y, 'HELLO? YEAH, I’M ON THE TRAIN!', undefined, undefined, 2.6), L(3.8, O, '…')],
  },
  'jp-gift': {
    do: [L(0.3, Y, 'It’s only something small', 'つまらないものですが', 'Tsumaranai mono desu ga'), L(2.8, O, 'Oh, you shouldn’t have!', 'わざわざありがとうございます', 'Wazawaza arigatō gozaimasu')],
  },

  // South Korea
  'kr-greet': { do: [L(0.2, Y, 'Hello', '안녕하세요', 'Annyeonghaseyo'), L(2.0, O, 'Nice to meet you', '반갑습니다', 'Bangapseumnida'), L(4.2, Y, 'I look forward to working with you', '잘 부탁드립니다', 'Jal butakdeurimnida')] },
  'kr-thanks': { do: [L(0.3, O, 'Thank you', '감사합니다', 'Gamsahamnida'), L(1.6, Y, 'Thank you!', '감사합니다!', 'Gamsahamnida!'), L(4.6, O, 'Goodbye, go well', '안녕히 가세요', 'Annyeonghi gaseyo')] },
  'kr-gift': {
    do: [L(0.3, Y, 'It’s a small gift', '작은 선물이에요', 'Jageun seonmurieyo'), L(2.9, O, 'Thank you so much!', '정말 감사합니다!', 'Jeongmal gamsahamnida!')],
    avoid: [L(0.3, Y, 'Here you go.'), L(2.6, O, '…')],
  },
  'kr-beckon': {
    do: [L(0.3, Y, 'Excuse me!', '저기요!', 'Jeogiyo!'), L(2.4, O, 'Yes!', '네!', 'Ne!')],
    avoid: [L(0.3, Y, 'Hey, come here!'), L(2.4, O, '…')],
  },

  // China
  'cn-greet': { do: [L(0.2, Y, 'Hello', '你好', 'Nǐ hǎo'), L(1.8, O, 'Welcome, welcome', '欢迎欢迎', 'Huānyíng huānyíng'), L(4.0, Y, 'Very pleased to meet you', '很高兴认识您', 'Hěn gāoxìng rènshi nín')] },
  'cn-card': {
    do: [L(0.3, O, 'This is my card', '这是我的名片', 'Zhè shì wǒ de míngpiàn'), L(2.6, Y, 'Thank you, Manager Wang', '谢谢，王经理', 'Xièxie, Wáng jīnglǐ')],
    avoid: [L(0.3, Y, 'Here, my card.'), L(3.6, O, 'Oh… thanks', '哦…谢谢', 'Ò… xièxie')],
  },
  'cn-gift': {
    do: [L(0.3, Y, 'A small token', '一点小心意', 'Yīdiǎn xiǎo xīnyì'), L(1.7, O, 'Oh, you shouldn’t!', '不用不用！', 'Bùyòng bùyòng!'), L(3.6, Y, 'Please accept it', '请收下', 'Qǐng shōuxià'), L(5.6, O, 'Thank you', '谢谢你', 'Xièxie nǐ')],
    avoid: [L(0.3, Y, 'A small token', '一点小心意', 'Yīdiǎn xiǎo xīnyì'), L(3.4, O, 'Thanks…', '谢谢…', 'Xièxie…')],
  },
  'cn-point': {
    do: [L(0.4, Y, 'This way, please', '请这边走', 'Qǐng zhèbiān zǒu'), L(2.4, O, 'Thank you', '谢谢', 'Xièxie')],
    avoid: [L(0.4, Y, 'You! Over there!'), L(2.2, O, '…')],
  },

  // Thailand
  'th-wai': {
    do: [L(0.3, Y, 'Hello', 'สวัสดี', 'Sawasdee'), L(1.8, O, 'Hello', 'สวัสดีค่ะ', 'Sawasdee kha'), L(4.6, O, 'Welcome', 'ยินดีต้อนรับค่ะ', 'Yindee ton rap kha')],
    avoid: [L(0.3, Y, 'Hi! Nice to meet you!'), L(2.2, O, 'Hello', 'สวัสดีค่ะ', 'Sawasdee kha')],
  },
  'th-head': {
    do: [L(0.5, Y, 'Thank you so much', 'ขอบคุณมาก', 'Khop khun mak'), L(2.0, O, 'You’re welcome', 'ไม่เป็นไรครับ', 'Mai pen rai krap')],
    avoid: [L(0.4, Y, 'Good job, buddy!'), L(2.8, O, '…')],
  },
  'th-point': { do: [L(0.4, Y, 'That way', 'ไปทางนั้น', 'Pai thang nan'), L(2.4, O, 'Thank you', 'ขอบคุณค่ะ', 'Khop khun kha')], avoid: [L(0.4, Y, 'You! There!')] },
  'th-beckon': {
    do: [L(0.3, Y, 'Excuse me!', 'น้องครับ', 'Nong krap'), L(2.4, O, 'Yes?', 'ครับ', 'Krap')],
    avoid: [L(0.3, Y, 'Hey, come here!'), L(2.4, O, '…')],
  },

  // India
  'in-namaste': {
    do: [L(0.3, Y, 'Hello', 'नमस्ते', 'Namaste'), L(1.6, O, 'Hello, welcome', 'नमस्ते, स्वागत है', 'Namaste, swagat hai'), L(4.2, Y, 'Thank you', 'धन्यवाद', 'Dhanyavaad')],
    avoid: [L(0.3, Y, 'Hi, nice to meet you!'), L(2.2, O, 'Hello', 'नमस्ते', 'Namaste')],
  },
  'in-hand': {
    do: [L(0.3, Y, 'Here you go'), L(3.6, O, 'Thank you', 'धन्यवाद', 'Dhanyavaad')],
    avoid: [L(0.3, Y, 'Here.'), L(3.4, O, 'Right hand, please')],
  },
  'in-wobble': { do: [L(0.2, Y, 'Is the train on time?'), L(1.2, O, 'Yes, yes', 'हाँ, हाँ', 'Haan, haan')] },
  'in-point': { do: [L(0.4, Y, 'Is it that building?'), L(2.0, O, 'Yes', 'हाँ', 'Haan')], avoid: [L(0.4, Y, 'Hey, you!'), L(2.0, O, '…')] },

  // UAE
  'ae-greet': { do: [L(0.2, Y, 'Peace be upon you', 'السلام عليكم', 'As-salamu alaykum'), L(1.6, O, 'And upon you, peace', 'وعليكم السلام', 'Wa alaykum as-salam'), L(4.0, O, 'How are you?', 'كيف الحال؟', 'Kayf al-hal?'), L(5.6, Y, 'Fine, thank God', 'الحمد لله', 'Alhamdulillah')] },
  'ae-women': {
    do: [L(0.3, O, 'Welcome', 'أهلاً وسهلاً', 'Ahlan wa sahlan'), L(2.3, Y, 'Thank you', 'شكراً', 'Shukran')],
    avoid: [L(0.3, Y, 'Nice to meet you!'), L(2.2, O, 'Welcome', 'أهلاً', 'Ahlan')],
  },
  'ae-beckon': {
    do: [L(0.3, Y, 'Excuse me', 'لو سمحت', 'Law samaht'), L(2.4, O, 'Yes, please', 'تفضل', 'Tafaddal')],
    avoid: [L(0.3, Y, 'Hey, you!'), L(2.4, O, '…')],
  },
  'ae-photo': {
    do: [L(0.3, Y, 'May I take a photo?', 'ممكن صورة؟', 'Mumkin sura?'), L(1.5, O, 'Go ahead', 'تفضل', 'Tafaddal'), L(5.0, Y, 'Thank you', 'شكراً', 'Shukran')],
    avoid: [L(1.7, O, 'No, please', 'لا، لو سمحت', 'La, law samaht')],
  },
  'ae-hand': {
    do: [L(0.3, Y, 'Here you are', 'تفضل', 'Tafaddal'), L(3.6, O, 'Thank you', 'شكراً', 'Shukran')],
    avoid: [L(0.3, Y, 'Here.'), L(3.4, O, '…')],
  },

  // Turkey
  'tr-greet': { do: [L(0.1, Y, 'Hello!', 'Merhaba!'), L(3.3, O, 'Welcome!', 'Hoş geldin!'), L(4.6, Y, 'Glad to be here', 'Hoş bulduk')] },
  'tr-ok': {
    do: [L(0.3, Y, 'Very good!', 'Çok güzel!'), L(1.9, O, 'Enjoy your meal!', 'Afiyet olsun!')],
    avoid: [L(0.3, Y, 'Perfect!'), L(1.9, O, 'What?!', 'Ne?!')],
  },
  'tr-no': { do: [L(0.2, Y, 'Do you have ayran?', 'Ayran var mı?'), L(1.7, O, 'No, there isn’t (tsk)', 'Yok')] },
  'tr-tea': { do: [L(0.3, O, 'Please, will you have tea?', 'Buyrun, çay içer misiniz?'), L(2.8, Y, 'Thank you', 'Teşekkür ederim')] },

  // Azerbaijan
  'az-greet': { do: [L(0.2, Y, 'Hello!', 'Salam!'), L(1.6, O, 'Welcome!', 'Xoş gəlmisiniz!', 'Khosh galmisiniz!'), L(3.4, Y, 'How are you?', 'Necəsiniz?', 'Nechasiniz?'), L(5.0, O, 'Thanks, I’m well', 'Sağ olun, yaxşıyam', 'Sagh olun, yakhshiyam')] },
  'az-women': {
    do: [L(0.3, Y, 'Hello', 'Salam'), L(1.7, O, 'Welcome', 'Xoş gəlmisiniz', 'Khosh galmisiniz')],
    avoid: [L(0.3, Y, 'Nice to meet you!'), L(2.2, O, 'Hello', 'Salam')],
  },
  'az-tea': { do: [L(0.3, O, 'Please, have some tea!', 'Buyurun, çay için!', 'Buyurun, chay ichin!'), L(2.8, Y, 'Thank you', 'Sağ olun', 'Sagh olun')] },
  'az-point': { do: [L(0.4, Y, 'Is it that street?'), L(2.0, O, 'Yes', 'Bəli', 'Bali')], avoid: [L(0.4, Y, 'Hey, you!'), L(2.0, O, '…')] },

  // Georgia
  'ge-greet': { do: [L(0.1, Y, 'Hello!', 'გამარჯობა!', 'Gamarjoba!'), L(1.8, O, 'Hello to you!', 'გაგიმარჯოს!', 'Gagimarjos!')] },
  'ge-meet': { do: [L(0.2, Y, 'Hello', 'გამარჯობა', 'Gamarjoba'), L(1.8, O, 'Hello to you', 'გაგიმარჯოს', 'Gagimarjos'), L(4.0, O, 'Welcome', 'მოგესალმებით', 'Mogesalmebit')] },

  // France
  'fr-bise': { do: [L(0.1, Y, 'Hi!', 'Salut !'), L(3.0, O, 'How are you?', 'Ça va ?'), L(4.2, Y, 'I’m good!', 'Ça va bien !')] },
  'fr-meet': { do: [L(0.2, Y, 'Hello, sir', 'Bonjour, monsieur'), L(1.8, O, 'Pleased to meet you', 'Enchanté'), L(4.0, Y, 'Pleased to meet you', 'Enchanté(e)')] },
  'fr-shop': { do: [L(0.3, Y, 'Hello, madam!', 'Bonjour, madame !'), L(1.6, O, 'Hello! Can I help you?', 'Bonjour ! Je peux vous aider ?'), L(3.6, Y, 'Just looking, thank you', 'Je regarde, merci')] },

  // Italy
  'it-talk': { do: [L(0.6, O, 'Come on!', 'Ma dai!'), L(3.4, O, 'Football is a religion here!', 'Il calcio è una religione!'), L(6.2, Y, 'Really?', 'Davvero?')] },
  'it-bise': { do: [L(0.1, Y, 'Hi!', 'Ciao!'), L(3.0, O, 'How are you?', 'Come stai?'), L(4.2, Y, 'Great!', 'Benissimo!')] },
  'it-meet': { do: [L(0.2, Y, 'Good morning!', 'Buongiorno!'), L(1.8, O, 'Pleased to meet you', 'Piacere'), L(4.0, Y, 'The pleasure is mine', 'Piacere mio')] },

  // Germany
  'de-meet': {
    do: [L(0.2, Y, 'Good day!', 'Guten Tag!'), L(1.8, O, 'Pleased to meet you. Schmidt.', 'Freut mich. Schmidt.'), L(4.0, Y, 'Pleased to meet you too', 'Freut mich auch')],
    avoid: [L(0.3, Y, 'Hi…'), L(3.2, O, 'Hm.')],
  },
  'de-wave': { do: [L(0.3, Y, 'Hi!', 'Hallo!'), L(1.4, O, 'Hi! See you in a bit!', 'Hallo! Bis gleich!')] },

  // United Kingdom
  'gb-meet': { do: [L(0.2, Y, 'Hello, nice to meet you.'), L(1.8, O, 'Lovely to meet you.'), L(4.0, O, 'Good journey?')] },
  'gb-v': {
    do: [L(0.3, Y, 'Two pints, please!'), L(2.0, O, 'Coming right up.')],
    avoid: [L(0.3, Y, 'Two pints, please!'), L(2.0, O, 'Oi! Watch it, mate.')],
  },

  // United States
  'us-meet': { do: [L(0.2, Y, 'Hi, I’m {name}.'), L(1.8, O, 'Great to meet you, {name}! I’m Sam.'), L(4.2, Y, 'Nice to meet you, Sam.')] },
  'us-wave': { do: [L(0.3, Y, 'Hey!'), L(1.4, O, 'Hey! How’s it going?')] },

  // Brazil
  'br-greet': { do: [L(0.1, Y, 'Hi, all good?', 'Oi, tudo bem?'), L(1.6, O, 'All good! And you?', 'Tudo bom! E você?')] },
  'br-ok': {
    do: [L(0.3, Y, 'Thanks!', 'Valeu!'), L(1.9, O, 'Cool!', 'Beleza!')],
    avoid: [L(0.3, Y, 'Perfect!'), L(1.9, O, 'Whoa!', 'Opa!')],
  },
  'br-talk': { do: [L(0.4, O, 'You have to see the beach!', 'Você precisa conhecer a praia!'), L(3.6, Y, 'Really? Where?', 'Sério? Onde?'), L(6.0, O, 'I’ll take you!', 'Te levo lá!')] },
};
