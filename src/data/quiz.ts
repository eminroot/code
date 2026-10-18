import type { Quiz } from '@/data/types';

// One question per scene. When a scene has an avoid version, wrong[0] is that
// mistake, so picking it plays the scene going wrong.
export const QUIZ: Record<string, Quiz> = {
  // Azerbaijan
  'az-greet': { q: 'You meet an older man in Baku. He holds out his hand.', right: 'Shake with your right hand and look at him', wrong: ['Give him a fist bump', 'Nod and keep your hands in your pockets'] },
  'az-women': { q: 'You are introduced to a woman at a family dinner.', right: 'Wait and see if she offers her hand', wrong: ['Hold out your hand first', 'Kiss her on the cheek'] },
  'az-tea': { q: 'Your host asks you to sit down for tea.', right: 'Accept the tea and sit after the elders', wrong: ['Say no thanks, you just had coffee', 'Take the best seat before anyone else'] },
  'az-point': { q: 'You want to show your friend the woman who runs the shop.', right: 'Gesture towards her with an open hand', wrong: ['Point at her with one finger'] },
  // Turkey
  'tr-greet': { q: 'A Turkish friend comes over to greet you at a party.', right: 'Lean in for a kiss on each cheek', wrong: ['A firm handshake and a step back', 'Wave from where you stand'] },
  'tr-ok': { q: 'Your host asks if you liked the meal. It was great.', right: 'Give a thumbs up and smile', wrong: ['Make the OK sign with your fingers'] },
  'tr-no': { q: 'You ask a shopkeeper for a smaller size. She lifts her chin and clicks her tongue.', right: 'She means no', wrong: ['She means yes', 'She wants you to wait'] },
  'tr-tea': { q: 'A carpet seller offers you a glass of tea.', right: 'Accept it, even if you are not buying', wrong: ['Refuse, so he does not expect a sale', 'Ask for it in a paper cup to go'] },
  // Georgia
  'ge-greet': { q: 'A Georgian friend leans in to greet you.', right: 'One kiss, on the right cheek', wrong: ['Two kisses, left cheek first', 'A pat on the back'] },
  'ge-meet': { q: 'You meet a business contact in Tbilisi for the first time.', right: 'Say gamarjoba and give a firm handshake', wrong: ['Kiss him on the cheek', 'Bow from the waist'] },
  // Japan
  'jp-greet': { q: 'Your Japanese host stops in front of you and starts to bow.', right: 'Bow back, a little less deeply', wrong: ['Reach out for a handshake', 'Go in for a hug'] },
  'jp-card': { q: 'You swap business cards with a new contact in Tokyo.', right: 'Give and take cards with both hands, then read it', wrong: ['Hand yours over with one hand', 'Write a note on their card and pocket it'] },
  'jp-point': { q: 'Someone asks you where the station is.', right: 'Show the way with an open hand', wrong: ['Point with one finger'] },
  'jp-beckon': { q: 'You want the waiter to come to your table.', right: 'Palm down, wave your fingers towards you', wrong: ['Curl one finger towards you', 'Whistle to get their attention'] },
  'jp-train': { q: 'Your phone rings on a busy Tokyo train.', right: 'Let it ring out and text back', wrong: ['Answer and keep it short', 'Answer on speaker'] },
  'jp-gift': { q: 'You bring a small gift to dinner at a Japanese home.', right: 'Offer it with both hands and a small bow', wrong: ['Leave it on the table without a word', 'Ask them to open it in front of you'] },
  // South Korea
  'kr-greet': { q: 'An older man in Seoul offers you his hand.', right: 'Bow slightly and support your right arm with your left hand', wrong: ['Grip hard and pat his shoulder', 'Shake with one hand, the other in your pocket'] },
  'kr-thanks': { q: 'The cashier bows and thanks you as you pay.', right: 'Give a short bow back and say gamsahamnida', wrong: ['Leave a tip on the counter', 'Walk out without a word'] },
  'kr-gift': { q: 'You give a present to your friend’s grandmother.', right: 'Hold it in both hands and bow slightly', wrong: ['Pass it over with one hand', 'Put it on her lap without a word'] },
  'kr-beckon': { q: 'You want your friend across the café to come over.', right: 'Palm down, wave your fingers towards you', wrong: ['Curl one finger upwards'] },
  // China
  'cn-greet': { q: 'You meet a group of Chinese colleagues for the first time.', right: 'Greet the most senior person first, with a gentle handshake', wrong: ['Start with whoever is closest', 'Hug the person who invited you'] },
  'cn-card': { q: 'You swap business cards with a client in Shanghai.', right: 'Use both hands, then read their card', wrong: ['Flick yours across with one hand'] },
  'cn-gift': { q: 'You are wrapping a gift for your Chinese host.', right: 'Use red or gold paper', wrong: ['Use white paper', 'Use black paper'] },
  'cn-point': { q: 'You want to show your guide who you are talking about.', right: 'Gesture with an open hand, palm up', wrong: ['Point at them with one finger'] },
  // Thailand
  'th-wai': { q: 'Your Thai host greets you with palms pressed together.', right: 'Return the wai and say sawasdee', wrong: ['Reach for a handshake', 'Give a high five'] },
  'th-head': { q: 'A Thai friend helps you find your way. You want to thank him.', right: 'Smile, nod and say thank you', wrong: ['Pat him on the head'] },
  'th-point': { q: 'You want to show a staff member which bag is yours.', right: 'Use your whole hand, palm up', wrong: ['Point with one finger', 'Nudge it with your foot'] },
  'th-beckon': { q: 'You want to call a waiter over in Bangkok.', right: 'Palm down, wave your fingers towards you', wrong: ['Curl one finger upwards', 'Snap your fingers'] },
  // India
  'in-namaste': { q: 'You are introduced to a woman at an office in Delhi.', right: 'Palms together, a slight bow and namaste', wrong: ['Hold out your hand to shake', 'Kiss her on the cheek'] },
  'in-hand': { q: 'You pay a street vendor in Mumbai.', right: 'Hand the money over with your right hand', wrong: ['Pass it with your left hand'] },
  'in-wobble': { q: 'You ask if the train stops here. The man tilts his head side to side.', right: 'He means yes', wrong: ['He means no', 'He is not sure'] },
  'in-point': { q: 'You want to show your friend the person who helped you.', right: 'Gesture with your whole hand or your chin', wrong: ['Point your finger at them'] },
  // United Arab Emirates
  'ae-greet': { q: 'A man in Dubai greets you with as-salamu alaykum.', right: 'Reply wa alaykum as-salam and shake with your right hand', wrong: ['Shake with your left hand', 'Give him a quick hug'] },
  'ae-women': { q: 'You meet someone of the other gender at a meeting in Abu Dhabi.', right: 'Wait. If they place a hand on their heart, do the same', wrong: ['Reach out to shake hands'] },
  'ae-beckon': { q: 'You need your driver to come over.', right: 'Palm down, wave your fingers towards you', wrong: ['Curl one finger upwards'] },
  'ae-photo': { q: 'You want a photo of a man in traditional dress at the souk.', right: 'Ask first and wait for a clear yes', wrong: ['Take it quickly without asking'] },
  'ae-hand': { q: 'You pay for coffee in Dubai.', right: 'Pass the money with your right hand', wrong: ['Pass it with your left hand'] },
  // France
  'fr-bise': { q: 'A French friend leans in to greet you.', right: 'A light kiss by each cheek', wrong: ['A big hug', 'A bow'] },
  'fr-meet': { q: 'You meet a new client in Paris.', right: 'Say bonjour monsieur and give a short, firm handshake', wrong: ['Go for la bise', 'Use his first name and tu straight away'] },
  'fr-shop': { q: 'You walk into a small bakery in Lyon.', right: 'Say bonjour before anything else', wrong: ['Point at the bread and say one please', 'Browse quietly until you are ready'] },
  // Italy
  'it-talk': { q: 'Your Italian colleague waves their hands while making a point.', right: 'Listen. Big gestures are normal, not anger', wrong: ['Ask them to calm down', 'Step back, they seem upset'] },
  'it-bise': { q: 'An Italian friend leans in to greet you.', right: 'Two kisses, usually left first', wrong: ['One kiss on the right', 'A handshake only'] },
  'it-meet': { q: 'You meet your host’s father in Rome.', right: 'Buongiorno, a confident handshake, and Signor with his surname', wrong: ['Ciao and his first name', 'A wave from across the table'] },
  // Germany
  'de-meet': { q: 'You meet your new manager in Berlin.', right: 'Stand, a firm handshake, eye contact, and your surname', wrong: ['A soft handshake while you look away', 'Stay seated and wave'] },
  'de-wave': { q: 'You see a colleague at the far end of the office.', right: 'A short wave and a smile', wrong: ['Walk over to shake hands straight away', 'Call out their name across the room'] },
  // United Kingdom
  'gb-meet': { q: 'You meet your flatmate’s father in London.', right: 'Hello, nice to meet you, and a short handshake', wrong: ['Two kisses on the cheeks', 'A long hug'] },
  'gb-v': { q: 'You order two drinks at a pub using your fingers.', right: 'Two fingers up, palm facing out', wrong: ['Two fingers up, back of the hand facing them'] },
  // United States
  'us-meet': { q: 'You meet a new colleague in New York.', right: 'Smile, a firm handshake, and repeat their name', wrong: ['A light, quick touch of hands', 'A bow'] },
  'us-wave': { q: 'You see a coworker across the room.', right: 'A quick wave and a smile', wrong: ['Pretend you did not see them', 'Shout their name'] },
  // Brazil
  'br-greet': { q: 'A Brazilian woman you just met leans in to greet you.', right: 'Lean in for a kiss on the cheek', wrong: ['Step back and offer a handshake', 'Bow your head'] },
  'br-ok': { q: 'Your Brazilian friend asks if everything is all right.', right: 'Give a thumbs up', wrong: ['Make the OK sign'] },
  'br-talk': { q: 'A Brazilian colleague stands very close while you chat.', right: 'Stay where you are', wrong: ['Take a step back', 'Fold your arms'] },
};
