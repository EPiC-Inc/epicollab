// Dynamically add projects to page
ipc.on('projects', (event, arg) => {
    console.log(arg);
    Object.keys(arg).forEach(proj => {
        var name = arg[proj].name;
        // spaghetti code assembly line :]
        $('#projects').append("<div class=\"proj-name\" id=\"" + proj + "\" \
        onclick=\"viewProject(\'" + proj + "\')\"> \
        " + name + " \
        <img src=\"icons/arrow-bar-right.svg\" width=\"48\" height=\"48\"> \
        </div>");
    });
});


ipc.send('listProjects');