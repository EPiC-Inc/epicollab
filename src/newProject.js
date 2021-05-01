$("#new-project").submit((event) => {
    event.preventDefault();
    // Send a 'newProject' call to the main application process
    ipc.send('newProject', $('#projName').val());
});