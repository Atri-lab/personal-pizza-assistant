const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const API_KEY = 'AIzaSyCL6elvZ52diTQeZAtZLbhzAxFgAm6G6do'; // Replace with your actual API key

export async function callGeminiAPI(userInput, pageContent, currentStep) {
    try {
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: `
                                    User input: ${userInput}.
                                    Current step: ${currentStep}.
                                    Page content: ${pageContent}.
                                    Please respond with a single actionable JSON instruction for a DOM interaction on dominos.com.
                                    Ensure the selector is precise and valid for the current page structure.
                                    Example format:
                                    {
                                        "action": "click",
                                        "selector": "div#entree-BuildYourOwn a.js-buildYourOwnPizza"
                                    }
                                    No additional formatting like backticks.
                                `,
                            },
                        ],
                    },
                ],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response from Gemini API:', errorText);
            throw new Error(`Failed to call Gemini API: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw error;
    }
}