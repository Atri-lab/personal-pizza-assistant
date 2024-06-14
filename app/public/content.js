console.log("Content script loaded");

let currentStep = 0;
let steps = [];

function isDominosSite() {
    return window.location.hostname.includes('dominos.com');
}

async function waitForElement(selector, timeout = 10000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        const element = document.querySelector(selector);
        if (element) {
            return element;
        }
        await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    throw new Error(`Element not found for selector: ${selector}`);
}

async function executeInstruction(instruction) {
    console.log("Executing instruction:", instruction);

    const { action, selector, text, url, timeout } = instruction;

    try {
        switch (action) {
            case 'navigate':
                window.location.href = url;
                break;
            case 'wait':
                await new Promise((resolve) => setTimeout(resolve, timeout));
                break;
            case 'click':
                const clickElement = await waitForElement(selector);
                clickElement.click();
                console.log(`Clicked on element with selector: ${selector}`);
                break;
            case 'type':
                const inputElement = await waitForElement(selector);
                inputElement.value = text;
                break;
            default:
                console.error("Unknown action type:", action);
        }
    } catch (error) {
        console.error("Error executing instruction:", error);
    }
}

async function executeNextStep() {
    if (currentStep < steps.length) {
        const instruction = steps[currentStep];
        try {
            await executeInstruction(instruction);
            currentStep++;
            setTimeout(executeNextStep, 1000); // Add a delay between steps
        } catch (error) {
            console.error("Error executing step:", error);
        }
    }
}

if (isDominosSite()) {
    console.log("Content script running on Dominos site");
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log("Received message in content script:", request);
        if (request.action === 'fetchPageContent') {
            const pageContent = document.documentElement.outerHTML;
            sendResponse({ pageContent });
        } else if (request.action === 'executeSteps') {
            steps = request.steps;
            currentStep = 0;
            executeNextStep().then(() => sendResponse({ success: true })).catch(error => {
                console.error("Error executing instruction:", error);
                sendResponse({ success: false, error: error.message });
            });
        }
        return true;
    });
} else {
    console.log("Content script not running on Dominos site");
}