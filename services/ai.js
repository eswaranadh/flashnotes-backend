const cheerio = require('cheerio');
const { Configuration, OpenAIApi } = require('openai');

// Set up your OpenAI API credentials
const apiKey = require('../config/backendconfig.json').openAiKey;

const config = new Configuration({
    apiKey: apiKey,
});


const openai = new OpenAIApi(config);

class AI {
    static async generateFlashcardsFromNotes(notes) {
        const $ = cheerio.load(notes);
        const text = $('body').text();

        try {
            const messages = [
                {
                    role: "user",
                    content: "Generate maximum possible flash cards for the following notes(only for given notes) in the format of Front: \n Back: \n\n" + text
                }
            ]
            const chatCompletion = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages,
            });
            // console.log(chatCompletion.data.choices[0].message.content);

            const flashcards = [];
            // Extract "Front" and "Back" values from the content
            chatCompletion.data.choices[0].message.content.split('\n\n').forEach((card) => {
                const front = card.match(/Front: (.*)/)?.[1] ?? '';
                const back = card.match(/Back: (.*)/)?.[1] ?? '';
                if (front && back)
                    flashcards.push({ front, back });
            });

            return flashcards;
        } catch (error) {
            console.error(error.config);
            return [];
        }
    }



}

module.exports = AI;


// const notes = `

// The Leitner system is a widely used method of efficiently using flashcards that was proposed by the German science journalist Sebastian Leitner in 1972.[4] It is a simple implementation of the principle of spaced repetition, where cards are reviewed at increasing intervals.



// Examples are:

// Three boxes



// Animation of three sessions. Click to enlarge!

// Suppose there are 3 boxes of cards called "Box 1", "Box 2" and "Box 3". The cards in Box 1 are the ones that the learner often makes mistakes with, and Box 3 contains the cards that they know very well. They might choose to study the Box 1 cards once a day, Box 2 every 3 days, and Box 3 cards every 5 days. If they look at a card in Box 1 and get the correct answer, they "promote" it to Box 2. A correct answer with a card in Box 2 "promotes" that card to Box 3. If they make a mistake with a card in Box 2 or Box 3, it gets "demoted" to the first box, which forces the learner to study that card more often.



// The advantage of this method is that the learner can focus on the most difficult flashcards, which remain in the first few groups. The result is, ideally, a reduction in the amount of study time needed.
// `

// const messages = [{ role: "user", content: "Generate flash cards for the following notes in the format of Front: \n Back: \n\n" + notes }];
// AI.generateFlashcardsFromNotes({ messages });