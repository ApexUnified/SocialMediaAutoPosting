import axios from 'axios';

const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;
const GOOGLE_TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2';

export const translateContent = async (content, targetLanguages) => {
  try {
    const translations = await Promise.all(
      targetLanguages.map(async (lang) => {
        try {
          const response = await axios.post(
            `${GOOGLE_TRANSLATE_API_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`,
            {
              q: content,
              target: lang
            }
          );

          return {
            language: lang,
            content: response.data.data.translations[0].translatedText
          };
        } catch (error) {
          console.error(`Error translating to ${lang}:`, error);
          return {
            language: lang,
            error: error.message
          };
        }
      })
    );

    // Convert array to object with language codes as keys
    return translations.reduce((acc, translation) => {
      acc[translation.language] = translation.content;
      return acc;
    }, {});
  } catch (error) {
    console.error('Error translating content:', error);
    throw new Error('Failed to translate content');
  }
}; 