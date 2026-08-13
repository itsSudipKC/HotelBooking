// Retrieval only — there is no LLM call anywhere in this file, only
// deterministic keyword/token matching against data already stored for the
// hotel. "Must not invent an answer" holds by construction, not by prompting.

const STOPWORDS = new Set([
  'the', 'is', 'a', 'an', 'of', 'for', 'to', 'in', 'on', 'at', 'i', 'my', 'you', 'your', 'do', 'does', 'did',
  'what', 'whats', 'when', 'where', 'how', 'can', 'are', 'will', 'with', 'and', 'please', 'tell', 'me', 'have',
  'has', 'it', 'this', 'that', 'be',
  // 'hotel' shows up as filler in nearly every FAQ question — without this it
  // inflates the token-overlap score for questions that have nothing else in
  // common with a given FAQ.
  'hotel',
]);

const tokenize = (text) =>
  (text || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token && !STOPWORDS.has(token));

const overlapScore = (questionTokens, faqTokens) => {
  if (!questionTokens.length || !faqTokens.length) return 0;
  const faqSet = new Set(faqTokens);
  const shared = questionTokens.filter((t) => faqSet.has(t)).length;
  return shared / Math.max(questionTokens.length, faqTokens.length);
};

// "available"/"availability" deliberately excluded on their own — too many
// unrelated questions ("is parking available?") contain that word. Room
// intent only fires when "room(s)" is paired with a qualifier that's
// actually about rooms specifically.
const ROOM_WORDS = new Set(['room', 'rooms']);
const ROOM_QUALIFIERS = new Set(['type', 'types', 'available', 'availability', 'vacancy', 'price', 'cost', 'capacity']);
const AMENITY_KEYWORDS = new Set(['amenity', 'amenities', 'facility', 'facilities']);
const LOCATION_KEYWORDS = new Set(['location', 'address', 'where', 'situated', 'located']);

const FAQ_MATCH_FLOOR = 0.3;

const fallbackAnswer = (hotel) => {
  const phone = hotel.owner?.phone?.trim();
  const contact = phone ? `at: ${phone}` : "via the contact details on this hotel's page";
  return {
    answer: `Sorry, I don't have information about this question. For more information, please contact the hotel owner ${contact}.`,
    matched: false,
  };
};

export const answerQuestion = ({ hotel, rooms = [], question }) => {
  const questionTokens = tokenize(question);
  if (!questionTokens.length) {
    return fallbackAnswer(hotel);
  }

  // Owner-curated FAQ content is checked first — it's the most deliberately
  // targeted answer source, so it should win over the generic structured
  // answers below when both could plausibly apply.
  let best = null;
  for (const faq of hotel.faqs || []) {
    const score = overlapScore(questionTokens, tokenize(faq.question));
    if (!best || score > best.score) best = { score, faq };
  }
  if (best && best.score >= FAQ_MATCH_FLOOR) {
    return { answer: best.faq.answer, matched: true };
  }

  const hasRoomWord = questionTokens.some((t) => ROOM_WORDS.has(t));
  const hasRoomQualifier = questionTokens.some((t) => ROOM_QUALIFIERS.has(t));
  if (hasRoomWord && hasRoomQualifier) {
    if (!rooms.length) {
      return { answer: "This hotel hasn't listed any rooms yet.", matched: true };
    }
    const list = rooms
      .map((r) => `${r.type} (Rs. ${r.price.toLocaleString()}/night, up to ${r.capacity} guest${r.capacity === 1 ? '' : 's'})`)
      .join('; ');
    return { answer: `Available room types: ${list}.`, matched: true };
  }

  if (questionTokens.some((t) => AMENITY_KEYWORDS.has(t))) {
    if (!hotel.amenities?.length) {
      return { answer: 'No amenities have been listed for this hotel yet.', matched: true };
    }
    return { answer: `This hotel offers: ${hotel.amenities.join(', ')}.`, matched: true };
  }

  if (questionTokens.some((t) => LOCATION_KEYWORDS.has(t))) {
    const { street, city, country } = hotel.address || {};
    return { answer: `This hotel is located at ${[street, city, country].filter(Boolean).join(', ')}.`, matched: true };
  }

  return fallbackAnswer(hotel);
};
