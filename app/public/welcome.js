document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');

    const button = document.getElementById('grantAccess');
    if (!button) {
        console.error('Button not found');
        return;
    }

    button.addEventListener('click', () => {
        console.log('Grant Microphone Access button clicked');
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                console.log('Microphone access granted');
                alert('Microphone access granted. You can now use the extension.');
                // Close the welcome tab after granting permission
                window.close();
            })
            .catch(err => {
                console.error('Error accessing microphone:', err);
                alert('Microphone access denied. Please enable it in your browser settings.');
            });
    });
});
