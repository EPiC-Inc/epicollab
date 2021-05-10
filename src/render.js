// import the inter-process communication component
const { ipcRenderer: ipc } = require( 'electron' );
window.$ = window.jQuery = require('jquery');

function newProject() {
    // Redirect to page for creating new project
    window.location.href = 'newProject.html';
}

function joinProject() {
    // Pop up dialogue that prompts you for project ID
}

function listProjects() {
    //
    //window.location.href = 'project.html';
    window.location.href = 'listProjects.html';
}

function viewProject( proj_id, proj_name ) {
    window.location.href = 'project.html?id='+proj_id+"&name="+proj_name;
}

function goHome() {
    window.location.href = 'index.html';
}
