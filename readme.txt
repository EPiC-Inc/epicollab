This program is made with electron.js, which is essentially a way to package applications made solely with JS, HTML, and CSS.
My particular program uses a third party file hosting service (currently one I've made that's on my raspberry pi, but could be swapped out for something like Amazon S3) to sync files.
Originally I wanted to do a peer2peer thing but due to time (and expertise) limitations that has not come to fruition, so it uses a centralized system instead.
I have uploaded the source code (here) and an executable version (no viruses, I promise).
To run it from the source, you'll need Node.JS with the node module dependencies specified in package.json.

In order to use it, first create a project with the Add Project button.
On the View Projects page, select the created project
Drag and drop .wav files from your computer to add them to the project and upload them to the dedicated fileserver.
(The fileserver is written in Python, not JS, so I did not include it.)

There were a few features I did not have time to implement due to the ambitious nature of the app:
- a method to delete files
- the 'sync' function does not download the files, though it does update projects.json
- the 'cleanbtn' to clear unused files
- the 'join project' button
