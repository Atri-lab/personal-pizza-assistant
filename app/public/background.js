chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fetchPageContent') {
        fetch(request.url)
            .then(response => response.text())
            .then(data => {
                sendResponse({ pageContent: data });
            })
            .catch(error => {
                console.error('Error fetching page content:', error);
                sendResponse({ error: 'Failed to fetch page content' });
            });
        return true; // Keep the messaging channel open for sendResponse
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url.includes('dominos.com')) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        }).then(() => {
            console.log('Content script injected');
        }).catch(error => {
            console.error('Error injecting content script:', error);
        });
    }
});
