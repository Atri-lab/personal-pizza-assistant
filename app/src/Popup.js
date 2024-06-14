/* global chrome */
import React, { useEffect, useState } from 'react';
import './Popup.css';

function Popup() {
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [listening, setListening] = useState(false);
    const [userInput, setUserInput] = useState('');

    const sizeMapping = {
        "small": "label[data-quid='pizza-size-10']",
        "medium": "label[data-quid='pizza-size-12']",
        "large": "label[data-quid='pizza-size-14']",
        "extra large": "label[data-quid='pizza-size-16']"
    };

    const crustMapping = {
        "small": {
            "hand tossed": "span[data-quid='pizza-builder-crust-name-10HANDTOSS']",
            "gluten free": "span[data-quid='pizza-builder-crust-name-10GLUTENF']"
        },
        "medium": {
            "hand tossed": "span[data-quid='pizza-builder-crust-name-12HANDTOSS']",
            "handmade pan": "span[data-quid='pizza-builder-crust-name-12NPAN']",
            "crunchy thin crust": "span[data-quid='pizza-builder-crust-name-12THIN']",
            "new york style": "span[data-quid='pizza-builder-crust-name-12BK']"
        },
        "large": {
            "hand tossed": "span[data-quid='pizza-builder-crust-name-12HANDTOSS']",
            "crunchy thin crust": "span[data-quid='pizza-builder-crust-name-12THIN']",
            "new york style": "span[data-quid='pizza-builder-crust-name-12BK']"
        },
        "extra large": {
            "new york style": "span[data-quid='pizza-builder-crust-name-12BK']"
        }
    };

    const sauceMapping = {
        "robust inspired": "label[for='sauce-topping-X']",
        "hearty marinara": "label[for='sauce-topping-Xm']",
        "honey bbq": "label[for='sauce-topping-Bq']",
        "garlic parmesan": "label[for='sauce-topping-Xw']",
        "alfredo": "label[for='sauce-topping-Xf']",
        "ranch": "label[for='sauce-topping-Rd']",
        "no sauce": "label[for='sauce-topping-0']"
    };

    const toppingMapping = {
        "ham": "label[data-quid='builder-topping-H-text']",
        "beef": "label[data-quid='builder-topping-B-text']",
        "salami": "label[data-quid='builder-topping-Sa-text']",
        "pepperoni": "label[data-quid='builder-topping-P-text']",
        "italian sausage": "label[data-quid='builder-topping-S-text']",
        "premium chicken": "label[data-quid='builder-topping-Du-text']",
        "bacon": "label[data-quid='builder-topping-K-text']",
        "philly steak": "label[data-quid='builder-topping-Pm-text']",
        "hot buffalo sauce": "label[data-quid='builder-topping-Ht-text']",
        "garlic": "label[data-quid='builder-topping-F-text']",
        "jalapeno peppers": "label[data-quid='builder-topping-J-text']",
        "onions": "label[data-quid='builder-topping-O-text']",
        "banana peppers": "label[data-quid='builder-topping-Z-text']",
        "diced tomatoes": "label[data-quid='builder-topping-Td-text']",
        "black olives": "label[data-quid='builder-topping-R-text']",
        "mushrooms": "label[data-quid='builder-topping-M-text']",
        "pineapple": "label[data-quid='builder-topping-N-text']",
        "cheddar cheese blend": "label[data-quid='builder-topping-E-text']",
        "green peppers": "label[data-quid='builder-topping-G-text']",
        "spinach": "label[data-quid='builder-topping-Si-text']",
        "feta cheese": "label[data-quid='builder-topping-Fe-text']",
        "shredded parmesan asiago": "label[data-quid='builder-topping-Cs-text']"
    };

    useEffect(() => {
        const speak = (text) => {
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        };

        setTimeout(() => {
            const welcomeMessage = "Hello! Welcome to your personal pizza assistant. What would you like to order today?";
            speak(welcomeMessage);
            setMessage(welcomeMessage);
            setLoading(false);
        }, 2000);
    }, []);

    const startListening = async () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setMessage("Speech recognition not supported in this browser.");
            return;
        }

        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });

            const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.lang = 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                console.log("Speech recognition started");
                setListening(true);
            };

            recognition.onresult = (event) => {
                console.log("Speech recognition result received");
                const speechResult = event.results[0][0].transcript;
                setUserInput(speechResult);
                setMessage(`You said: ${speechResult}`);
                setListening(false);

                handleUserInput(speechResult);
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setMessage("An error occurred during speech recognition: " + event.error);
                setListening(false);
            };

            recognition.onend = () => {
                console.log("Speech recognition ended");
                setListening(false);
            };

            recognition.start();
        } catch (error) {
            console.error("Error starting speech recognition:", error);
            setMessage("An error occurred: " + error.message);
        }
    };

    const handleUserInput = async (userInput) => {
        setLoading(true);
        setMessage("Processing your order...");
        console.log('Handling user input:', userInput);

        const steps = createSteps(userInput);

        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            const tab = tabs[0];

            if (tab.url.includes('dominos.com')) {
                console.log("Sending steps to content script", steps);
                chrome.tabs.sendMessage(tab.id, { action: 'executeSteps', steps: steps }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("Error sending message to content script:", chrome.runtime.lastError.message);
                        setMessage("Failed to process your order. Please try again.");
                        setLoading(false);
                        return;
                    }

                    if (response && response.success) {
                        setMessage("Order processed successfully!");
                    } else {
                        setMessage("Failed to process your order. Please try again.");
                    }
                    setLoading(false);
                });
            } else {
                setMessage("Please open dominos.com to use this feature.");
                setLoading(false);
            }
        });
    };

    const createSteps = (userInput) => {
        const steps = [
            { action: 'click', selector: 'a.js-buildYourOwnPizza' },
            { action: 'wait', timeout: 2000 },
            { action: 'click', selector: 'button[data-quid="start-from-scratch"]' },
            { action: 'wait', timeout: 2000 },
        ];

        // Determine the size
        const size = Object.keys(sizeMapping).find(key => userInput.includes(key));
        if (size) {
            steps.push({ action: 'click', selector: sizeMapping[size] });
            steps.push({ action: 'wait', timeout: 1000 });
        } else {
            // Default to medium if size is not mentioned
            steps.push({ action: 'click', selector: 'label[data-quid="pizza-size-12"]' });
            steps.push({ action: 'wait', timeout: 1000 });
        }

        // Determine the crust
        const crust = Object.keys(crustMapping[size || "medium"]).find(key => userInput.includes(key));
        if (crust) {
            steps.push({ action: 'click', selector: crustMapping[size || "medium"][crust] });
            steps.push({ action: 'wait', timeout: 1000 });
        } else {
            // Default to Hand Tossed if crust is not mentioned
            steps.push({ action: 'click', selector: "span[data-quid='pizza-builder-crust-name-12HANDTOSS']" });
            steps.push({ action: 'wait', timeout: 1000 });
        }

        // Determine the sauce
        const sauce = Object.keys(sauceMapping).find(key => userInput.includes(key));
        if (sauce) {
            steps.push({ action: 'click', selector: sauceMapping[sauce] });
            steps.push({ action: 'wait', timeout: 1000 });
        } else {
            // Default to Robust Inspired Sauce if sauce is not mentioned
            steps.push({ action: 'click', selector: "label[for='sauce-topping-X']" });
            steps.push({ action: 'wait', timeout: 1000 });
        }

        // Determine the toppings
        Object.keys(toppingMapping).forEach(topping => {
            if (userInput.includes(topping)) {
                steps.push({ action: 'click', selector: toppingMapping[topping] });
                steps.push({ action: 'wait', timeout: 1000 });
            }
        });

        // Add to order
        steps.push({ action: 'click', selector: 'button.single-page-pizza-builder__add-to-order' });

        return steps;
    };

    return (
        <div className="popup">
            <div className="header">
                <h1>Personal Pizza Assistant</h1>
            </div>
            <div className="chatbot">
                <div className="chatbot-message">
                    {loading ? (
                        <div className="loading">Loading...</div>
                    ) : (
                        <div className="message">{message}</div>
                    )}
                </div>
                <button onClick={startListening} disabled={listening}>
                    {listening ? 'Listening...' : 'Reply'}
                </button>
            </div>
        </div>
    );
}

export default Popup;