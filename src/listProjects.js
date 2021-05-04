// Dynamically add projects to page
ipc.invoke('listProjects').then((res) => {
    if (Object.keys(res).length == 0) {return;}
    $('#projects').empty();
    console.log(res);
    Object.keys(res).forEach(proj => {
        var name = res[proj].name;
        // spaghetti code assembly line :]
        $('#projects').append("<div class=\"proj-name\" id=\"" + proj + "\" \
        onclick=\"viewProject(\'" + proj + "\')\"> \
        " + name + " \
        <img src=\"icons/arrow-bar-right.svg\" width=\"48\" height=\"48\" draggable=\"false\"> \
        </div>");
    });
});

//TODO: Add search function