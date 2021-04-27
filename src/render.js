// 
const { ipcRenderer } = require( 'electron' );

function newProject() {
    // Redirect to page for creating new project
    window.location.href = 'newProject.html';
}

function joinProject() {
    // Pop up dialogue that prompts you for project ID
    
}

function listProjects() {
    //
    window.location.href = 'project.html';
}

function goHome() {
    window.location.href = 'index.html';
}
