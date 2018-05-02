# PubMiner

### Running PubMiner Locally
#### Install Required Software and Tools
 - Install `Node.js®` and `npm` (node package manager). The installer at [nodejs.org](https://nodejs.org) will handle both of those for you
 - Install Bower globally `npm install -g bower`
 - Install the gulp command line tools globally `npm install -g gulp-cli`

#### Install and Build Application Dependencies
 - Clone the source code repository: `git clone <url> <project directory name>`
 - Ensure you are in the project directory
 - Run `npm install` to install the server-side dependencies (`express`, `pug`, `xml-simple`, etc.)
 - Run `bower install` to install client-side dependencies (`PatternFly`, `jQuery`)
 - Run `gulp` to build `pmstyles.css` and automatically have it copied to the `public/css` folder

#### Start the Application
 - Ensure you are in the project directory
 - Run `npm start` to start the server on port `8081`
    - If you'd like to change the port to something different, you can modify the `bin\www` file
    - To start in development mode, run `npm run start-dev` instead. In development mode, source changes are detected and the server automatically restarts. Also, the browser developer tools will display a Node.js icon that will allow you to debug server side code
 - In your browser, navigate to [http://localhost:8081](http://localhost:8081)

### Running PubMiner in the Cloud
#### Setup
 - Create a new virtual machine for the application on the cloud provider of choice (e.g. AWS, Digital Ocean). Details vary by provider.
 - Connect to a terminal window for the virtual machine.
 - Follow the steps "Required Software and Tools" and "Install and Build Application Dependencies" above.
 - Install Forever globally `npm install -g forever`.  Forever will start an application and automatically restart an application that has crashed.

#### Start the Application
 - Connect to a terminal window for the virtual machine.
 - Start the application using Forever: `forever start ./bin/www`
 - View the details using: `forever list`. This will show the uid, log file location, and uptime.

#### Update the Running Code
 - Connect to a terminal window for the virtual machine.
 - Find the uid assigned to the application: `forever list`
 - Stop the application: `forever stop <uid>`
 - Switch to the project directory
 - Refresh the source code from GitHub: `git pull origin master`
 - Install any new dependencies: `npm install`
 - Generate the .css: `gulp`
 - Start the application: `forever start ./bin/www`

### Additional Information
#### Running Integration Tests with Cypress
 - ensure the application and database are running
 - run `npm run cypress:open`
 - select `search_spec.js` or `home_spec` from the Integration Test list. The tests should automatically start executing

#### Running Unit Tests with Mocha
- ensure the application and database are running
- run `npm run mocha`
- results are logged to the console

#### PubMed API key
The app will recognize a PubMed API key stored as configuration value. The PubMed API key should be put in `local.json` on the deployed machine under the `config` folder. The example below shows how to provide the API key for the application to use in service calls.
```
<root>/config/local.json
```
```
{
  "PubMedService": {
    "queryOptions": {
      "api_key": "<your-api-key-here>"
    }
  }
}
```
The project's `.gitignore` file is configured to not permit check-in of `local.json`.

#### Building pmstyles.css
PatternFly uses [Less](http://lesscss.org/) to compile PatternFly and Bootstrap style elements and project-specific
styles into a single .css file. The project file less\\pmstyles.less describes how the target css file is assembled, and is the place to add additional PubMiner-specific styles.

The project uses [gulp](https://gulpjs.com/) to compile the Less script. To build pmstyles.css, install the gulp command line tools globally `npm install -g gulp-cli`. You may also need to run `npm install` within the project folder to update the project-specific dependencies (like gulp, gulp-less and gulp-plumber). Once the dependencies are installed, you simply run `gulp` in the project folder to build pmstyles.css and automatically copy it to the \\public\\css folder.
