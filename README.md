# PubMiner #

### Instructions for Running Locally ###
 - Install `Node.js®` and `npm` (node package manager). The installer at [nodejs.org](https://nodejs.org) will handle both of those for you
 - Install Bower globally `sudo npm install -g bower`
 - From the project directory, type `npm install` to install the server-side dependencies (express, pug, xml-simple, etc.).
 - From the project directory, type `bower install` to install client-side dependencies (PatternFly, jQuery).
 - From the project directory, type `npm start` to start the server on port `8081`.If you'd like to change the port to something different, you can modify the `bin\www` file.
    - To start in development mode, run `npm run start-dev` instead. In development mode, source changes are detected and the server automatically restarts. Also, the browser developer tools will display a Node.js icon that will allow you to debug server side code.
 - In your browser, navigate to http:\\\\localhost:8081

 ### Instruction For Running PostgreSQL ###
 - [Install Docker Compose](https://docs.docker.com/compose/install/#install-compose)
 - Run `sudo docker-compose up` from pubminer-ui-investigation directory
 - Install psql
 - To interact directly with db, run `psql -h localhost -p 5432 -d pubminer -U root_user --password root_pw`

### PubMed API key
The app will recognize a PubMed API key stored as an environment variable called EUTILS_API_KEY. Alternatively, you can create a file called `.env` in the project root and store environment variables there as key/value pairs, e.g. `EUTILS_API_KEY=aBcDeFgHiJkLmNoPqRsT`. The project's `.gitignore` file is already configured to not allow check-in of `.env`.

### Building pmstyles.css
PatternFly uses [Less](http://lesscss.org/) to compile PatternFly and Bootstrap style elements and project-specific
styles into a single .css file. The project file less\\pmstyles.less describes how the target css file is assembled, and is the place to add additional PubMiner-specific styles.

The project uses [gulp](https://gulpjs.com/) to compile the Less script. To build pmstyles.css, install the gulp command line tools globally `npm install -g gulp-cli`. You may also need to run `npm install` within the project folder to update the project-specific dependencies (like gulp, gulp-less and gulp-plumber). Once the dependencies are installed, you simply run `gulp` in the project folder to build pmstyles.css and automatically copy it to the \\public\\css folder.
