import type { Talk } from './types';

// What to talk about. {home} is replaced with the traveller's home country.
export const TALK: Record<string, Talk> = {
  JP: {
    starters: [
      { say: 'What do you recommend around here?', local: 'このへんで おすすめは ありますか？', roman: 'Kono hen de osusume wa arimasu ka?', why: 'Asking for a recommendation lets people help you, the most natural opener in Japan.' },
      { say: 'Lovely weather today, isn’t it?', local: 'いい天気ですね', roman: 'Ii tenki desu ne', why: 'Weather and seasons are classic small talk. The ne at the end invites a friendly yes.' },
      { say: 'How do you eat this?', local: 'これはどうやって食べますか？', roman: 'Kore wa dō yatte tabemasu ka?', why: 'Curiosity about food shows respect for the cook and starts real conversations.' },
      { say: 'Do you have a favourite place in this city?', why: 'People are proud of their neighbourhoods and love sharing hidden spots.' },
      { say: 'In {home}, we have something similar.', why: 'Sharing a little about home turns a question into an exchange.' },
    ],
    topics: ['Food and local dishes', 'The seasons', 'Baseball and football', 'Anime and games', 'Places to visit in Japan', 'Your home country'],
    avoid: [
      { topic: 'War history and politics', why: 'History with neighbouring countries is sensitive. Let your host bring it up.' },
      { topic: 'Comparing Japan with China or Korea', why: 'It can feel dismissive. Talk about Japan on its own terms.' },
      { topic: 'Salary and marriage, early on', why: 'Personal questions come later, once you know each other.' },
    ],
    asked: [
      { q: 'Can you use chopsticks?', a: 'Yes, I practised! This is delicious.', note: 'It is friendly curiosity, not a test.' },
      { q: 'Do you like Japanese food?', a: 'Very much. What should I try next?' },
      { q: 'How long are you staying?', a: 'A couple of weeks. I want to see as much as I can.' },
    ],
    compliments: [
      { say: 'It was delicious, thank you.', local: 'ごちそうさまでした', roman: 'Gochisōsama deshita' },
      { say: 'Everything here is so clean and calm.' },
      { say: 'Thank you for your kindness.', local: 'ご親切にありがとうございます', roman: 'Go-shinsetsu ni arigatō gozaimasu' },
    ],
  },
  KR: {
    starters: [
      { say: 'Have you eaten?', local: '밥 먹었어요?', roman: 'Bap meogeosseoyo?', why: 'A classic Korean way of asking how someone is. Food is how people show care.' },
      { say: 'Is there a great place to eat nearby?', local: '이 근처에 맛집 있어요?', roman: 'I geuncheo-e matjip isseoyo?', why: 'Matjip means a great restaurant. Everyone has one to recommend.' },
      { say: 'What are you watching at the moment?', why: 'K-dramas and films are a proud, easy topic. You will get a list.' },
      { say: 'What is your favourite Korean dish?', why: 'Food debates are friendly and endless.' },
      { say: 'This is my first time in Korea.', local: '한국은 처음이에요', roman: 'Hanguk-eun cheoeumieyo', why: 'People love to help a first-timer.' },
    ],
    topics: ['Food and restaurants', 'K-dramas, music and films', 'Football and baseball', 'Cafés', 'Travel within Korea', 'Your home country'],
    avoid: [
      { topic: 'North Korea and politics', why: 'Families are affected by the division. Let your host lead.' },
      { topic: 'Japan and wartime history', why: 'It is still painful for many people.' },
      { topic: 'Comparing Korea with China or Japan', why: 'Korea has its own identity and people notice.' },
    ],
    asked: [
      { q: 'How old are you?', a: 'I am 24. And you?', note: 'Age sets how people speak to each other. It is not rude.' },
      { q: 'Can you eat spicy food?', a: 'A little! I want to try kimchi stew.' },
      { q: 'Do you have a boyfriend or girlfriend?', a: 'Not at the moment!', note: 'Personal questions come early here and are friendly.' },
    ],
    compliments: [
      { say: 'This is delicious!', local: '맛있어요!', roman: 'Masisseoyo!' },
      { say: 'Seoul feels so safe at night.' },
      { say: 'Thank you for taking care of me.', local: '챙겨 주셔서 감사합니다', roman: 'Chaenggyeo jusyeoseo gamsahamnida' },
    ],
  },
  CN: {
    starters: [
      { say: 'Have you eaten yet?', local: '你吃饭了吗？', roman: 'Nǐ chīfàn le ma?', why: 'A warm, everyday hello. Answer yes or not yet.' },
      { say: 'Which dish is good here?', local: '这里什么菜好吃？', roman: 'Zhèlǐ shénme cài hǎochī?', why: 'Food is the safest and happiest topic in China.' },
      { say: 'Where is your hometown?', local: '你老家是哪里？', roman: 'Nǐ lǎojiā shì nǎlǐ?', why: 'Many people moved for work and love talking about home.' },
      { say: 'I am learning a little Chinese.', local: '我在学一点中文', roman: 'Wǒ zài xué yīdiǎn zhōngwén', why: 'Any attempt at Mandarin earns smiles and patience.' },
      { say: 'What should I see in this city?', why: 'Local pride runs deep. You will get a full itinerary.' },
    ],
    topics: ['Food', 'Hometowns', 'Travel in China', 'Family and children', 'Tea', 'Basketball and football'],
    avoid: [
      { topic: 'Taiwan, Tibet and Hong Kong', why: 'These are political red lines. Stay neutral and change the subject.' },
      { topic: 'Criticising the government', why: 'It puts people in an awkward position, especially in public.' },
      { topic: 'Jokes about history or leaders', why: 'What feels light to you can cause a loss of face.' },
    ],
    asked: [
      { q: 'How much do you earn?', a: 'Enough to travel! What about here?', note: 'Money questions are normal curiosity.' },
      { q: 'Are you married?', a: 'Not yet!', note: 'Family comes up fast. A light answer is fine.' },
      { q: 'Do you like Chinese food?', a: 'Yes, especially the dumplings!' },
    ],
    compliments: [
      { say: 'Very delicious!', local: '很好吃！', roman: 'Hěn hǎochī!' },
      { say: 'Your city is so modern.' },
      { say: 'Your tea is excellent.', local: '你的茶很好', roman: 'Nǐ de chá hěn hǎo' },
    ],
  },
  TH: {
    starters: [
      { say: 'Have you eaten yet?', local: 'กินข้าวหรือยัง', roman: 'Gin khao reu yang?', why: 'A friendly greeting more than a real question.' },
      { say: 'What is this dish called?', local: 'อันนี้เรียกว่าอะไร', roman: 'An nee riak wa arai?', why: 'Street food is a passion. Asking makes vendors smile.' },
      { say: 'Where is good to visit nearby?', why: 'Thais are proud of their islands, temples and markets.' },
      { say: 'Not too spicy, please!', local: 'เผ็ดนิดหน่อย', roman: 'Phet nit noi', why: 'Honest and funny. Spice levels are a shared joke.' },
      { say: 'Thailand is so beautiful.', local: 'เมืองไทยสวยมาก', roman: 'Mueang Thai suay mak', why: 'A simple compliment opens doors.' },
    ],
    topics: ['Food and markets', 'Islands and travel', 'Family', 'Muay Thai and football', 'Festivals like Songkran', 'Your home country'],
    avoid: [
      { topic: 'The monarchy', why: 'Never criticise or joke about the royal family. It is also against the law.' },
      { topic: 'Politics and the military', why: 'Recent history is divisive.' },
      { topic: 'Jokes about Buddhism', why: 'Images of the Buddha and monks are deeply respected.' },
    ],
    asked: [
      { q: 'Where are you from?', a: '{home}! Have you heard of it?' },
      { q: 'Can you eat spicy food?', a: 'A little spicy, please!' },
      { q: 'Are you married?', a: 'Not yet!', note: 'Personal questions are friendly here.' },
    ],
    compliments: [
      { say: 'Very delicious!', local: 'อร่อยมาก', roman: 'Aroi mak' },
      { say: 'Everyone is so friendly.' },
      { say: 'Your temple is beautiful.' },
    ],
  },
  IN: {
    starters: [
      { say: 'Which dish is famous here?', why: 'Every region has its pride dish. This opens a long, happy conversation.' },
      { say: 'Do you follow cricket?', why: 'Cricket is close to a religion. Even a little interest goes a long way.' },
      { say: 'Which part of India are you from?', why: 'Regional identity is strong and people love explaining it.' },
      { say: 'Which festival is coming up?', why: 'Diwali, Holi, Eid, Pongal: people love to share how they celebrate.' },
      { say: 'Which film should I watch?', why: 'Bollywood and regional cinema are national pastimes.' },
    ],
    topics: ['Food', 'Cricket', 'Family', 'Films and music', 'Festivals', 'Travel in India'],
    avoid: [
      { topic: 'Religion and caste', why: 'Deeply personal and sometimes divisive. Listen if it comes up.' },
      { topic: 'Pakistan and Kashmir', why: 'Politically charged for many people.' },
      { topic: 'Poverty comparisons', why: 'It can feel like judgement of the whole country.' },
    ],
    asked: [
      { q: 'Are you married?', a: 'Not yet, but my family asks too!', note: 'A normal question, often early.' },
      { q: 'What is your salary?', a: 'Enough to travel to India! What about you?', note: 'Curiosity, not rudeness.' },
      { q: 'India or {home}, which is better?', a: 'Both, for different reasons. India wins on food!' },
    ],
    compliments: [
      { say: 'Very tasty!', local: 'बहुत स्वादिष्ट!', roman: 'Bahut swadisht!' },
      { say: 'Your home is so welcoming.' },
      { say: 'Your city is full of life.' },
    ],
  },
  AE: {
    starters: [
      { say: 'How are you, how is the family?', local: 'كيف الحال؟ كيف العائلة؟', roman: 'Kayf al-hal? Kayf al-aila?', why: 'Asking after family in general terms is warm and expected.' },
      { say: 'What should I see in the city?', why: 'People are proud of how fast the country has grown.' },
      { say: 'This coffee is wonderful.', why: 'Hospitality is central. Praising it is always welcome.' },
      { say: 'Do you follow football?', why: 'A safe, lively topic across the Gulf.' },
      { say: 'Where are you from originally?', why: 'Most residents come from elsewhere. Their story is a great conversation.' },
    ],
    topics: ['Family, in general', 'Food and coffee', 'Football', 'Travel', 'The city’s growth', 'Desert trips'],
    avoid: [
      { topic: 'Religion debates', why: 'Respectful questions are fine. Arguments are not.' },
      { topic: 'Politics and the ruling families', why: 'Criticism can have legal consequences.' },
      { topic: 'A man’s wife or daughters', why: 'Ask after the family in general, not female relatives by name.' },
    ],
    asked: [
      { q: 'Where are you from?', a: '{home}. It is my first time in the Emirates.' },
      { q: 'Do you like it here?', a: 'Very much. The hospitality is amazing.' },
      { q: 'Have you tried our food?', a: 'Yes, and the dates are delicious!' },
    ],
    compliments: [
      { say: 'Your hospitality is famous for a reason.' },
      { say: 'May God bless it.', local: 'ما شاء الله', roman: 'Mashallah', },
      { say: 'This coffee is delicious.' },
    ],
  },
  TR: {
    starters: [
      { say: 'Where are you from in Turkey?', local: 'Nerelisiniz?', why: 'Hometowns matter a lot, and every region has its food.' },
      { say: 'Which team do you support?', why: 'Galatasaray, Fenerbahçe, Beşiktaş: football rivalries are a guaranteed conversation.' },
      { say: 'What should I have for breakfast?', why: 'Turkish breakfast is a point of pride. Expect a long answer.' },
      { say: 'Where is the best kebab around here?', why: 'Everyone has a favourite spot.' },
      { say: 'Your country is beautiful.', local: 'Ülkeniz çok güzel', why: 'A sincere compliment starts many friendships.' },
    ],
    topics: ['Food and breakfast', 'Football', 'Family', 'History and travel', 'Tea and coffee', 'Your home country'],
    avoid: [
      { topic: 'Politics and the Kurdish issue', why: 'Divisive and sensitive with people you do not know well.' },
      { topic: 'Criticising Atatürk', why: 'He is deeply respected. It can also be illegal.' },
      { topic: 'Cyprus and Armenia', why: 'Highly sensitive. Let your host lead if it comes up.' },
    ],
    asked: [
      { q: 'Are you married?', a: 'Not yet, inşallah!', note: 'Asked early and kindly.' },
      { q: 'Do you like Turkey?', a: 'Çok güzel, very beautiful!' },
      { q: 'Have you tried Turkish coffee?', a: 'Yes! Can you read my fortune in the cup?' },
    ],
    compliments: [
      { say: 'Health to your hands (after a meal).', local: 'Elinize sağlık' },
      { say: 'Very beautiful!', local: 'Çok güzel!' },
      { say: 'Turkish breakfast is the best.' },
    ],
  },
  AZ: {
    starters: [
      { say: 'How are you?', local: 'Necəsiniz?', roman: 'Nechasiniz?', why: 'A polite opener. Expect questions about you in return.' },
      { say: 'Plov or dolma, which should I try first?', why: 'Food pride is strong and everyone has an opinion.' },
      { say: 'Is it true Baku is the city of winds?', why: 'People love talking about the khazri wind and their city.' },
      { say: 'Which region is your family from?', why: 'Sheki, Ganja, Lankaran: regional roots matter.' },
      { say: 'I would love to hear some mugham.', why: 'Mugham music and carpets are a source of national pride.' },
    ],
    topics: ['Food: plov, dolma, qutab', 'Family', 'Football', 'Mugham and music', 'Travel in Azerbaijan', 'Tea'],
    avoid: [
      { topic: 'Armenia and Karabakh', why: 'A painful, personal topic. Listen if someone raises it.' },
      { topic: 'Politics and the government', why: 'People may not want to discuss it with strangers.' },
      { topic: 'Comparing Azerbaijan to Iran or Russia', why: 'Azerbaijanis have a distinct identity.' },
    ],
    asked: [
      { q: 'Are you married?', a: 'Not yet, inshallah!', note: 'Family questions are a way of caring.' },
      { q: 'Do you like Azerbaijani food?', a: 'Very much, the plov is incredible!' },
      { q: 'How do you find Baku?', a: 'Beautiful, especially the Old City at night.' },
    ],
    compliments: [
      { say: 'Health to your hands (after food).', local: 'Əlinizə sağlıq', roman: 'Alinize saghliq' },
      { say: 'Baku is beautiful at night.' },
      { say: 'Your hospitality is amazing.' },
    ],
  },
  GE: {
    starters: [
      { say: 'To victory! (cheers)', local: 'გაუმარჯოს!', roman: 'Gaumarjos!', why: 'Georgian dinners are built around toasts.' },
      { say: 'Which wine should I try?', why: 'Georgia has made wine for 8000 years. Ask about qvevri wine.' },
      { say: 'Khachapuri or khinkali?', why: 'A playful food debate everyone joins.' },
      { say: 'Which region should I visit?', why: 'Kazbegi, Svaneti, Kakheti: people love to recommend their mountains.' },
      { say: 'Is it true you have your own alphabet?', why: 'The Georgian script is a source of pride.' },
    ],
    topics: ['Wine and food', 'Mountains and travel', 'Rugby and football', 'Family', 'The alphabet and history', 'Polyphonic singing'],
    avoid: [
      { topic: 'Russia and the 2008 war', why: 'Many families were affected. Avoid casual remarks.' },
      { topic: 'Calling Georgia ex-Soviet', why: 'It erases a long, separate history.' },
      { topic: 'Religion jokes', why: 'Orthodox faith is important to many people.' },
    ],
    asked: [
      { q: 'Do you like Georgian wine?', a: 'Very much! Gaumarjos!' },
      { q: 'Will you stay for dinner?', a: 'With pleasure, thank you.', note: 'Expect a feast, not a snack.' },
      { q: 'Where are you from?', a: '{home}. Georgia feels like a second home already.' },
    ],
    compliments: [
      { say: 'Delicious!', local: 'გემრიელია!', roman: 'Gemrielia!' },
      { say: 'Georgian hospitality is legendary.' },
      { say: 'Tbilisi is beautiful.' },
    ],
  },
  FR: {
    starters: [
      { say: 'Hello! What do you recommend?', local: 'Bonjour ! Qu’est-ce que vous recommandez ?', why: 'Start with bonjour, then ask. It works in cafés, shops and markets.' },
      { say: 'Which region are you from?', why: 'Regional pride is strong, especially about food.' },
      { say: 'Where is the best bakery around here?', why: 'Everyone has a favourite boulangerie.' },
      { say: 'I am trying to learn French.', local: 'J’essaie d’apprendre le français', why: 'Effort earns patience. Start in French, even badly.' },
      { say: 'Have you seen any good films lately?', why: 'Cinema, books and art are favourite topics.' },
    ],
    topics: ['Food and wine', 'Cinema and books', 'Art and history', 'Travel in France', 'Football and cycling', 'A good debate'],
    avoid: [
      { topic: 'Money and salaries', why: 'Considered private and a bit vulgar.' },
      { topic: 'Politics with strangers', why: 'Opinions run strong. Wait until you know people.' },
      { topic: 'Comparing France unfavourably to the US', why: 'It rarely lands well.' },
    ],
    asked: [
      { q: 'Do you speak French?', a: 'Un petit peu, a little!' },
      { q: 'Do you like French food?', a: 'Oui, j’adore le fromage !' },
      { q: 'What brings you to France?', a: 'The food, the art, and the people.' },
    ],
    compliments: [
      { say: 'It’s delicious!', local: 'C’est délicieux !' },
      { say: 'Paris is beautiful.' },
      { say: 'Your bread is the best.' },
    ],
  },
  IT: {
    starters: [
      { say: 'Which dish is typical here?', why: 'Every town has its own specialty and is proud of it.' },
      { say: 'Where can I find the best coffee?', why: 'Coffee is a ritual. People have strong opinions.' },
      { say: 'Which team do you support?', why: 'Football is a passion everywhere in Italy.' },
      { say: 'What a beautiful city!', local: 'Che bella città!', why: 'Italians love their towns and enjoy hearing it.' },
      { say: 'What is your favourite pasta?', why: 'A friendly debate with no wrong answer, almost.' },
    ],
    topics: ['Food and regional dishes', 'Football', 'Family', 'Art and history', 'Travel in Italy', 'Coffee'],
    avoid: [
      { topic: 'Mafia stereotypes', why: 'Tired and offensive to most Italians.' },
      { topic: 'Politics', why: 'Divisive and fast-changing.' },
      { topic: 'Mocking Italian food rules', why: 'Pineapple pizza jokes are fine once, not twice.' },
    ],
    asked: [
      { q: 'Do you like Italian food?', a: 'Of course! Everything is buonissimo.' },
      { q: 'Have you tried real pizza?', a: 'Not yet, where should I go?' },
      { q: 'Where are you from?', a: '{home}. Have you been?' },
    ],
    compliments: [
      { say: 'Delicious!', local: 'Buonissimo!' },
      { say: 'What a beautiful city!', local: 'Che bella città!' },
      { say: 'Your coffee is perfect.' },
    ],
  },
  DE: {
    starters: [
      { say: 'Is this seat free?', local: 'Ist hier noch frei?', why: 'The natural opener at beer gardens, trains and long tables.' },
      { say: 'What should I see in this city?', why: 'People are happy to give precise, honest tips.' },
      { say: 'Which beer is local here?', why: 'Every region has its own brews and traditions.' },
      { say: 'Where do you like to go hiking?', why: 'Nature and weekends outdoors are big in Germany.' },
      { say: 'Which club do you support?', why: 'Bundesliga football is a safe, lively topic.' },
    ],
    topics: ['Travel and hiking', 'Football', 'Beer and food', 'Cars and engineering', 'Work and studies', 'Your home country'],
    avoid: [
      { topic: 'Nazi jokes', why: 'Never funny, and some gestures are illegal.' },
      { topic: 'Salaries', why: 'Money is private.' },
      { topic: 'Very personal questions early', why: 'Germans open up slowly. Small talk stays light at first.' },
    ],
    asked: [
      { q: 'What do you do?', a: 'I work in design. What about you?', note: 'Work questions are normal small talk.' },
      { q: 'How do you like Germany?', a: 'A lot. Everything runs so well.', note: 'Honest answers are appreciated.' },
      { q: 'Where are you from?', a: '{home}. It is my first time here.' },
    ],
    compliments: [
      { say: 'Very tasty!', local: 'Sehr lecker!' },
      { say: 'Everything runs so well here.' },
      { say: 'Your city is beautiful and green.' },
    ],
  },
  GB: {
    starters: [
      { say: 'Lovely weather today, isn’t it?', why: 'Weather is the national opener, ironic or not.' },
      { say: 'Can I get you a drink?', why: 'At the pub, offering a round is the friendliest start.' },
      { say: 'Which football team do you support?', why: 'Club loyalty is a reliable topic. Pick sides carefully.' },
      { say: 'Any tips for the city?', why: 'People enjoy recommending their local favourites.' },
      { say: 'Have you been busy?', why: 'A gentle, open question that suits any setting.' },
    ],
    topics: ['The weather', 'Football', 'Travel', 'TV and music', 'Pubs and food', 'Your home country'],
    avoid: [
      { topic: 'Money and salaries', why: 'Considered private.' },
      { topic: 'Class', why: 'A touchy subject, rarely discussed openly.' },
      { topic: 'Politics with strangers', why: 'Opinions differ sharply. Wait until you know people.' },
    ],
    asked: [
      { q: 'You alright?', a: 'Yeah, good thanks, you?', note: 'It just means hello.' },
      { q: 'How are you finding London?', a: 'Brilliant, though it rains a lot!' },
      { q: 'Where are you from?', a: '{home}. Have you been?' },
    ],
    compliments: [
      { say: 'Brilliant, thank you!' },
      { say: 'This pub is lovely.' },
      { say: 'That was really kind of you.' },
    ],
  },
  US: {
    starters: [
      { say: 'Hi, how’s it going?', why: 'The universal opener. A quick good, you? is enough.' },
      { say: 'What do you do?', why: 'Work is a normal first question in the US.' },
      { say: 'Any food spots you love around here?', why: 'People love sharing their favourite places.' },
      { say: 'Are you following the game?', why: 'Sports are a safe and lively topic.' },
      { say: 'Where are you from originally?', why: 'People move a lot. Everyone has a story.' },
    ],
    topics: ['Work and careers', 'Sports', 'Food and restaurants', 'Travel', 'Movies and TV', 'Your home country'],
    avoid: [
      { topic: 'Politics and religion', why: 'These can divide quickly.' },
      { topic: 'Guns', why: 'Strong opinions on all sides.' },
      { topic: 'Exact money talk', why: 'Asking what someone earns or paid feels intrusive.' },
    ],
    asked: [
      { q: 'How are you?', a: 'Good, thanks! You?', note: 'A greeting, not a real question.' },
      { q: 'Where are you from?', a: '{home}! Have you heard of it?' },
      { q: 'How do you like it here?', a: 'It’s awesome. Everyone is so friendly.' },
    ],
    compliments: [
      { say: 'That’s awesome!' },
      { say: 'Thanks so much, I appreciate it.' },
      { say: 'Great recommendation!' },
    ],
  },
  BR: {
    starters: [
      { say: 'All good?', local: 'Tudo bem?', why: 'The everyday hello. Reply tudo bom!' },
      { say: 'Which team do you support?', why: 'Football is everything. Ask, then listen.' },
      { say: 'What should I try here?', why: 'Feijoada, pão de queijo, açaí: food pride is real.' },
      { say: 'Can you teach me a samba step?', why: 'Playful and warm. Brazilians love to dance and laugh.' },
      { say: 'Where should I go tonight?', why: 'Nightlife and music recommendations come easily.' },
    ],
    topics: ['Football', 'Music and dance', 'Beaches and travel', 'Food', 'Family', 'Carnival'],
    avoid: [
      { topic: 'Crime and poverty stereotypes', why: 'Brazil is much more than the headlines.' },
      { topic: 'Calling Brazilians Spanish speakers', why: 'They speak Portuguese and it is a sore point.' },
      { topic: 'Politics', why: 'Deeply divided right now.' },
    ],
    asked: [
      { q: 'Do you like Brazil?', a: 'Adoro! I love it.' },
      { q: 'Do you speak Portuguese?', a: 'Um pouquinho, a little!' },
      { q: 'Which team do you support?', a: 'I am still choosing. Which one should I pick?' },
    ],
    compliments: [
      { say: 'How beautiful!', local: 'Que lindo!' },
      { say: 'Brazilians are so warm.' },
      { say: 'The food is amazing!', local: 'A comida é maravilhosa!' },
    ],
  },
};
